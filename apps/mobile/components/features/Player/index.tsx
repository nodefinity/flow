import { Dimensions, StyleSheet } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { MINI_HEIGHT } from '@/constants/Player'
import FullPlayer from './FullPlayer'
import QueueList from './QueueList'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export function Player() {
  const SNAP_MINI = MINI_HEIGHT
  // const SNAP_FULL = SCREEN_HEIGHT
  // const SNAP_QUEUE = SCREEN_HEIGHT * 2

  // Init: show mini player
  const translateY = useSharedValue(SCREEN_HEIGHT - SNAP_MINI)
  const prevTranslationY = useSharedValue(0)

  // Gesture: pan to show full player or queue list
  const pan = Gesture.Pan()
    .onStart((event) => {
      console.log('onStart', event)
      prevTranslationY.value = translateY.value
    })
    .onUpdate((event) => {
      // translateY.value = event.translationY

      const minY = 0
      const maxY = SCREEN_HEIGHT

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
