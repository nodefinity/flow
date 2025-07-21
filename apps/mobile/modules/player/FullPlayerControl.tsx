import { formatDuration } from '@flow/core'
import { playerController, PlayMode, useDisplayTrack, usePlayerStore } from '@flow/player'
import Slider from '@react-native-community/slider'
import { useCallback } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { IconButton, Text, useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: screenWidth } = Dimensions.get('screen')

export default function FullPlayerControl() {
  const { bottom } = useSafeAreaInsets()
  const { colors } = useTheme()
  const displayTrack = useDisplayTrack()
  const isPlaying = usePlayerStore.use.isPlaying()
  const mode = usePlayerStore.use.mode()
  const position = usePlayerStore.use.position()

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      playerController.pause()
    }
    else {
      playerController.play()
    }
  }, [isPlaying])

  const handleNext = useCallback(() => {
    playerController.next()
  }, [])

  const handlePrevious = useCallback(() => {
    playerController.prev()
  }, [])

  const handleSliderSlidingComplete = useCallback((value: number) => {
    if (displayTrack?.duration && displayTrack.duration > 0) {
      playerController.seekTo(value)
    }
  }, [displayTrack?.duration])

  return (
    <View style={[styles.container, { paddingBottom: bottom + 36 }]}>
      <View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={displayTrack?.duration ?? 0}
          value={position}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.outline}
          thumbTintColor={colors.primary}
          onSlidingComplete={handleSliderSlidingComplete}
          // Fix outer pan gesture conflict
          // https://github.com/callstack/react-native-slider/issues/296#issuecomment-1001085596
          onResponderGrant={() => true}
        />
        <View style={styles.timeTextContainer}>
          <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>
            {formatDuration(position)}
          </Text>
          <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>
            {formatDuration(displayTrack?.duration ?? 0)}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <IconButton
          icon="skip-previous"
          size={32}
          onPress={handlePrevious}
        />
        <IconButton
          icon={isPlaying ? 'pause' : 'play'}
          size={40}
          onPress={handlePlayPause}
        />
        <IconButton
          icon="skip-next"
          size={32}
          onPress={handleNext}
        />
      </View>

      <View style={styles.modeInfo}>
        <Text style={[styles.modeText, { color: colors.onSurfaceVariant }]}>
          Play mode:
          {' '}
          {mode === PlayMode.SINGLE ? 'Single' : mode === PlayMode.ORDERED ? 'Ordered' : 'Shuffle'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  slider: {
    alignSelf: 'center',
    width: screenWidth - 24,
  },
  timeTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  modeInfo: {
    alignItems: 'center',
  },
  modeText: {
    fontSize: 14,
    opacity: 0.6,
  },
})
