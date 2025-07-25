import { formatDuration } from '@flow/core'
import { playerController, PlayMode, useDisplayTrack, usePlaybackStore, usePlayerStore } from '@flow/player'
import Slider from '@react-native-community/slider'
import { useCallback, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { IconButton, Text, useTheme } from 'react-native-paper'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width: screenWidth } = Dimensions.get('screen')

export default function FullPlayerControl() {
  const { bottom } = useSafeAreaInsets()
  const { colors } = useTheme()
  const displayTrack = useDisplayTrack()
  const isPlaying = usePlayerStore.use.isPlaying()
  const mode = usePlayerStore.use.mode()
  const position = usePlaybackStore.use.position()

  const [slidingValue, setSlidingValue] = useState(0)

  // Slider animation values
  const isSliding = useSharedValue(false)
  const timeTextOpacity = useSharedValue(1)
  const timeTextScale = useSharedValue(1)
  const sliderElevation = useSharedValue(0)

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

  const handleSliderValueChange = useCallback((value: number) => {
    setSlidingValue(value)
    if (!isSliding.value) {
      isSliding.value = true
      timeTextOpacity.value = withTiming(0.6, { duration: 200 })
      timeTextScale.value = withTiming(0.95, { duration: 200 })
      sliderElevation.value = withTiming(4, { duration: 200 })
    }
  }, [isSliding, timeTextOpacity, timeTextScale, sliderElevation])

  const handleSliderSlidingComplete = useCallback((value: number) => {
    isSliding.value = false
    timeTextOpacity.value = withTiming(1, { duration: 300 })
    timeTextScale.value = withTiming(1, { duration: 300 })
    sliderElevation.value = withTiming(0, { duration: 300 })
    setSlidingValue(0)

    if (displayTrack?.duration && displayTrack.duration > 0) {
      playerController.seekTo(value)
    }
  }, [displayTrack?.duration, isSliding, timeTextOpacity, timeTextScale, sliderElevation])

  const timeTextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: timeTextOpacity.value,
    transform: [{ scale: timeTextScale.value }],
  }))

  const sliderAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + sliderElevation.value * 0.02 }],
  }))

  return (
    <View style={[styles.container, { paddingBottom: bottom + 36 }]}>
      <Animated.View style={sliderAnimatedStyle}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={displayTrack?.duration ?? 0}
          value={position}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.outline}
          thumbTintColor="transparent"
          onValueChange={handleSliderValueChange}
          onSlidingComplete={handleSliderSlidingComplete}
          // Fix outer pan gesture conflict
          // https://github.com/callstack/react-native-slider/issues/296#issuecomment-1001085596
          onResponderGrant={() => true}
        />
        <Animated.View style={[styles.timeTextContainer, timeTextAnimatedStyle]}>
          <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>
            {formatDuration(position)}
            {slidingValue > 0 && ` / ${formatDuration(slidingValue)}`}
          </Text>
          <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>
            {formatDuration(displayTrack?.duration ?? 0)}
          </Text>
        </Animated.View>
      </Animated.View>

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
    paddingHorizontal: 28,
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
