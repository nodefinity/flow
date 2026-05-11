import type { TextProps } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

interface ScrollingTextProps extends TextProps {
  speed?: number
  delay?: number
  shadowColor?: string
  shadowWidth?: number
  loopGap?: number
}

export function ScrollingText({
  speed = 40,
  delay = 1000,
  shadowColor = 'transparent',
  shadowWidth = 32,
  loopGap = 50,
  children,
  style,
  ...textProps
}: ScrollingTextProps) {
  const [shouldScroll, setShouldScroll] = useState(false)
  const [textWidth, setTextWidth] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const sharedValue = useSharedValue(0)

  useEffect(() => {
    if (textWidth > containerWidth && containerWidth > 0) {
      setShouldScroll(true)
    }
    else {
      setShouldScroll(false)
      sharedValue.value = 0
    }
  }, [textWidth, containerWidth])

  useEffect(() => {
    if (shouldScroll) {
      const scrollDistance = textWidth + loopGap
      const duration = (scrollDistance / speed) * 1000
      const timer = setTimeout(() => {
        sharedValue.value = withRepeat(
          withTiming(-scrollDistance, { duration, easing: Easing.linear }),
          -1,
          false,
        )
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [shouldScroll, textWidth, speed, delay])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sharedValue.value }],
  }))

  return (
    <Animated.View style={{ position: 'relative', width: '100%' }}>
      {shouldScroll && (
        <LinearGradient
          colors={[shadowColor, 'transparent']}
          style={[styles.shadow, { left: 0, width: shadowWidth }]}
          pointerEvents="none"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}
      {shouldScroll && (
        <LinearGradient
          colors={['transparent', shadowColor]}
          style={[styles.shadow, { right: 0, width: shadowWidth }]}
          pointerEvents="none"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View style={[styles.contentContainer, animatedStyle]}>
          <Text
            {...textProps}
            style={style}
            onLayout={e => setTextWidth(e.nativeEvent.layout.width)}
            numberOfLines={1}
          >
            {children}
          </Text>
          {shouldScroll && (
            <Text {...textProps} style={[style, { marginLeft: loopGap }]} numberOfLines={1}>
              {children}
            </Text>
          )}
        </Animated.View>
      </Animated.ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shadow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 2,
  },
})
