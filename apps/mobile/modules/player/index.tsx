import { useDisplayTrack } from '@flow/player'
import { useMemo, useRef, useState } from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import PagerView from 'react-native-pager-view'
import Animated, {
  clamp,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { MINI_HEIGHT } from '@/constants/Player'
import { useBackHandler } from '@/hooks/useBackHandler'
import { Context } from './Context'
import FullPlayer from './FullPlayer'
import MiniPlayer from './MiniPlayer'
import PlayerBackground from './PlayerBackground'
// import QueueList from './QueueList'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const MIN_VELOCITY = 500 // Velocity Threshold
const MIN_DISTANCE = 50 // Distance Threshold

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

export function Player() {
  const SNAP_MINI = SCREEN_HEIGHT - MINI_HEIGHT
  const SNAP_FULL = 0

  const [isFull, setIsFull] = useState(false)
  const [page, setPage] = useState(0)
  const pagerRef = useRef<PagerView>(null)

  // Init: show mini player
  const translateY = useSharedValue(SNAP_MINI)
  const prevTranslationY = useSharedValue(SNAP_MINI)

  const percent = useDerivedValue(() => {
    return interpolate(
      translateY.value,
      [SNAP_MINI, SNAP_FULL],
      [0, 1],
      Extrapolation.CLAMP,
    )
  })

  const thresholdPercent = useDerivedValue(() => {
    return interpolate(
      translateY.value,
      [SNAP_MINI, SNAP_MINI - MIN_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    )
  })

  const animateToPosition = (snap: 'MINI' | 'FULL') => {
    'worklet'
    translateY.value = withTiming(snap === 'MINI' ? SNAP_MINI : SNAP_FULL)
  }

  // Gesture: pan to show full player or queue list
  const pan = Gesture.Pan()
    .onStart((_event) => {
      prevTranslationY.value = translateY.value
    })
    .onUpdate((event) => {
      translateY.value = clamp(
        prevTranslationY.value + event.translationY,
        SNAP_FULL,
        SNAP_MINI,
      )
    })
    .onEnd((event) => {
      const velocity = event.velocityY

      // when velocity is greater than MIN_VELOCITY
      // animate to the final position
      if (Math.abs(velocity) > MIN_VELOCITY) {
        animateToPosition(velocity > 0 ? 'MINI' : 'FULL')
        return
      }

      // when velocity is less than MIN_VELOCITY
      // and distance is less than MIN_DISTANCE
      // animate to the previous position
      if (Math.abs(event.translationY) < MIN_DISTANCE) {
        // determine the final position based on the current position
        const currentPosition = translateY.value
        const isNearMini = Math.abs(currentPosition - SNAP_MINI) < Math.abs(currentPosition - SNAP_FULL)
        animateToPosition(isNearMini ? 'MINI' : 'FULL')
        return
      }

      // when velocity is less than MIN_VELOCITY
      // animate to the final position
      animateToPosition(event.translationY > 0 ? 'MINI' : 'FULL')
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const contextValue = useMemo(() => ({ percent, thresholdPercent }), [percent, thresholdPercent])

  useAnimatedReaction(
    () => thresholdPercent.value,
    (value) => {
      const newIsFull = value > 0.5
      if (newIsFull !== isFull) {
        runOnJS(setIsFull)(newIsFull)
      }
    },
    [isFull],
  )

  useBackHandler(isFull || page === 1, () => {
    if (page === 1) {
      pagerRef.current?.setPage(0)
    }
    else if (isFull) {
      animateToPosition('MINI')
    }
  })

  const displayTrack = useDisplayTrack()

  return (
    <Context value={contextValue}>
      <AnimatedPagerView
        ref={pagerRef}
        initialPage={0}
        style={[styles.container, animatedStyle]}
        orientation="vertical"
        onPageSelected={event => setPage(event.nativeEvent.position)}
        overScrollMode="never"
      >
        <GestureDetector gesture={pan}>
          <Animated.View style={{ flex: 1 }}>
            <PlayerBackground artworkUrl={displayTrack?.artwork ?? ''} />
            <MiniPlayer onPress={() => animateToPosition('FULL')} />
            <FullPlayer />
          </Animated.View>
        </GestureDetector>

        {/* <AnimatedPagerView style={{ flex: 1, backgroundColor: 'red', paddingVertical: 50 }}>
          <QueueList />
        </AnimatedPagerView> */}
      </AnimatedPagerView>
    </Context>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
})
