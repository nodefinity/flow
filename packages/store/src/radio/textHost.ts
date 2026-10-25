import type { Track } from '@flow/shared'
import type { MusicActionReceipt, MusicToolSession } from './musicTools'
import type { TextHostEvent } from './textChat'
import { useChatTimelineStore } from '../chatTimelineStore'
import { PlaybackMode, usePlayerStore } from '../player/playerStore'

function currentTrack() {
  const state = usePlayerStore.getState()
  return state.playbackMode === PlaybackMode.RADIO
    ? state.programme.slice(state.nowPlayingSegmentIndex).find(segment => segment.kind === 'track')?.track
    : state.queue[state.currentIndex]
}

function hasConversation() {
  return useChatTimelineStore.getState().messages.some(message => message.type === 'host-turn' || message.type === 'user-turn')
}

// Screen-scoped hosting; opening playback is delegated to the reply's tools.
export function createTextHost(options: {
  reply: (event: TextHostEvent, track: Track | undefined, signal: AbortSignal, session: MusicToolSession) => Promise<string>
  onOpeningError: (error: unknown) => void
  onOpeningReady?: () => void
  openingSession?: MusicToolSession
}) {
  let disposed = false
  let userTurn = false
  let track = currentTrack()
  let pending: TextHostEvent | undefined = hasConversation() ? undefined : { type: 'opening' }
  let timer: ReturnType<typeof setTimeout> | undefined
  let request: AbortController | undefined
  let activeEvent: TextHostEvent | undefined
  const openingSession = options.openingSession ?? { actions: [] }

  function cancel() {
    clearTimeout(timer)
    request?.abort()
    request = undefined
    activeEvent = undefined
  }

  async function narrate(event: TextHostEvent) {
    const controller = new AbortController()
    const target = track
    request = controller
    activeEvent = event
    try {
      const text = await options.reply(event, target, controller.signal, openingSession)
      const currentId = currentTrack()?.id
      const selectedId = event.type === 'opening' ? openingSession.actions.at(-1)?.track?.id : undefined
      if (disposed || userTurn || controller.signal.aborted || (currentId !== target?.id && !(selectedId !== undefined && currentId === selectedId)))
        return
      pending = undefined
      if (text.trim()) {
        useChatTimelineStore.getState().appendMessage({ type: 'host-turn', text: text.trim(), timestamp: Date.now() })
        if (event.type === 'opening' && !controller.signal.aborted)
          options.onOpeningReady?.()
      }
    }
    catch (error) {
      // A failed transition must not replace the user's chat error or stop music.
      if (!disposed && !controller.signal.aborted && event.type === 'opening')
        options.onOpeningError(error)
    }
    finally {
      if (request === controller) {
        request = undefined
        activeEvent = undefined
      }
    }
  }

  function schedule() {
    cancel()
    if (disposed || userTurn || !pending)
      return
    if (pending.type === 'track-change' && !usePlayerStore.getState().isPlaying)
      return
    // Coalesce rapid skips and let the initial programme finish loading.
    timer = setTimeout(() => {
      if (pending)
        void narrate(pending)
    }, 800)
  }

  const unsubscribe = usePlayerStore.subscribe((state, previous) => {
    const nextTrack = currentTrack()
    if (pending?.type === 'opening' && !request && previous.isPlaying && !state.isPlaying) {
      // An explicit pause during the opening debounce must not be undone later.
      track = nextTrack
      pending = undefined
      cancel()
      return
    }
    if (activeEvent?.type === 'opening' && request && (nextTrack?.id !== track?.id || state.isPlaying !== previous.isPlaying)) {
      track = nextTrack
      const controller = request
      // Receipts are recorded synchronously just after the store write. Wait
      // one microtask to distinguish the opening's own play from a manual edit.
      queueMicrotask(() => {
        if (disposed || request !== controller || controller.signal.aborted)
          return
        const action = openingSession.actions.at(-1)
        if (action?.track?.id === currentTrack()?.id && action?.requestedPlaying === usePlayerStore.getState().isPlaying)
          return
        pending = undefined
        cancel()
      })
      return
    }
    if (nextTrack?.id !== track?.id) {
      const previousTrack = track
      track = nextTrack
      pending = !hasConversation()
        ? { type: 'opening' }
        : nextTrack ? { type: 'track-change', previousTrack } : undefined
      schedule()
    }
    else if (state.isPlaying !== previous.isPlaying) {
      schedule()
    }
  })
  schedule()

  return {
    beginUserTurn() {
      userTurn = true
      pending = undefined
      cancel()
    },
    endUserTurn(actions: MusicActionReceipt[]) {
      userTurn = false
      // The tool reply already introduces the selected song; don't echo it.
      if (actions.at(-1)?.track?.id === track?.id && actions.length > 0)
        pending = undefined
      schedule()
    },
    retry: schedule,
    dispose() {
      disposed = true
      cancel()
      unsubscribe()
    },
  }
}
