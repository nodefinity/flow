import { useActiveTrack } from 'react-native-track-player'
import { usePlayerStore } from '../playerStore'

export function useDisplayTrack() {
  const activeTrack = useActiveTrack()
  const queue = usePlayerStore.use.queue()
  const currentIndex = usePlayerStore.use.currentIndex()

  return activeTrack || queue[currentIndex] || undefined
}
