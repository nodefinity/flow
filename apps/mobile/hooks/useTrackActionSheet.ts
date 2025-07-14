import type { Track } from '@flow/core'
import { create } from 'zustand'

interface TrackActionSheetState {
  visible: boolean
  currentTrack?: Track
  show: (track?: Track) => void
  hide: () => void
}

export const useTrackActionSheet = create<TrackActionSheetState>(set => ({
  visible: false,
  currentTrack: undefined,
  show: track => set({ visible: true, currentTrack: track }),
  hide: () => set({ visible: false, currentTrack: undefined }),
}))
