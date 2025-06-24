import type { UpdateOptions } from 'react-native-track-player'
import { logger } from '@flow/core'
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
} from 'react-native-track-player'

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
      // Capability.SeekTo,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
    ...options,
  }
}

export async function setupPlayer() {
  const setup = async () => {
    try {
      await TrackPlayer.setupPlayer()
    }
    catch (_err) {
      const err = _err as Error & { code?: string }
      logger.error(err.code ?? 'Unknown error')
      return err.code
    }
  }

  await setup()

  // Repeat mode is needed for the "next" button to show up in the widget
  // if we're on the last track.
  await TrackPlayer.setRepeatMode(RepeatMode.Queue)

  await TrackPlayer.updateOptions(getTrackPlayerOptions())
}
