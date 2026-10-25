import type { Track } from '@flow/shared'
import { tool } from 'ai'
import { z } from 'zod'
import { usePlaybackStore } from '../player/playbackStore'
import { emitSegmentEnd, emitSegmentStart, PlaybackMode, usePlayerStore } from '../player/playerStore'

export interface MusicLibrary {
  search: (query: string) => Promise<Track[]>
  getTrack: (id: string) => Promise<Track | null>
}

export type MusicTrackSummary = Pick<Track, 'id' | 'title' | 'artist' | 'album'>

export interface MusicSearchContext {
  tracks: MusicTrackSummary[]
}

export enum MusicAction {
  PLAY = 'play',
  PAUSE = 'pause',
  PREVIOUS = 'previousSong',
  NEXT = 'nextSong',
}

export interface MusicActionReceipt {
  action: MusicAction
  status: 'accepted'
  track: MusicTrackSummary | null
  requestedPlaying: boolean
}

export interface MusicToolSession {
  actions: MusicActionReceipt[]
}

export interface MusicToolOptions {
  library: MusicLibrary
  context: MusicSearchContext
  session: MusicToolSession
}

export function summarizeMusicTrack(track: Track): MusicTrackSummary {
  return { id: track.id, title: track.title.slice(0, 200), artist: track.artist.slice(0, 200), album: track.album.slice(0, 200) }
}

function currentTrack() {
  const state = usePlayerStore.getState()
  if (state.playbackMode === PlaybackMode.CLASSIC)
    return state.queue[state.currentIndex]
  return state.programme.slice(state.nowPlayingSegmentIndex).find(segment => segment.kind === 'track')?.track
}

export function createMusicTools(options: MusicToolOptions, signal: AbortSignal) {
  const recovering = options.session.actions.length > 0
  let interrupted = false
  let applying = false
  let tail: Promise<unknown> = Promise.resolve()
  const unsubscribe = usePlayerStore.subscribe((state, previous) => {
    if (!applying && (
      state.isPlaying !== previous.isPlaying || state.playbackMode !== previous.playbackMode || state.mode !== previous.mode
      || state.queue !== previous.queue || state.currentIndex !== previous.currentIndex
      || state.programme !== previous.programme || state.nowPlayingSegmentIndex !== previous.nowPlayingSegmentIndex
    )) {
      interrupted = true
    }
  })

  function checkActive() {
    if (signal.aborted)
      throw new Error('Music request cancelled; no further playback actions allowed')
    if (interrupted)
      throw new Error('Playback changed since this request started; no further playback actions allowed')
  }

  function sequential<T>(operation: () => Promise<T> | T): Promise<T> {
    const result = tail.then(() => {
      checkActive()
      return operation()
    })
    tail = result.catch(() => {})
    return result
  }

  function apply(action: MusicAction, operation: () => void) {
    checkActive()
    if (recovering)
      return { status: 'notExecuted' as const, reason: 'Actions were already issued; retry must not repeat them' }
    if (options.session.actions.length >= 5)
      return { status: 'notExecuted' as const, reason: 'Playback action limit reached for this message' }
    applying = true
    try {
      operation()
      const track = currentTrack()
      const receipt: MusicActionReceipt = {
        action,
        status: 'accepted',
        track: track ? summarizeMusicTrack(track) : null,
        requestedPlaying: usePlayerStore.getState().isPlaying,
      }
      options.session.actions.push(receipt)
      return receipt
    }
    finally {
      applying = false
    }
  }

  function skip(action: MusicAction.PREVIOUS | MusicAction.NEXT) {
    const state = usePlayerStore.getState()
    if (!currentTrack()?.url)
      return { status: 'notExecuted' as const, reason: 'No current song' }

    if (state.playbackMode === PlaybackMode.CLASSIC) {
      return apply(action, () => {
        action === MusicAction.NEXT ? state.next(true) : state.prev()
        usePlaybackStore.getState().setPosition(0)
      })
    }

    const programme = state.programme
    const activeIndex = state.nowPlayingSegmentIndex
    let trackIndex = activeIndex
    while (trackIndex < programme.length && programme[trackIndex]?.kind !== 'track')
      trackIndex++
    const direction = action === MusicAction.NEXT ? 1 : -1
    let target = trackIndex + direction
    while (target >= 0 && target < programme.length && programme[target]?.kind !== 'track')
      target += direction
    if (target >= programme.length)
      return { status: 'notExecuted' as const, reason: 'No next song in the current programme' }
    if (target < 0)
      target = trackIndex // Previous on the first song restarts it.

    return apply(action, () => {
      usePlayerStore.setState({ nowPlayingSegmentIndex: target })
      usePlaybackStore.getState().setPosition(0)
      const started = programme[target]!
      const finished = programme[activeIndex]!
      queueMicrotask(() => {
        const latest = usePlayerStore.getState()
        if (latest.programme !== programme || latest.nowPlayingSegmentIndex !== target)
          return
        if (direction > 0)
          emitSegmentEnd(finished, activeIndex)
        emitSegmentStart(started, target)
      })
    })
  }

  return {
    dispose: unsubscribe,
    tools: {
      searchSongs: tool({
        description: 'Search local songs by title, artist or album. Omit query or pass an empty string to browse up to ten random playable local songs for recommendations. Returns real track IDs; never invent IDs. Does not start playback.',
        inputSchema: z.object({ query: z.string().trim().max(200).default('') }),
        execute: ({ query }) => sequential(async () => {
          let tracks: Track[]
          try {
            tracks = await options.library.search(query)
          }
          catch {
            throw new Error('Local music library search unavailable')
          }
          checkActive()
          options.context.tracks = tracks.filter(track => track.source === 'local' && track.url.trim()).slice(0, 10).map(summarizeMusicTrack)
          return { tracks: options.context.tracks }
        }),
      }),
      play: tool({
        description: 'Resume the current song when trackId is omitted. To play a specific song immediately, first searchSongs and use an exact returned trackId. Explicit song selection uses the existing manual (Classic) playback path.',
        inputSchema: z.object({ trackId: z.string().min(1).max(300).optional() }),
        execute: ({ trackId }) => sequential(async () => {
          if (!trackId) {
            if (!currentTrack()?.url)
              return { status: 'notExecuted' as const, reason: 'No current song; search for a song first' }
            return apply(MusicAction.PLAY, () => usePlayerStore.getState().play())
          }
          let track: Track | null
          try {
            track = await options.library.getTrack(trackId)
          }
          catch {
            throw new Error('Local music library lookup unavailable')
          }
          checkActive()
          if (!track || track.id !== trackId || track.source !== 'local' || !track.url.trim())
            return { status: 'notExecuted' as const, reason: 'Song not found or not playable; search again' }
          return apply(MusicAction.PLAY, () => usePlayerStore.getState().playTrack(track))
        }),
      }),
      pause: tool({
        description: 'Pause playback. This sets a paused state; it never toggles or resumes playback.',
        inputSchema: z.object({}),
        execute: () => sequential(() => apply(MusicAction.PAUSE, () => usePlayerStore.getState().pause())),
      }),
      previousSong: tool({
        description: 'Go to the previous song in the active playback mode, not an interlude. Preserve playing/paused state. The first radio song restarts.',
        inputSchema: z.object({}),
        execute: () => sequential(() => skip(MusicAction.PREVIOUS)),
      }),
      nextSong: tool({
        description: 'Go to the next song in the active playback mode, not an interlude. Preserve playing/paused state. Report when the radio programme has no next song.',
        inputSchema: z.object({}),
        execute: () => sequential(() => skip(MusicAction.NEXT)),
      }),
    },
  }
}
