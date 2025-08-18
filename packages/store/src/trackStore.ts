import type { Track } from '@flow/shared'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { storage } from './providers/storage'
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
  immer(
    persist(
      set => ({
        hasHydrated: false,
        setHasHydrated: (state: boolean) => {
          set((draft) => {
            draft.hasHydrated = state
          })
        },

        localTracks: [],
        remoteTracks: [],

        setLocalTracks: tracks => set((draft) => {
          draft.localTracks = tracks
        }),
        addRemoteTrack: track => set((draft) => {
          draft.remoteTracks.push(track)
        }),
      }),
      {
        name: 'track-store',
        storage,
        onRehydrateStorage: () => state => state?.setHasHydrated(true),
        // only persist remoteTracks, get localTracks in runtime
        partialize: state => ({
          remoteTracks: state.remoteTracks,
        }),
      },
    ),
  ),
)

export const useTrackStore = createSelectors(trackStoreBase)
