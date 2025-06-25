import type { Track } from '@flow/core'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getStorage } from './providers/storage'
import { createSelectors } from './utils/createSelectors'

interface TrackStore {
  hasHydrated: boolean
  setHasHydrated: (state: boolean) => void

  localTracks: Track[]
  remoteTracks: Track[]

  setLocalTracks: (tracks: Track[]) => void
  addRemoteTrack: (track: Track) => void
}

const trackStoreBase = create<TrackStore>()(
  persist(
    set => ({
      hasHydrated: false,
      setHasHydrated: (state: boolean) => {
        set({
          hasHydrated: state,
        })
      },

      localTracks: [],
      remoteTracks: [],

      setLocalTracks: tracks => set({ localTracks: tracks }),
      addRemoteTrack: track =>
        set(state => ({
          remoteTracks: [...state.remoteTracks, track],
        })),
    }),
    {
      name: 'track-store',
      storage: createJSONStorage(() => getStorage),
      onRehydrateStorage: () => state => state?.setHasHydrated(true),
      // only persist remoteTracks, get localTracks in runtime
      partialize: state => ({
        remoteTracks: state.remoteTracks,
      }),
    },
  ),
)

export const useTrackStore = createSelectors(trackStoreBase)
