import type { ViewProps } from 'react-native'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'

export type ThemedViewProps = ViewProps & {
  lightColor?: string
  darkColor?: string
}

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { colors } = useTheme()

  return <View style={[{ backgroundColor: colors.background }, style]} {...otherProps} />
}
