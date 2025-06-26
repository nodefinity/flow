import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

interface ScrollingTextProps {
  text: string
  speed?: number // 滚动速度（像素/秒）
  delay?: number // 开始滚动前的延迟（毫秒）
  style?: any
}

export function ScrollingText({
  text,
  speed = 40,
  delay = 0,
  style,
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
      const scrollDistance = textWidth + 50 // textWidth + marginLeft
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
  }, [shouldScroll, textWidth, containerWidth, speed, delay])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sharedValue.value }],
    }
  })

  // 计算渐变颜色
  const shadowColor = '#121212'
  // This will enable support of hexadecimal colors with opacity.
  const startColor = useMemo(
    () =>
      `${shadowColor.length === 7 ? shadowColor : shadowColor.slice(0, 7)}00`,
    [shadowColor],
  )
  const endColor = useMemo(
    () => (shadowColor.length === 7 ? `${shadowColor}E6` : shadowColor),
    [shadowColor],
  )

  // Styles to determine when to render the scroll shadow.
  const isLeftVisible = useAnimatedStyle(() => ({
    display: sharedValue.value < 0 ? 'flex' : 'none',
  }), [])
  const isRightVisible = useAnimatedStyle(() => ({
    display: sharedValue.value > -(textWidth - containerWidth) ? 'flex' : 'none',
  }), [textWidth, containerWidth])

  return (
    <View style={{ position: 'relative' }}>
      {/* 完全独立的测量Text - 不受任何容器限制 */}
      <Animated.ScrollView
        contentContainerStyle={{ flex: 1 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <Text
          style={[styles.measureText, style]}
          onLayout={(e) => {
            const width = e.nativeEvent.layout.width
            // 只在宽度真正改变时才更新
            if (width !== textWidth) {
              setTextWidth(width)
            }
          }}
        >
          {text}
        </Text>
      </Animated.ScrollView>

      {/* 实际显示的滚动容器 */}
      <Animated.ScrollView
        style={styles.scrollContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={(e) => {
          const width = e.nativeEvent.layout.width
          // 只在宽度真正改变时才更新
          if (width !== containerWidth) {
            setContainerWidth(width)
          }
        }}
      >
        <Animated.View style={[{ width: textWidth * 2 }, styles.contentContainer, animatedStyle]}>
          {/* 第一个文本 */}
          <Text style={style}>
            {text}
          </Text>
          {/* 第二个文本 - 用于循环效果 */}
          {
            shouldScroll && (
              <Text style={[style, styles.secondText]}>
                {text}
              </Text>
            )
          }
        </Animated.View>
      </Animated.ScrollView>

      {/* Scroll Shadow */}
      <Animated.View
        pointerEvents="none"
        style={[styles.leftShadow, isLeftVisible]}
      >
        <LinearGradient
          colors={[endColor, startColor]}
          style={styles.gradient}
          {...ShadowProps}
        />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[styles.rightShadow, isRightVisible]}
      >
        <LinearGradient
          colors={[startColor, endColor]}
          style={styles.gradient}
          {...ShadowProps}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  measureText: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    top: -9999,
    left: -9999,
    flexShrink: 0,
    textAlign: 'left',
  },
  scrollContainer: {
    overflow: 'hidden',
  },
  leftShadow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    height: '100%',
    width: 4,
    zIndex: 1,
  },
  rightShadow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    height: '100%',
    width: 4,
    zIndex: 1,
  },
  gradient: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondText: {
    marginLeft: 50,
  },
})

const ShadowProps = {
  start: { x: 0.0, y: 1.0 },
  end: { x: 1.0, y: 1.0 },
}
