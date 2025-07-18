import { StyleSheet } from 'react-native'
import PagerView from 'react-native-pager-view'
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { usePlayerAnimation } from './Context'
import FullPlayerArtwork from './FullPlayerArtwork'
import FullPlayerControl from './FullPlayerControl'
import FullPlayerHeader from './FullPlayerHeader'

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

export default function FullPlayer() {
  const { thresholdPercent } = usePlayerAnimation()

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      thresholdPercent.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }))

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <FullPlayerHeader />

      <AnimatedPagerView style={styles.container} initialPage={1} orientation="horizontal">
        <FullPlayerArtwork />
      </AnimatedPagerView>

      <FullPlayerControl />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
})
