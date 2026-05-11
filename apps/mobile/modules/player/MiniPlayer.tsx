import { playerController, useDisplayTrack, usePlayerStore } from '@flow/player'
import { useCallback } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated'
import { ScrollingText } from '@/components/ui/ScrollingText'
import { MINI_HEIGHT } from '@/constants/Player'
import { useColors } from '@/hooks/useColors'
import { usePlayerContext } from './Context'

export default function MiniPlayer({ onPress }: { onPress: () => void }) {
  const colors = useColors()
  const { thresholdPercent } = usePlayerContext()
  const isPlaying = usePlayerStore.use.isPlaying()
  const displayTrack = useDisplayTrack()

  const opacity = useDerivedValue(() =>
    interpolate(thresholdPercent.value, [0, 1], [1, 0], Extrapolation.CLAMP),
  )
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  const handlePlayPause = useCallback(() => {
    isPlaying ? playerController.pause() : playerController.play()
  }, [isPlaying])

  if (!displayTrack)
    return null

  return (
    <Animated.View style={[styles.container, { height: MINI_HEIGHT, backgroundColor: colors.card }, animatedStyle]}>
      <Pressable onPress={onPress} style={styles.content}>
        <View style={styles.track}>
          <Image source={{ uri: displayTrack.artwork }} style={styles.artwork} />
          <View style={styles.text}>
            <ScrollingText style={[styles.title, { color: colors.foreground }]} shadowColor={colors.card}>
              {displayTrack.title}
            </ScrollingText>
            <Text style={[styles.artist, { color: colors.mutedForeground }]} numberOfLines={1}>
              {displayTrack.artist}
            </Text>
          </View>
        </View>
        <View style={styles.controls}>
          <Pressable onPress={handlePlayPause} style={styles.controlBtn} hitSlop={8}>
            <Text style={{ color: colors.foreground, fontSize: 22 }}>{isPlaying ? '⏸' : '▶'}</Text>
          </Pressable>
          <Pressable onPress={() => playerController.next()} style={styles.controlBtn} hitSlop={8}>
            <Text style={{ color: colors.foreground, fontSize: 22 }}>⏭</Text>
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', paddingLeft: 16, paddingRight: 4 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  track: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  artwork: { width: 40, height: 40, borderRadius: 4 },
  text: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600' },
  artist: { fontSize: 13, marginTop: 1 },
  controls: { flexDirection: 'row', alignItems: 'center' },
  controlBtn: { padding: 8 },
})
