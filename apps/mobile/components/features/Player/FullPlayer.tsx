import { StyleSheet, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { Text } from 'react-native-paper'
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { usePlayerAnimation } from './Context'

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
      <AnimatedPagerView style={styles.container} initialPage={1} orientation="horizontal">
        <View style={styles.page} key="1">
          <Text>First page</Text>
          <Text>Swipe ➡️</Text>
        </View>
        <View style={styles.page} key="2">
          <Text>Second page</Text>
        </View>
        <View style={styles.page} key="3">
          <Text>Third page</Text>
        </View>
      </AnimatedPagerView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#444',
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
