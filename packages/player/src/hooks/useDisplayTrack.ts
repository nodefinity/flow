import { usePlayerStore } from '../playerStore'

// eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
export function useDisplayTrack() {
  const queue = usePlayerStore.use.queue()
  const currentIndex = usePlayerStore.use.currentIndex()

  return queue[currentIndex] || undefined
}
