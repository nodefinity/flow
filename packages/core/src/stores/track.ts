import type { Track } from '../types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getStorageAdapter } from '../hooks/useStorageState'

function getJsonSize(data: unknown): number {
  const jsonString = JSON.stringify(data)
  return new TextEncoder().encode(jsonString).length
}

function formatSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export enum PlaybackState {
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
}

export interface CurrentPlayback {
  trackId: string | null
  position: number // seconds
  state: PlaybackState
}

interface TrackStore {
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void

  tracks: Track[]
  addTracks: (newTracks: Track[]) => void
  clearTracks: () => void

  playQueue: string[]
  setPlayQueue: (ids: string[]) => void
  clearPlayQueue: () => void

  currentPlayback: CurrentPlayback
  setCurrentPlayback: (playback: CurrentPlayback) => void
}

let _store: ReturnType<typeof createTrackStore> | null = null

function createTrackStore() {
  return create<TrackStore>()(
    persist(
      set => ({
        _hasHydrated: true,
        setHasHydrated: (state: boolean) => {
          set({
            _hasHydrated: state,
          })
        },

        tracks: [],
        addTracks: (newTracks: Track[]) =>
          set((state) => {
            const existingIds = new Set(state.tracks.map(track => track.id))
            const uniqueNewTracks = newTracks.filter(track => !existingIds.has(track.id))
            const newState = {
              tracks: [...state.tracks, ...uniqueNewTracks],
            }

            const size = getJsonSize(newState.tracks)
            console.log(`Tracks storage size: ${formatSize(size)} (${newState.tracks.length} tracks)`)

            return newState
          }),
        clearTracks: () => {
          set({ tracks: [] })
        },

        playQueue: [],
        setPlayQueue: (ids: string[]) => {
          set({ playQueue: ids })
        },
        clearPlayQueue: () => {
          set({ playQueue: [] })
        },

        currentPlayback: {
          trackId: null,
          position: 0,
          state: PlaybackState.STOPPED,
        },
        setCurrentPlayback: (playback: CurrentPlayback) => {
          set({ currentPlayback: playback })
        },
      }),
      {
        name: 'local-tracks',
        storage: createJSONStorage(() => getStorageAdapter()),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setHasHydrated(true)
            const size = getJsonSize(state.tracks)
            console.log(`Loaded tracks storage size: ${formatSize(size)} (${state.tracks.length} tracks)`)
          }
        },
      },
    ),
  )
}

// eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
export function useTrackStore() {
  if (!_store) {
    _store = createTrackStore()
  }
  const {
    _hasHydrated,
    tracks,
    addTracks,
    clearTracks,
    playQueue,
    setPlayQueue,
    clearPlayQueue,
    currentPlayback,
    setCurrentPlayback,
  } = _store()

  return {
    isTracksHydrated: _hasHydrated,

    tracks,
    addTracks,
    clearTracks,

    playQueue,
    setPlayQueue,
    clearPlayQueue,

    currentPlayback,
    setCurrentPlayback,
  }
}
