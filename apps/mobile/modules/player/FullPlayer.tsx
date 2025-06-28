import { useDisplayTrack } from '@flow/player'
import { StyleSheet, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { Text, useTheme } from 'react-native-paper'
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { usePlayerAnimation } from './Context'
import FullPlayerArtwork from './FullPlayerArtwork'
import FullPlayerControl from './FullPlayerControl'
import FullPlayerHeader from './FullPlayerHeader'

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

export default function FullPlayer() {
  const { colors } = useTheme()
  const { thresholdPercent } = usePlayerAnimation()

  const displayTrack = useDisplayTrack()

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      thresholdPercent.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }))

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <FullPlayerHeader />

      <AnimatedPagerView style={styles.container} initialPage={1} orientation="horizontal">
        <View style={styles.page} key="1">
          <Text style={[styles.pageTitle, { color: colors.onBackground }]}>Track Info</Text>
          <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>
            {displayTrack?.title || 'No track selected'}
          </Text>
        </View>

        <FullPlayerArtwork />

        <View style={styles.page} key="3">
          <Text style={[styles.pageTitle, { color: colors.onBackground }]}>Lyrics</Text>
          <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>No lyrics</Text>
        </View>
      </AnimatedPagerView>

      <FullPlayerControl />
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
})
