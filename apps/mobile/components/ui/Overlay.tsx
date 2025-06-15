import type { ViewStyle } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import { Pressable, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'

interface Props {
  active: SharedValue<boolean>
}

function Overlay({ active }: Props) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      display: active.value ? 'flex' : 'none',
    }
  })
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        style={styles.container}
        onPress={() => {
          active.value = false
        }}
      />
    </Animated.View>
  )
}

export default Overlay

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  } as ViewStyle,
})
