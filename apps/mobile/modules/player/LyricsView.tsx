import type { LyricLine } from '@flow/player'
import { findLyricLine, parseLyrics, useDisplayTrack, usePlaybackStore } from '@flow/player'
import { FlashList } from '@shopify/flash-list'
import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

export default function LyricsView({ mode = 'mini' }: { mode?: 'mini' | 'full' }) {
  const { colors } = useTheme()
  const activeTrack = useDisplayTrack()
  const position = usePlaybackStore.use.position()
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [isFlashListReady, setIsFlashListReady] = useState(false)
  const activeLyricLineIndex = findLyricLine(lyrics, position)
  const scrollViewRef = useRef<FlashList<LyricLine>>(null)

  useEffect(() => {
    setLyrics(parseLyrics(activeTrack?.lyrics ?? ''))
  }, [activeTrack])

  useEffect(() => {
    if (scrollViewRef.current && activeLyricLineIndex !== null && isFlashListReady) {
      // ensure the FlashList is ready
      const timeoutId = setTimeout(() => {
        scrollViewRef.current?.scrollToIndex({
          index: activeLyricLineIndex,
          animated: true,
          viewPosition: 0.5,
        })
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [activeLyricLineIndex, isFlashListReady])

  const renderItem = useCallback(({ item: line, index }: { item: LyricLine, index: number }) => {
    const isActive = activeLyricLineIndex === index
    const isMiniMode = mode === 'mini'

    return (
      <Text
        style={[
          isMiniMode ? styles.miniLyricLine : styles.fullLyricLine,
          { color: colors.onSurface },
          isActive && (isMiniMode ? styles.miniActiveLyricLine : styles.fullActiveLyricLine),
          isActive && { color: colors.primary },
        ]}
      >
        {line.text}
      </Text>
    )
  }, [activeLyricLineIndex, colors.primary, colors.onSurface, mode])

  const containerStyle = mode === 'mini' ? styles.miniContentContainer : styles.fullContentContainer
  const estimatedSize = mode === 'mini' ? 20 : 30

  return (
    <FlashList
      data={lyrics}
      renderItem={renderItem}
      contentContainerStyle={containerStyle}
      ref={scrollViewRef}
      estimatedItemSize={estimatedSize}
      extraData={activeLyricLineIndex}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item, index) => `${item.time}-${index}`}
      onLayout={() => setIsFlashListReady(true)}
    />
  )
}

const styles = StyleSheet.create({
  // mini
  miniContentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  miniLyricLine: {
    fontSize: 14,
    lineHeight: 18,
    marginVertical: 6,
    fontWeight: '400',
    opacity: 0.6,
    textAlign: 'left',
  },
  miniActiveLyricLine: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    opacity: 1,
  },

  // full
  fullContentContainer: {
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  fullLyricLine: {
    fontSize: 18,
    lineHeight: 24,
    marginVertical: 16,
    fontWeight: '500',
    opacity: 0.7,
  },
  fullActiveLyricLine: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    opacity: 1,
  },
})
