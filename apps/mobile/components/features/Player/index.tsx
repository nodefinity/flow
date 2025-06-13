import { StyleSheet } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { SNAP_FULL, SNAP_MINI, SNAP_QUEUE } from '@/constants/Player'
import FullPlayer from './FullPlayer'
import QueueList from './QueueList'

export function Player() {
  // Init: show mini player
  const translateY = useSharedValue(SNAP_MINI)
  const prevTranslationY = useSharedValue(0)

  // Gesture: pan to show full player or queue list
  const pan = Gesture.Pan()
    .onStart((event) => {
      console.log('onStart', event)
      prevTranslationY.value = translateY.value
    })
    .onUpdate((event) => {
      translateY.value = event.translationY

      let minY = SNAP_QUEUE
      let maxY = SNAP_MINI

      if (translateY.value >= SNAP_MINI) {
        maxY = SNAP_FULL
      }
      else if (translateY.value <= SNAP_QUEUE) {
        minY = SNAP_FULL
      }

      const newTranslationY = clamp(
        prevTranslationY.value + event.translationY,
        minY,
        maxY,
      )

      console.log('newTranslationY', newTranslationY, event.translationY, prevTranslationY.value, translateY.value)

      translateY.value = newTranslationY
    })
    .onEnd(() => {
      console.log('onEnd')
    })
    .runOnJS(true)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <FullPlayer />
        <QueueList />
      </Animated.View>
    </GestureDetector>
  )
}
