import { LinearGradient } from 'expo-linear-gradient'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { useArtworkColors } from '@/hooks/useArtworkColors'
import { usePlayerAnimation } from './Context'

interface PlayerBackgroundProps {
  artworkUrl?: string
}

export default function PlayerBackground({ artworkUrl }: PlayerBackgroundProps) {
  const { dominant, vibrant, muted } = useArtworkColors(artworkUrl)
  const { colors } = useTheme()
  const { thresholdPercent } = usePlayerAnimation()

  // 确保颜色值有效
  const safeVibrant = vibrant || colors.primary
  const safeDominant = dominant || colors.secondary
  const safeMuted = muted || colors.outline

  const baseStyle = {
    flex: 1,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      thresholdPercent.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }))

  return (
    <Animated.View style={[baseStyle, animatedStyle]}>
      {/* 基础背景色 */}
      <View style={[baseStyle, { backgroundColor: colors.elevation.level1 }]} />

      {/* 从专辑中心向上左发散 */}
      <LinearGradient
        colors={[
          `${safeDominant}25`, // 专辑区域：更柔和
          `${safeMuted}15`, // 中间区域：更淡
          'transparent', // 边缘：透明
        ]}
        style={baseStyle}
        start={{ x: 0.5, y: 0.6 }} // 从专辑位置开始
        end={{ x: 0.3, y: 0 }} // 向上左斜发散
        locations={[0, 0.4, 1]}
      />

      {/* 从专辑中心向下右发散 */}
      <LinearGradient
        colors={[
          `${safeVibrant}20`, // 专辑区域：更柔和
          `${safeMuted}12`, // 中间区域：更淡
          'transparent', // 边缘：透明
        ]}
        style={baseStyle}
        start={{ x: 0.5, y: 0.6 }} // 从专辑位置开始
        end={{ x: 0.7, y: 1 }} // 向下右斜发散
        locations={[0, 0.5, 1]}
      />

      {/* 从专辑中心向左下发散 */}
      <LinearGradient
        colors={[
          `${safeDominant}25`, // 专辑区域：增加亮度
          `${safeMuted}15`, // 中间区域：增加亮度
          'transparent', // 边缘：透明
        ]}
        style={baseStyle}
        start={{ x: 0.5, y: 0.6 }} // 从专辑位置开始
        end={{ x: 0, y: 0.8 }} // 向左下斜发散
        locations={[0, 0.6, 1]}
      />

      {/* 从专辑中心向右上发散 */}
      <LinearGradient
        colors={[
          `${safeVibrant}25`, // 专辑区域：增加亮度
          `${safeMuted}15`, // 中间区域：增加亮度
          'transparent', // 边缘：透明
        ]}
        style={baseStyle}
        start={{ x: 0.5, y: 0.6 }} // 从专辑位置开始
        end={{ x: 1, y: 0.4 }} // 向右上斜发散
        locations={[0, 0.6, 1]}
      />

      {/* 对角线发散增强效果 */}
      <LinearGradient
        colors={[
          `${safeDominant}12`, // 专辑区域：非常柔和
          'transparent', // 边缘：透明
        ]}
        style={baseStyle}
        start={{ x: 0.5, y: 0.6 }} // 从专辑位置开始
        end={{ x: 0, y: 0 }} // 向左上角发散
        locations={[0, 1]}
      />

      <LinearGradient
        colors={[
          `${safeVibrant}12`, // 专辑区域：非常柔和
          'transparent', // 边缘：透明
        ]}
        style={baseStyle}
        start={{ x: 0.5, y: 0.6 }} // 从专辑位置开始
        end={{ x: 1, y: 0 }} // 向右上角发散
        locations={[0, 1]}
      />
    </Animated.View>
  )
}
