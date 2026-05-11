import { playerController, PlayMode, useDisplayTrack, usePlaybackStore, usePlayerStore } from '@flow/player'
import { formatDuration } from '@flow/shared'
import Slider from '@react-native-community/slider'
import { useCallback, useState } from 'react'
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '@/hooks/useColors'
import { QueueList } from './QueueList'

const { width: screenWidth } = Dimensions.get('screen')

function IconBtn({ onPress, children }: { onPress: () => void, children: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} style={styles.iconBtn} hitSlop={8}>
      {children}
    </Pressable>
  )
}

export default function FullPlayerControl() {
  const { bottom } = useSafeAreaInsets()
  const colors = useColors()
  const displayTrack = useDisplayTrack()
  const isPlaying = usePlayerStore.use.isPlaying()
  const mode = usePlayerStore.use.mode()
  const position = usePlaybackStore.use.position()
  const [queueVisible, setQueueVisible] = useState(false)
  const [slidingValue, setSlidingValue] = useState(0)

  const isSliding = useSharedValue(false)
  const timeOpacity = useSharedValue(1)
  const timeScale = useSharedValue(1)
  const sliderScale = useSharedValue(0)

  const handlePlayPause = useCallback(() => {
    isPlaying ? playerController.pause() : playerController.play()
  }, [isPlaying])

  const handleModeChange = useCallback(() => {
    const next = mode === PlayMode.SINGLE ? PlayMode.ORDERED : mode === PlayMode.ORDERED ? PlayMode.SHUFFLE : PlayMode.SINGLE
    playerController.setMode(next)
  }, [mode])

  const modeIcon = { [PlayMode.SINGLE]: '↺¹', [PlayMode.ORDERED]: '↺', [PlayMode.SHUFFLE]: '⇄' }[mode] ?? '↺'

  const handleSliderChange = useCallback((value: number) => {
    setSlidingValue(value)
    if (!isSliding.value) {
      isSliding.value = true
      timeOpacity.value = withTiming(0.6, { duration: 200 })
      timeScale.value = withTiming(0.95, { duration: 200 })
      sliderScale.value = withTiming(4, { duration: 200 })
    }
  }, [isSliding, timeOpacity, timeScale, sliderScale])

  const handleSliderComplete = useCallback((value: number) => {
    isSliding.value = false
    timeOpacity.value = withTiming(1, { duration: 300 })
    timeScale.value = withTiming(1, { duration: 300 })
    sliderScale.value = withTiming(0, { duration: 300 })
    setSlidingValue(0)
    if (displayTrack?.duration)
      playerController.seekTo(value)
  }, [displayTrack?.duration, isSliding, timeOpacity, timeScale, sliderScale])

  const timeStyle = useAnimatedStyle(() => ({ opacity: timeOpacity.value, transform: [{ scale: timeScale.value }] }))
  const sliderStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + sliderScale.value * 0.02 }] }))

  return (
    <View style={[styles.container, { paddingBottom: bottom + 36 }]}>
      <Animated.View style={sliderStyle}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={displayTrack?.duration ?? 0}
          value={position}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor="transparent"
          onValueChange={handleSliderChange}
          onSlidingComplete={handleSliderComplete}
          onResponderGrant={() => true}
        />
        <Animated.View style={[styles.timeRow, timeStyle]}>
          <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
            {formatDuration(position)}
            {slidingValue > 0 ? ` / ${formatDuration(slidingValue)}` : ''}
          </Text>
          <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
            {formatDuration(displayTrack?.duration ?? 0)}
          </Text>
        </Animated.View>
      </Animated.View>

      <View style={styles.controls}>
        <IconBtn onPress={handleModeChange}>
          <Text style={{ color: colors.foreground, fontSize: 18 }}>{modeIcon}</Text>
        </IconBtn>
        <IconBtn onPress={() => playerController.prev()}>
          <Text style={{ color: colors.foreground, fontSize: 28 }}>⏮</Text>
        </IconBtn>
        <IconBtn onPress={handlePlayPause}>
          <Text style={{ color: colors.foreground, fontSize: 36 }}>{isPlaying ? '⏸' : '▶'}</Text>
        </IconBtn>
        <IconBtn onPress={() => playerController.next()}>
          <Text style={{ color: colors.foreground, fontSize: 28 }}>⏭</Text>
        </IconBtn>
        <IconBtn onPress={() => setQueueVisible(true)}>
          <Text style={{ color: colors.foreground, fontSize: 18 }}>☰</Text>
        </IconBtn>
      </View>

      <QueueList visible={queueVisible} onDismiss={() => setQueueVisible(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 28 },
  slider: { alignSelf: 'center', width: screenWidth - 26 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  iconBtn: { padding: 8, alignItems: 'center', justifyContent: 'center' },
})
