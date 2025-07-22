import { logger } from '@flow/core'
import TrackPlayer, { Event } from 'react-native-track-player'
import { usePlaybackStore } from '../playbackStore'
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

  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, (event) => {
    logger.info('PlaybackActiveTrackChanged', event)
    if (event.index !== undefined) {
      playerController.syncCurrentIndex(event.index)
    }
  })

  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (event) => {
    const { position } = event
    const setPosition = usePlaybackStore.getState().setPosition

    setPosition(position)
  })
}
