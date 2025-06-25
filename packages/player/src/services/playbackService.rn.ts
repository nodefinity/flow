import TrackPlayer, { Event } from 'react-native-track-player'
import { playerController } from '../playerController'

export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    playerController.play()
  })

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    playerController.pause()
  })

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    playerController.next()
  })

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    playerController.prev()
  })

  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, () => {
    playerController.next()
  })
}
