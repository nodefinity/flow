import type { StyleProp, ViewStyle } from 'react-native'
import type { NavigationState, Route, SceneRendererProps } from 'react-native-tab-view'
import { useEffect, useRef } from 'react'
import { useTheme } from 'react-native-paper'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

type TabBarIndicatorProps<T extends Route> = SceneRendererProps & {
  navigationState: NavigationState<T>
  width: 'auto' | `${number}%` | number
  getTabWidth: (index: number) => number
  style?: StyleProp<ViewStyle>
  gap?: number
}

export function TabBarIndicator<T extends Route>({
  navigationState,
  width,
  getTabWidth,
  layout,
  position: _position, // can't use position because it's react native Animated value
  style,
  gap,
}: TabBarIndicatorProps<T>) {
  const { colors } = useTheme()

  const isIndicatorShown = useRef(false)
  const isWidthDynamic = width === 'auto'
  const indicatorVisible = isWidthDynamic
    ? layout.width
    && navigationState.routes
      .slice(0, navigationState.index)
      .every((_, r) => getTabWidth(r))
    : true

  const tabWidth = useSharedValue(0)
  const opacity = useSharedValue(isWidthDynamic ? 0 : 1)
  const translateX = useSharedValue(0)

  const animatedStyles = useAnimatedStyle(() => {
    console.log('animatedStyles', opacity.value, tabWidth.value, translateX.value)
    return {
      width: tabWidth.value,
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    }
  })

  useEffect(() => {
    if (!isIndicatorShown.current && isWidthDynamic && indicatorVisible) {
      opacity.value = withTiming(1, { duration: 150, easing: Easing.in(Easing.linear) })
    }
  }, [indicatorVisible, isWidthDynamic, opacity, isIndicatorShown])

  useEffect(() => {
    const currentIndex = navigationState.index
    let sumWidth = 0
    for (let i = 0; i < currentIndex; i++) {
      sumWidth += getTabWidth(i) + (gap ?? 0)
    }

    tabWidth.value = withTiming(getTabWidth(navigationState.index), { duration: 150, easing: Easing.in(Easing.linear) })
    translateX.value = withTiming(sumWidth, { duration: 150, easing: Easing.in(Easing.linear) })
  }, [navigationState.index, getTabWidth(navigationState.index)])

  return (
    <Animated.View
      style={[{
        backgroundColor: colors.primary,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
      }, style, animatedStyles]}
      testID="tab-bar-indicator"
    />
  )
}
