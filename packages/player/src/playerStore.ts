import type { Track } from '@flow/core'
import { getStorage } from '@flow/store/providers/storage'
import { createSelectors } from '@flow/store/utils/createSelectors'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export enum PlayMode {
  SINGLE = 'single',
  ORDERED = 'ordered',
  SHUFFLE = 'shuffle',
}

interface PlayerStore {
  queue: Track[]
  originalQueue: Track[]
  currentIndex: number
  mode: PlayMode
  isPlaying: boolean
}

export interface PlayerStoreActions {
  // queue management
  addToQueue: (track: Track) => void
  insertNext: (track: Track) => void
  removeFromQueue: (trackId: string) => void
  clearQueue: () => void

  // play control
  play: () => void // play current track
  pause: () => void // pause current track
  playTrack: (track: Track) => void // // Jump to track, then play
  playQueue: (tracks: Track[], startTrack?: Track) => void // Replace queue + optional jump
  next: (userControl?: boolean) => void // Next track
  prev: () => void // Previous track

  // play mode
  setMode: (mode: PlayMode) => void
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i]!, arr[j]!] = [arr[j]!, arr[i]!]
  }
  return arr
}

const playerStoreBase = create<PlayerStore & PlayerStoreActions>()(
  persist(
    (set, get) => ({
      queue: [],
      originalQueue: [],
      currentIndex: 0,
      mode: PlayMode.ORDERED,
      isPlaying: false,

      // Add a track to the queue's end
      addToQueue: (track) => {
        const { queue } = get()
        set({
          queue: [...queue, track],
        })
      },

      // Insert a track after the current track
      insertNext: (track) => {
        const { queue, currentIndex } = get()
        const newQueue = queue.filter(t => t.id !== track.id)
        newQueue.splice(currentIndex + 1, 0, track)
        set({ queue: newQueue })
      },

      removeFromQueue: (trackId) => {
        const { queue, currentIndex } = get()
        const newQueue = queue.filter(t => t.id !== trackId)
        const removedIndex = queue.findIndex(t => t.id === trackId)

        let newCurrentIndex = currentIndex
        if (removedIndex <= currentIndex && currentIndex > 0) {
          newCurrentIndex = currentIndex - 1
        }

        set({
          queue: newQueue,
          currentIndex: newCurrentIndex,
        })
      },

      clearQueue: () => {
        set({
          queue: [],
          originalQueue: [],
          currentIndex: 0,
          isPlaying: false,
        })
      },

      play: () => {
        set({ isPlaying: true })
      },

      pause: () => {
        set({ isPlaying: false })
      },

      playTrack: (track) => {
        const { queue } = get()
        const existingIndex = queue.findIndex(t => t.id === track.id)

        if (existingIndex >= 0) {
          // if the track is in the queue, play it
          set({ currentIndex: existingIndex, isPlaying: true })
        }
        else {
          // if the track is not in the queue, add it to the end of the queue and play it
          const newQueue = [...queue, track]
          set({
            queue: newQueue,
            currentIndex: newQueue.length - 1,
            isPlaying: true,
          })
        }
      },

      playQueue: (tracks, startTrack) => {
        const { mode } = get()
        const newQueue = mode === PlayMode.SHUFFLE ? shuffle(tracks) : tracks

        let startIndex = 0
        if (startTrack) {
          startIndex = newQueue.findIndex(t => t.id === startTrack.id)
          if (startIndex === -1)
            startIndex = 0
        }

        set({
          originalQueue: tracks,
          queue: newQueue,
          currentIndex: startIndex,
          isPlaying: true,
        })
      },

      next: (userControl = false) => {
        const { queue, currentIndex, mode } = get()
        if (queue.length === 0)
          return

        // if the mode is single and the user is not controlling, do not switch
        if (mode === PlayMode.SINGLE && !userControl)
          return

        let next = currentIndex + 1
        if (next >= queue.length)
          next = 0
        set({ currentIndex: next })
      },

      prev: () => {
        const { queue, currentIndex } = get()
        if (queue.length === 0)
          return

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
          if (!nowTrack)
            return
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
          if (!nowTrack)
            return
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
      storage: createJSONStorage(() => getStorage),
      partialize: state => ({
        queue: state.queue,
        originalQueue: state.originalQueue,
        currentIndex: state.currentIndex,
        mode: state.mode,
      }),
    },
  ),
)

export const usePlayerStore = createSelectors(playerStoreBase)
