import TrackPlayer from 'react-native-track-player'
import { usePlayerStore } from './playerStore'

export const playerController = {
  async play() {
    const play = usePlayerStore.use.play()
    await TrackPlayer.play()
    play()
  },

  async pause() {
    const pause = usePlayerStore.use.pause()
    await TrackPlayer.pause()
    pause()
  },

  async next() {
    const next = usePlayerStore.use.next()
    await TrackPlayer.skipToNext()
    next()
  },

  async prev() {
    const prev = usePlayerStore.use.prev()
    await TrackPlayer.skipToPrevious()
    prev()
  },
}
