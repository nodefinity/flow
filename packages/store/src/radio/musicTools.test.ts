import type { Programme, Track } from '@flow/shared'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePlaybackStore } from '../player/playbackStore'
import { onSegmentEnd, onSegmentStart, PlaybackMode, PlayMode, usePlayerStore } from '../player/playerStore'
import { createMusicTools, MusicAction } from './musicTools'

const trackA: Track = {
  id: 'a',
  source: 'local',
  title: 'Song A',
  artist: 'Artist',
  album: 'Album',
  artwork: '',
  url: 'file:///a.mp3',
  duration: 180,
  createdAt: 1,
  modifiedAt: 1,
  fileSize: 100,
}
const trackB: Track = { ...trackA, id: 'b', title: 'Song B', url: 'file:///b.mp3' }
const trackC: Track = { ...trackA, id: 'c', title: 'Song C', url: 'file:///c.mp3' }
const programme: Programme = [
  { kind: 'track', track: trackA },
  { kind: 'interlude', script: 'Next song', audioUrl: 'https://example.com/voice.mp3' },
  { kind: 'track', track: trackB },
  { kind: 'track', track: trackC },
]

describe('music tools', () => {
  let music: ReturnType<typeof createMusicTools>
  let controller: AbortController
  let options: Parameters<typeof createMusicTools>[0]

  beforeEach(() => {
    usePlayerStore.setState({ playbackMode: PlaybackMode.CLASSIC, isPlaying: true, queue: [trackA, trackB, trackC], originalQueue: [trackA, trackB, trackC], currentIndex: 0, mode: PlayMode.ORDERED, programme: [], nowPlayingSegmentIndex: 0 })
    usePlaybackStore.setState({ position: 30 })
    controller = new AbortController()
    options = {
      library: { search: vi.fn().mockResolvedValue([trackA, trackB]), getTrack: vi.fn().mockResolvedValue(trackB) },
      context: { tracks: [] },
      session: { actions: [] },
    }
    music = createMusicTools(options, controller.signal)
  })

  afterEach(() => music.dispose())

  async function call<K extends keyof typeof music.tools>(name: K, input: Parameters<NonNullable<typeof music.tools[K]['execute']>>[0]) {
    return await music.tools[name].execute!(input as never, { toolCallId: 'test', messages: [], context: {} })
  }

  function radio(index: number, isPlaying = true) {
    music.dispose()
    usePlayerStore.setState({ playbackMode: PlaybackMode.RADIO, programme, nowPlayingSegmentIndex: index, isPlaying })
    music = createMusicTools(options, controller.signal)
  }

  it('returns only bounded public metadata and keeps search results for follow-up references', async () => {
    vi.mocked(options.library.search).mockResolvedValue(Array.from({ length: 15 }, () => trackA))
    const result = await call('searchSongs', { query: 'Song' })
    expect(result).toEqual({ tracks: Array.from({ length: 10 }, () => ({ id: 'a', title: 'Song A', artist: 'Artist', album: 'Album' })) })
    expect(options.context.tracks).toHaveLength(10)
    expect(JSON.stringify(result)).not.toContain('file:///')
    expect(usePlayerStore.getState().currentIndex).toBe(0)
  })

  it('plays a verified local song using the existing manual selection path', async () => {
    radio(0)
    await expect(call('play', { trackId: 'b' })).resolves.toMatchObject({ status: 'accepted', action: MusicAction.PLAY, track: { id: 'b' } })
    expect(options.library.getTrack).toHaveBeenCalledWith('b')
    expect(usePlayerStore.getState()).toMatchObject({ playbackMode: PlaybackMode.CLASSIC, currentIndex: 1, isPlaying: true })
  })

  it('resumes or pauses without toggling the wrong state', async () => {
    await call('pause', {})
    await call('pause', {})
    expect(usePlayerStore.getState().isPlaying).toBe(false)
    await call('play', {})
    expect(usePlayerStore.getState().isPlaying).toBe(true)
  })

  it('does not invent a song when a lookup has no result', async () => {
    vi.mocked(options.library.getTrack).mockResolvedValue(null)
    await expect(call('play', { trackId: 'unknown' })).resolves.toMatchObject({ status: 'notExecuted' })
    expect(usePlayerStore.getState().currentIndex).toBe(0)
    expect(options.session.actions).toEqual([])
  })

  it('rejects remote or unplayable library entries', async () => {
    for (const track of [{ ...trackB, source: 'remote' as const }, { ...trackB, url: '' }]) {
      vi.mocked(options.library.getTrack).mockResolvedValue(track)
      await expect(call('play', { trackId: 'b' })).resolves.toMatchObject({ status: 'notExecuted' })
    }
    expect(options.session.actions).toEqual([])
  })

  it('moves through the classic queue in request order, even in repeat-one mode', async () => {
    music.dispose()
    usePlayerStore.setState({ mode: PlayMode.SINGLE })
    music = createMusicTools(options, controller.signal)
    await Promise.all([call('nextSong', {}), call('nextSong', {}), call('previousSong', {})])
    expect(usePlayerStore.getState().currentIndex).toBe(1)
    expect(usePlaybackStore.getState().position).toBe(0)
    expect(options.session.actions.map(action => action.action)).toEqual([MusicAction.NEXT, MusicAction.NEXT, MusicAction.PREVIOUS])
  })

  it('skips interludes in radio mode without touching the classic queue', async () => {
    radio(0)
    const start = vi.fn()
    const end = vi.fn()
    const offStart = onSegmentStart(start)
    const offEnd = onSegmentEnd(end)
    try {
      await call('nextSong', {})
      expect(usePlayerStore.getState()).toMatchObject({ playbackMode: PlaybackMode.RADIO, nowPlayingSegmentIndex: 2, currentIndex: 0 })
      expect(start).toHaveBeenCalledWith(programme[2], 2)
      expect(end).toHaveBeenCalledWith(programme[0], 0)
      await call('previousSong', {})
      expect(usePlayerStore.getState().nowPlayingSegmentIndex).toBe(0)
    }
    finally {
      offStart()
      offEnd()
    }
  })

  it('treats the music under an interlude as the current song', async () => {
    radio(1)
    await call('nextSong', {})
    expect(usePlayerStore.getState().nowPlayingSegmentIndex).toBe(3)
  })

  it('preserves pause state and restarts the first radio song for previous', async () => {
    radio(0, false)
    await call('previousSong', {})
    expect(usePlayerStore.getState()).toMatchObject({ nowPlayingSegmentIndex: 0, isPlaying: false })
    expect(usePlaybackStore.getState().position).toBe(0)
  })

  it('reports the radio boundary instead of changing an unrelated queue', async () => {
    radio(3)
    await expect(call('nextSong', {})).resolves.toMatchObject({ status: 'notExecuted' })
    expect(usePlayerStore.getState()).toMatchObject({ currentIndex: 0, nowPlayingSegmentIndex: 3 })
  })

  it('does not start or skip an empty player', async () => {
    music.dispose()
    usePlayerStore.setState({ queue: [], isPlaying: false })
    music = createMusicTools(options, controller.signal)
    for (const name of ['play', 'nextSong', 'previousSong'] as const)
      await expect(call(name, {})).resolves.toMatchObject({ status: 'notExecuted' })
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })

  it('prevents stale operations after a manual playback change', async () => {
    usePlayerStore.getState().pause()
    await expect(call('nextSong', {})).rejects.toThrow('Playback changed')
    expect(usePlayerStore.getState().currentIndex).toBe(0)
  })

  it('checks cancellation again after an asynchronous song lookup', async () => {
    let resolve!: (value: Track) => void
    vi.mocked(options.library.getTrack).mockReturnValue(new Promise((done) => {
      resolve = done
    }))
    const result = call('play', { trackId: 'b' })
    await Promise.resolve()
    controller.abort()
    resolve(trackB)
    await expect(result).rejects.toThrow('cancelled')
    expect(usePlayerStore.getState().currentIndex).toBe(0)
  })

  it('never replays a side effect during reply recovery', async () => {
    await call('nextSong', {})
    music.dispose()
    music = createMusicTools(options, new AbortController().signal)
    await expect(call('nextSong', {})).resolves.toMatchObject({ status: 'notExecuted' })
    expect(usePlayerStore.getState().currentIndex).toBe(1)
    expect(options.session.actions).toHaveLength(1)
  })

  it('caps writes and sanitizes library failures', async () => {
    for (let index = 0; index < 5; index++)
      await call('pause', {})
    await expect(call('nextSong', {})).resolves.toMatchObject({ status: 'notExecuted' })
    vi.mocked(options.library.search).mockRejectedValue(new Error('private database URI'))
    await expect(call('searchSongs', { query: 'a' })).rejects.toThrow('Local music library search unavailable')
  })
})
