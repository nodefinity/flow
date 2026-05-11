import { LinearGradient } from 'expo-linear-gradient'
import { View } from 'react-native'
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { useColors } from '@/hooks/useColors'
import { usePlayerContext } from './Context'

const abs = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 }

export default function PlayerBackground() {
  const colors = useColors()
  const { thresholdPercent, artworkColors } = usePlayerContext()

  const dominant = artworkColors.dominant || colors.primary
  const vibrant = artworkColors.vibrant || colors.secondary
  const muted = artworkColors.muted || colors.muted

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(thresholdPercent.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }))

  return (
    <Animated.View style={[abs, { flex: 1 }, animatedStyle]}>
      <View style={[abs, { backgroundColor: colors.background }]} />
      <LinearGradient colors={[`${dominant}25`, `${muted}15`, 'transparent']} style={abs} start={{ x: 0.5, y: 0.6 }} end={{ x: 0.3, y: 0 }} locations={[0, 0.4, 1]} />
      <LinearGradient colors={[`${vibrant}20`, `${muted}12`, 'transparent']} style={abs} start={{ x: 0.5, y: 0.6 }} end={{ x: 0.7, y: 1 }} locations={[0, 0.5, 1]} />
      <LinearGradient colors={[`${dominant}25`, `${muted}15`, 'transparent']} style={abs} start={{ x: 0.5, y: 0.6 }} end={{ x: 0, y: 0.8 }} locations={[0, 0.6, 1]} />
      <LinearGradient colors={[`${vibrant}25`, `${muted}15`, 'transparent']} style={abs} start={{ x: 0.5, y: 0.6 }} end={{ x: 1, y: 0.4 }} locations={[0, 0.6, 1]} />
    </Animated.View>
  )
}
