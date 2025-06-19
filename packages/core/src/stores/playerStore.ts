import type { Track } from '../types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getStorageAdapter } from '../hooks/useStorageState'

export enum PlayMode {
  SINGLE = 'single',
  ORDERED = 'ordered',
  SHUFFLE = 'shuffle',
}

interface PlayerStore {
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void

  queue: Track[]
  originalQueue: Track[]
  currentIndex: number
  mode: PlayMode

  play: (track: Track, list?: Track[]) => void
  insertNext: (track: Track) => void
  next: (userControl?: boolean) => void
  prev: () => void
  setMode: (mode: PlayMode) => void
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

let _store: ReturnType<typeof createPlayerStore> | null = null

function createPlayerStore() {
  return create<PlayerStore>()(
    persist(
      (set, get) => ({
        _hasHydrated: true,
        setHasHydrated: (state: boolean) => {
          set({
            _hasHydrated: state,
          })
        },

        queue: [],
        originalQueue: [],
        currentIndex: 0,
        mode: PlayMode.ORDERED,

        // Play a track, if list is provided, will shuffle the list if mode is shuffle,
        // If list is not provided, it means it's temporary play, only add the track to the queue
        play: (track, list) => {
          const { mode, queue } = get()

          if (list && list.length) {
            const newQueue = mode === PlayMode.SHUFFLE ? shuffle(list) : list
            set({
              originalQueue: list,
              queue: newQueue,
              currentIndex: newQueue.findIndex(t => t.id === track.id),
            })
          }
          else {
            const nextQueue = [...queue, track]
            set({
              queue: nextQueue,
              // do not change the original queue, cause it's temporary play
              currentIndex: nextQueue.length - 1,
            })
          }
        },

        // Insert a track after the current track
        insertNext: (track) => {
          const { queue, currentIndex } = get()
          // Remove the old track
          const newQueue = queue.filter(t => t.id !== track.id)
          newQueue.splice(currentIndex + 1, 0, track)
          set({ queue: newQueue })
        },

        next: (userControl = false) => {
          const { queue, currentIndex, mode } = get()
          // If user interacted with the player, should play the next
          if (mode === PlayMode.SINGLE && !userControl)
            return
          let next = currentIndex + 1
          if (next >= queue.length)
            next = 0
          set({ currentIndex: next })
        },

        prev: () => {
          const { queue, currentIndex } = get()
          let prev = currentIndex - 1
          if (prev < 0)
            prev = queue.length - 1
          set({ currentIndex: prev })
        },

        setMode: (mode) => {
          const { originalQueue, queue, currentIndex } = get()

          if (mode === PlayMode.SHUFFLE) {
            const shuffled = shuffle(originalQueue)
            const nowTrack = queue[currentIndex]
            const newIndex = shuffled.findIndex(t => t.id === nowTrack.id)
            set({
              mode,
              queue: shuffled,
              currentIndex: newIndex >= 0 ? newIndex : 0,
            })
          }
          else {
            // ordered / single: restore order
            const nowTrack = queue[currentIndex]
            const newIndex = originalQueue.findIndex(t => t.id === nowTrack.id)
            set({
              mode,
              queue: originalQueue,
              currentIndex: newIndex >= 0 ? newIndex : 0,
            })
          }
        },
      }),
      {
        name: 'player-store',
        storage: createJSONStorage(() => getStorageAdapter()),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setHasHydrated(true)
          }
        },
      },
    ),
  )
}

// eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
export function usePlayerStore() {
  if (!_store) {
    _store = createPlayerStore()
  }
  const {
    _hasHydrated,
    queue,
    originalQueue,
    currentIndex,
    mode,
    play,
    insertNext,
    next,
    prev,
    setMode,
  } = _store()

  return {
    isPlayerHydrated: _hasHydrated,

    queue,
    originalQueue,
    currentIndex,
    mode,
    play,
    insertNext,
    next,
    prev,
    setMode,
  }
}
