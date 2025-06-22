import { PlayMode } from '@flow/store'
import { useCallback } from 'react'
import { Dimensions, Image, StyleSheet, View } from 'react-native'
import { AudioProState, useAudioPro } from 'react-native-audio-pro'
import PagerView from 'react-native-pager-view'
import { IconButton, Text, useTheme } from 'react-native-paper'
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { usePlayerControl } from '@/hooks/usePlayerControl'
import { usePlayerAnimation } from './Context'

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)
const { width: screenWidth } = Dimensions.get('window')

export default function FullPlayer() {
  const { colors } = useTheme()
  const { thresholdPercent } = usePlayerAnimation()
  const { state, playingTrack } = useAudioPro()
  const { currentTrack, playPause, playNext, playPrevious, mode } = usePlayerControl()

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      thresholdPercent.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }))

  const handlePlayPause = useCallback(() => {
    playPause()
  }, [playPause])

  const handleNext = useCallback(() => {
    playNext(true)
  }, [playNext])

  const handlePrevious = useCallback(() => {
    playPrevious(true)
  }, [playPrevious])

  const displayTrack = currentTrack || playingTrack

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background }, animatedStyle]}>
      <AnimatedPagerView style={styles.container} initialPage={1} orientation="horizontal">
        <View style={styles.page} key="1">
          <Text style={[styles.pageTitle, { color: colors.onBackground }]}>Track Info</Text>
          <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>
            {displayTrack?.title || 'No track selected'}
          </Text>
        </View>

        <View style={styles.page} key="2">
          <View style={styles.artworkContainer}>
            <Image
              source={{ uri: displayTrack?.artwork as string }}
              style={styles.artwork}
              resizeMode="cover"
            />
          </View>

          <View style={styles.trackInfo}>
            <Text style={[styles.title, { color: colors.onBackground }]} numberOfLines={2}>
              {displayTrack?.title || '未播放'}
            </Text>
            <Text style={[styles.artist, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
              {displayTrack?.artist || '未知艺术家'}
            </Text>
          </View>

          <View style={styles.controls}>
            <IconButton
              icon="skip-previous"
              size={32}
              onPress={handlePrevious}
              iconColor={colors.onBackground}
            />
            <IconButton
              icon={state === AudioProState.PLAYING ? 'pause-circle' : 'play-circle'}
              size={64}
              onPress={handlePlayPause}
              iconColor={colors.primary}
            />
            <IconButton
              icon="skip-next"
              size={32}
              onPress={handleNext}
              iconColor={colors.onBackground}
            />
          </View>

          <View style={styles.modeInfo}>
            <Text style={[styles.modeText, { color: colors.onSurfaceVariant }]}>
              Play mode:
              {' '}
              {mode === PlayMode.SINGLE ? 'Single' : mode === PlayMode.ORDERED ? 'Ordered' : 'Shuffle'}
            </Text>
          </View>
        </View>

        <View style={styles.page} key="3">
          <Text style={[styles.pageTitle, { color: colors.onBackground }]}>Lyrics</Text>
          <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>No lyrics</Text>
        </View>
      </AnimatedPagerView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  artworkContainer: {
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  artwork: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.7,
    borderRadius: 16,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  artist: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
  },
  modeInfo: {
    alignItems: 'center',
  },
  modeText: {
    fontSize: 14,
    opacity: 0.6,
  },
})
