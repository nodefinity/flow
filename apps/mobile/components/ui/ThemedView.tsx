import type { ViewProps } from 'react-native'
import Animated from 'react-native-reanimated'
import { useThemeColor } from '@/hooks/useThemeColor'

export type ThemedViewProps = ViewProps & {
  lightColor?: string
  darkColor?: string
}

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor('background')

  return <Animated.View style={[{ backgroundColor }, style]} {...otherProps} />
}
