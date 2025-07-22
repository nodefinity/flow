import { getStorage } from '@flow/store/providers/storage'
import { createSelectors } from '@flow/store/utils/createSelectors'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface PlaybackStore {
  position: number // seconds

  volume: number // 0-1 default 1.0
  playbackRate: number // 0.5-2.0 default 1.0
}

interface PlaybackStoreActions {
  setPosition: (position: number) => void

  setVolume: (volume: number) => void
  setPlaybackRate: (rate: number) => void

  reset: () => void
}

const playbackStoreBase = create<PlaybackStore & PlaybackStoreActions>()(persist(
  set => ({
    position: 0,
    isPlaying: false,
    isBuffering: false,
    volume: 1.0,
    playbackRate: 1.0,

    // Actions
    setPosition: (position) => {
      set({ position })
    },

    setVolume: (volume) => {
      set({ volume: Math.max(0, Math.min(1, volume)) })
    },

    setPlaybackRate: (rate) => {
      set({ playbackRate: Math.max(0.5, Math.min(2.0, rate)) })
    },

    reset: () => {
      set({
        position: 0,
        volume: 1.0,
        playbackRate: 1.0,
      })
    },
  }),
  {
    name: 'playback-store',
    storage: createJSONStorage(() => getStorage),
  },
))

export const usePlaybackStore = createSelectors(playbackStoreBase)
