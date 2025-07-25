import { StyleSheet, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { usePlayerAnimation } from './Context'
import FullPlayerArtwork from './FullPlayerArtwork'
import FullPlayerControl from './FullPlayerControl'
import FullPlayerHeader from './FullPlayerHeader'
import LyricsView from './LyricsView'

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

export default function FullPlayer() {
  const { thresholdPercent } = usePlayerAnimation()

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

      <AnimatedPagerView style={styles.pagerContainer} initialPage={0} orientation="horizontal">
        <View style={styles.artworkPage}>
          <FullPlayerArtwork />
          <View style={styles.artworkPageLyrics}>
            <LyricsView mode="mini" />
          </View>
        </View>

        <View style={styles.lyricsPage}>
          <LyricsView mode="full" />
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
  pagerContainer: {
    flex: 1,
  },
  artworkPage: {
    flex: 1,
  },
  artworkPageLyrics: {
    flex: 1,
    marginVertical: 10,
  },
  lyricsPage: {
    flex: 1,
    paddingVertical: 20,
  },
})
