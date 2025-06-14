import type { AudioProTrack } from 'react-native-audio-pro'
import { useTrackStore } from '@flow/core'
import { useCallback, useEffect } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { AudioPro, AudioProState, useAudioPro } from 'react-native-audio-pro'
import { IconButton, Text } from 'react-native-paper'
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated'
import { useThemeColor } from '@/hooks/useThemeColor'
import { usePlayerAnimation } from './Context'

export default function MiniPlayer({ height }: { height: number }) {
  const colors = useThemeColor()
  const { thresholdPercent } = usePlayerAnimation()
  const { state, playingTrack } = useAudioPro()
  const { playQueue, tracks } = useTrackStore()

  const opacity = useDerivedValue(() => {
    return interpolate(thresholdPercent.value, [0, 1], [1, 0], Extrapolation.CLAMP)
  })

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    }
  })

  useEffect(() => {
    console.log('state', state)
  }, [state])

  const handlePlayPause = useCallback(() => {
    if (state === AudioProState.PLAYING) {
      AudioPro.pause()
    }
    else if (state === AudioProState.PAUSED) {
      AudioPro.resume()
    }
  }, [state])

  const handleNext = useCallback(() => {
    const currentIndex = playQueue.findIndex(id => id === playingTrack?.id)
    const nextIndex = (currentIndex + 1) % playQueue.length
    const nextTrackId = playQueue[nextIndex]
    const nextTrack = tracks.find(track => track.id === nextTrackId)

    if (nextTrack) {
      const audioProTrack: AudioProTrack = {
        id: nextTrack.id,
        title: nextTrack.title,
        artist: nextTrack.artist,
        artwork: nextTrack.artwork,
        url: nextTrack.url,
        duration: nextTrack.duration,
      }
      AudioPro.play(audioProTrack, { autoPlay: true })
    }
  }, [playingTrack?.id, playQueue, tracks])

  return (
    <Animated.View style={[styles.container, { height, backgroundColor: colors.background }, animatedStyle]}>
      <View style={styles.content}>
        <View style={styles.trackInfo}>
          <Image source={{ uri: playingTrack?.artwork as string }} style={{ width: 40, height: 40, borderRadius: 4 }} />

          <View>
            <Text numberOfLines={1} style={styles.title}>
              {playingTrack?.title || '未播放'}
            </Text>
            <Text numberOfLines={1} style={styles.artist}>
              {playingTrack?.artist || '未知艺术家'}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <IconButton
            icon={state === AudioProState.PLAYING ? 'pause' : 'play'}
            size={24}
            onPress={handlePlayPause}
          />
          <IconButton
            icon="skip-next"
            size={24}
            onPress={handleNext}
          />
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingLeft: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
})
