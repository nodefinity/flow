import { AntDesign } from '@expo/vector-icons'
import { playerController, useDisplayTrack, usePlayerStore } from '@flow/player'
import { useCallback } from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { IconButton, Text, useTheme } from 'react-native-paper'
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollingText } from '@/components/ui/ScrollingText'
import { MINI_HEIGHT } from '@/constants/Player'
import { useTrackActionSheet } from '@/hooks/useTrackActionSheet'
import { usePlayerAnimation } from './Context'

export default function MiniPlayer({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme()
  const { bottom } = useSafeAreaInsets()
  console.log('bottom', bottom)
  const { thresholdPercent } = usePlayerAnimation()
  const isPlaying = usePlayerStore.use.isPlaying()
  const displayTrack = useDisplayTrack()
  const { show } = useTrackActionSheet()

  const opacity = useDerivedValue(() => {
    return interpolate(thresholdPercent.value, [0, 1], [1, 0], Extrapolation.CLAMP)
  })

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    }
  })

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      playerController.pause()
    }
    else {
      playerController.play()
    }
  }, [isPlaying])

  // const handleNext = useCallback(() => {
  //   playerController.next()
  // }, [])

  if (!displayTrack)
    return null

  return (
    <Animated.View style={
      [
        styles.container,
        { height: MINI_HEIGHT, backgroundColor: colors.elevation.level1, paddingBottom: bottom },
        animatedStyle,
      ]
    }
    >
      <Pressable onPress={onPress} style={styles.content}>
        <View style={styles.trackInfo}>
          <Image source={{ uri: displayTrack.artwork }} style={{ width: 40, height: 40, borderRadius: 4 }} />

          <View style={styles.trackInfoText} key={displayTrack.id}>
            <ScrollingText style={styles.title} shadowColor={colors.elevation.level1}>
              {displayTrack.title}
            </ScrollingText>
            <Text numberOfLines={1} style={styles.artist}>
              {displayTrack.artist}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <IconButton
            icon={isPlaying ? 'pause' : 'play'}
            size={24}
            onPress={handlePlayPause}
          />
          <Pressable
            style={styles.menuButton}
            onPress={() => show(displayTrack)}
          >
            <AntDesign
              name="menu-unfold"
              size={20}
              color={colors.onSurface}
            />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingLeft: 16,
    paddingRight: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackInfoText: {
    flex: 1,
  },
  trackInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  artist: {
    fontSize: 14,
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
