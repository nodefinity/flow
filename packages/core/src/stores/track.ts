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

interface TracksState {
  isLoading: boolean
  tracks: Track[]
  addTracks: (newTracks: Track[]) => void
  clearTracks: () => void
}

let _store: ReturnType<typeof createTracksStore> | null = null

function createTracksStore() {
  return create<TracksState>()(
    persist(
      set => ({
        isLoading: true,
        tracks: [],
        addTracks: (newTracks: Track[]) =>
          set((state) => {
            console.log('Adding tracks:', { newTracksCount: newTracks.length, existingTracksCount: state.tracks.length })
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
      }),
      {
        name: 'local-tracks',
        storage: createJSONStorage(() => getStorageAdapter()),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.isLoading = false
            const size = getJsonSize(state.tracks)
            console.log(`Loaded tracks storage size: ${formatSize(size)} (${state.tracks.length} tracks)`)
          }
        },
      },
    ),
  )
}

export function useLocalTracks() {
  if (!_store) {
    _store = createTracksStore()
  }
  const { isLoading, tracks, addTracks, clearTracks } = _store()

  return {
    isTracksLoading: isLoading,
    tracks,
    addTracks,
    clearTracks,
  }
}
