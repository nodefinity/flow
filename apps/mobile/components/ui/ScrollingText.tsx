import type { TextProps } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

interface ScrollingTextProps extends TextProps<string> {
  speed?: number // 滚动速度（像素/秒）
  delay?: number // 开始滚动前的延迟（毫秒）
  shadowColor?: string
  shadowWidth?: number
  loopGap?: number // 循环文本的间距
}

export function ScrollingText({
  speed = 40,
  delay = 1000,
  shadowColor = 'transparent',
  shadowWidth = 32,
  loopGap = 50,
  children,
  ...textProps
}: ScrollingTextProps) {
  const [shouldScroll, setShouldScroll] = useState(false)
  const [textWidth, setTextWidth] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const sharedValue = useSharedValue(0)

  // 检测文本是否需要滚动
  useEffect(() => {
    if (textWidth > containerWidth && containerWidth > 0) {
      setShouldScroll(true)
    }
    else {
      setShouldScroll(false)
      sharedValue.value = 0
    }
  }, [textWidth, containerWidth])

  // 启动滚动动画
  useEffect(() => {
    if (shouldScroll) {
      // 滚动距离是文本宽度加上间距，确保无缝循环
      const scrollDistance = textWidth + loopGap // textWidth + marginLeft
      const duration = (scrollDistance / speed) * 1000 // 转换为毫秒

      // 延迟后开始滚动
      const timer = setTimeout(() => {
        sharedValue.value = withRepeat(
          withTiming(-scrollDistance, {
            duration,
            easing: Easing.linear,
          }),
          -1,
          false, // 不反向，实现循环滚动
        )
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [shouldScroll, textWidth, speed, delay])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sharedValue.value }],
    }
  })

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

      {/* 实际显示的滚动容器 */}
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View style={[styles.contentContainer, animatedStyle]}>
          {/* 第一个文本 */}
          <Text
            {...textProps}
            onLayout={e => setTextWidth(e.nativeEvent.layout.width)}
            numberOfLines={1}
          >
            {children}
          </Text>
          {/* 第二个文本 - 用于循环效果 */}
          {
            shouldScroll && (
              <Text
                {...textProps}
                style={[textProps.style, { marginLeft: loopGap }]}
                numberOfLines={1}
              >
                {children}
              </Text>
            )
          }
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
