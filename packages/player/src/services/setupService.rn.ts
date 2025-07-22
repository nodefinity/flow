import type { UpdateOptions } from 'react-native-track-player'
import { logger } from '@flow/core'
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  // Capability,
  RepeatMode,
} from 'react-native-track-player'
import { usePlayerStore } from '../playerStore'

/**
 * Whenever we use `TrackPlayer.updateOptions()`, we need to include all
 * the options (ie: we can't just change one key, leaving the rest the same).
 */
export function getTrackPlayerOptions(options?: UpdateOptions) {
  return {
    android: {
      appKilledPlaybackBehavior:
        AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
    progressUpdateEventInterval: 0.1,
    ...options,
  }
}

export async function setupPlayer() {
  const setup = async () => {
    try {
      await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
      })
    }
    catch (_err) {
      const err = _err as Error & { code?: string }
      logger.error(err.code ?? 'Unknown error')
      return err.code
    }
  }

  while ((await setup()) === 'android_cannot_setup_player_in_background') {
    // A timeout will mostly only execute when the app is in the foreground,
    // and even if we were in the background still, it will reject the promise
    // and we'll try again:
    await new Promise<void>(resolve => setTimeout(resolve, 1))
  }

  // Repeat mode is needed for the "next" button to show up in the widget
  // if we're on the last track.
  await TrackPlayer.setRepeatMode(RepeatMode.Queue)

  await TrackPlayer.updateOptions(getTrackPlayerOptions())

  // Sync queue to TrackPlayer
  try {
    const { queue, currentIndex } = usePlayerStore.getState()

    if (queue.length > 0) {
      logger.info(`Setting up TrackPlayer with ${queue.length} tracks, current index: ${currentIndex}`)

      // Reset TrackPlayer and add queue
      await TrackPlayer.reset()
      await TrackPlayer.add(queue)

      // Set current track
      if (currentIndex >= 0 && currentIndex < queue.length) {
        await TrackPlayer.skip(currentIndex)
      }
    }
    else {
      logger.info('No tracks in store, TrackPlayer queue will be empty')
    }
  }
  catch (error) {
    logger.error('Failed to sync queue to TrackPlayer during setup:', error)
  }
}
