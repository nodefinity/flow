import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated'
import { useThemeColor } from '@/hooks/useThemeColor'
import { usePlayerAnimation } from './Context'

export default function MiniPlayer({ height }: { height: number }) {
  const colors = useThemeColor()
  const { thresholdPercent } = usePlayerAnimation()

  const opacity = useDerivedValue(() => {
    return interpolate(thresholdPercent.value, [0, 1], [1, 0], Extrapolation.CLAMP)
  })

  const animatedStyle = useAnimatedStyle(() => {
    console.log('opacity', opacity.value)
    return {
      opacity: opacity.value,
    }
  })

  return (
    <Animated.View style={[styles.container, { height, backgroundColor: colors.background }, animatedStyle]}>
      <Text>MiniPlayer - Swipe Up To FullPlayer</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
