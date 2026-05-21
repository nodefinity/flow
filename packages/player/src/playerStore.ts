import type { Programme, Segment, Track } from '@flow/shared'
import { storage } from '@flow/store/providers/storage'
import { createSelectors } from '@flow/store/utils/createSelectors'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export enum PlayMode {
  SINGLE = 'single',
  ORDERED = 'ordered',
  SHUFFLE = 'shuffle',
}

export enum PlaybackMode {
  CLASSIC = 'classic',
  RADIO = 'radio',
}

type SegmentEndListener = (finishedSegment: Segment, index: number) => void

const segmentEndListeners = new Set<SegmentEndListener>()

export function onSegmentEnd(listener: SegmentEndListener): () => void {
  segmentEndListeners.add(listener)
  return () => {
    segmentEndListeners.delete(listener)
  }
}

export function emitSegmentEnd(segment: Segment, index: number) {
  for (const listener of segmentEndListeners) {
    listener(segment, index)
  }
}

interface PlayerStore {
  // shared
  playbackMode: PlaybackMode
  isPlaying: boolean

  // classic mode
  queue: Track[]
  originalQueue: Track[]
  currentIndex: number
  mode: PlayMode

  // radio mode
  programme: Programme
  nowPlayingSegmentIndex: number
}

interface PlayerStoreActions {
  // queue management (classic)
  addToQueue: (track: Track) => void
  insertNext: (track: Track) => void
  removeFromQueue: (trackId: string) => void
  clearQueue: () => void

  // play control
  play: () => void
  pause: () => void
  playTrack: (track: Track) => void
  playQueue: (tracks: Track[], startTrack?: Track) => void
  next: (userControl?: boolean) => void
  prev: () => void

  // play mode (classic)
  setMode: (mode: PlayMode) => void

  // sync
  setCurrentIndex: (index: number) => void

  // radio mode
  loadProgramme: (programme: Programme) => void
  nextSegment: () => void
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
  immer(
    persist(
      set => ({
        playbackMode: PlaybackMode.CLASSIC,
        isPlaying: false,

        // classic
        queue: [],
        originalQueue: [],
        currentIndex: 0,
        mode: PlayMode.ORDERED,

        // radio
        programme: [] as Programme,
        nowPlayingSegmentIndex: 0,

        // Add a track to the queue's end
        addToQueue: (track) => {
          set((draft) => {
            draft.queue.push(track)
          })
        },

        // Insert a track after the current track
        insertNext: (track) => {
          set((draft) => {
            // 如果是当前正在播放的歌曲，直接在后面插入一份副本
            if (track.id === draft.queue[draft.currentIndex]?.id) {
              draft.queue.splice(draft.currentIndex + 1, 0, track)
              return
            }

            // 记录当前播放的歌曲 ID
            const currentTrackId = draft.queue[draft.currentIndex]?.id

            // 找到要移除的歌曲在队列中的位置
            const existingIndex = draft.queue.findIndex(t => t.id === track.id)

            // 移除已存在的歌曲（非当前播放歌曲）
            if (existingIndex >= 0) {
              draft.queue = draft.queue.filter(t => t.id !== track.id)

              // 如果移除的歌曲在当前播放歌曲之前，需要调整 currentIndex
              if (existingIndex < draft.currentIndex) {
                draft.currentIndex = draft.currentIndex - 1
              }
            }

            // 重新找到当前播放歌曲的位置（因为可能已经变化）
            const newCurrentIndex = draft.queue.findIndex(t => t.id === currentTrackId)
            if (newCurrentIndex >= 0) {
              draft.currentIndex = newCurrentIndex
              // 在当前播放歌曲后面插入新歌曲
              draft.queue.splice(draft.currentIndex + 1, 0, track)
            }
          })
        },

        removeFromQueue: (trackId) => {
          set((draft) => {
            const removedIndex = draft.queue.findIndex(t => t.id === trackId)
            draft.queue = draft.queue.filter(t => t.id !== trackId)

            if (removedIndex <= draft.currentIndex && draft.currentIndex > 0) {
              draft.currentIndex = draft.currentIndex - 1
            }
          })
        },

        clearQueue: () => {
          set((draft) => {
            draft.queue = []
            draft.originalQueue = []
            draft.currentIndex = 0
            draft.isPlaying = false
          })
        },

        play: () => {
          set((draft) => {
            draft.isPlaying = true
          })
        },

        pause: () => {
          set((draft) => {
            draft.isPlaying = false
          })
        },

        playTrack: (track) => {
          set((draft) => {
            draft.playbackMode = PlaybackMode.CLASSIC
            draft.programme = []
            draft.nowPlayingSegmentIndex = 0

            const existingIndex = draft.queue.findIndex(t => t.id === track.id)

            if (existingIndex >= 0) {
              draft.currentIndex = existingIndex
              draft.isPlaying = true
            }
            else {
              draft.queue.push(track)
              draft.currentIndex = draft.queue.length - 1
              draft.isPlaying = true
            }
          })
        },

        playQueue: (tracks, startTrack) => {
          set((draft) => {
            draft.playbackMode = PlaybackMode.CLASSIC
            draft.programme = []
            draft.nowPlayingSegmentIndex = 0

            const newQueue = draft.mode === PlayMode.SHUFFLE ? shuffle(tracks) : tracks

            let startIndex = 0
            if (startTrack) {
              startIndex = newQueue.findIndex(t => t.id === startTrack.id)
              if (startIndex === -1)
                startIndex = 0
            }

            draft.originalQueue = tracks
            draft.queue = newQueue
            draft.currentIndex = startIndex
            draft.isPlaying = true
          })
        },

        next: (userControl = false) => {
          set((draft) => {
            if (draft.queue.length === 0)
              return

            // if the mode is single and the user is not controlling, do not switch
            if (draft.mode === PlayMode.SINGLE && !userControl)
              return

            let next = draft.currentIndex + 1
            if (next >= draft.queue.length)
              next = 0
            draft.currentIndex = next
          })
        },

        prev: () => {
          set((draft) => {
            if (draft.queue.length === 0)
              return

            let prev = draft.currentIndex - 1
            if (prev < 0)
              prev = draft.queue.length - 1
            draft.currentIndex = prev
          })
        },

        setMode: (mode) => {
          set((draft) => {
            if (mode === PlayMode.SHUFFLE) {
              const shuffled = shuffle(draft.originalQueue)
              const nowTrack = draft.queue[draft.currentIndex]
              if (!nowTrack)
                return
              const newIndex = shuffled.findIndex(t => t.id === nowTrack.id)

              draft.mode = mode
              draft.queue = shuffled
              draft.currentIndex = newIndex >= 0 ? newIndex : 0
            }
            else {
              // ordered / single: restore order
              const nowTrack = draft.queue[draft.currentIndex]
              if (!nowTrack)
                return
              const newIndex = draft.originalQueue.findIndex(t => t.id === nowTrack.id)

              draft.mode = mode
              draft.queue = draft.originalQueue
              draft.currentIndex = newIndex >= 0 ? newIndex : 0
            }
          })
        },

        setCurrentIndex: (index) => {
          set((draft) => {
            draft.currentIndex = index
          })
        },

        loadProgramme: (programme) => {
          set((draft) => {
            draft.playbackMode = PlaybackMode.RADIO
            draft.programme = programme
            draft.nowPlayingSegmentIndex = 0
            draft.isPlaying = true
          })
        },

        nextSegment: () => {
          set((draft) => {
            if (draft.playbackMode !== PlaybackMode.RADIO)
              return
            if (draft.programme.length === 0)
              return

            const finishedIndex = draft.nowPlayingSegmentIndex
            const finishedSegment = draft.programme[finishedIndex]

            let next = finishedIndex + 1
            if (next >= draft.programme.length) {
              draft.isPlaying = false
              next = draft.programme.length - 1
            }
            draft.nowPlayingSegmentIndex = next

            if (finishedSegment) {
              queueMicrotask(() => emitSegmentEnd(finishedSegment, finishedIndex))
            }
          })
        },
      }),
      {
        name: 'player-store',
        storage,
        partialize: state => ({
          playbackMode: state.playbackMode,
          queue: state.queue,
          originalQueue: state.originalQueue,
          currentIndex: state.currentIndex,
          mode: state.mode,
        }),
      },
    ),
  ),
)

export const usePlayerStore = createSelectors(playerStoreBase)
