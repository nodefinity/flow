import type { ViewProps } from 'react-native'
import { View } from 'react-native'

export function ThemedView({ className, style, ...props }: ViewProps & { className?: string }) {
  return <View className={`bg-background ${className ?? ''}`} style={style} {...props} />
}
