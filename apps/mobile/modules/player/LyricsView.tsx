import type { LyricLine } from '@flow/player'
import { findLyricLine, parseLyrics, useDisplayTrack, usePlaybackStore } from '@flow/player'
import { FlashList } from '@shopify/flash-list'
import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
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
      <View style={isMiniMode ? styles.miniLyricContainer : styles.fullLyricContainer}>
        {/* 原文歌词 */}
        {line.originalText && (
          <Text
            style={[
              isMiniMode ? styles.miniOriginalText : styles.fullOriginalText,
              { color: colors.onSurface },
              isActive && (isMiniMode ? styles.miniActiveOriginalText : styles.fullActiveOriginalText),
              isActive && { color: colors.primary },
            ]}
          >
            {line.originalText}
          </Text>
        )}

        {line.translation && (
          <Text
            style={[
              isMiniMode ? styles.miniTranslationText : styles.fullTranslationText,
              { color: colors.onSurfaceVariant },
              isActive && (isMiniMode ? styles.miniActiveTranslationText : styles.fullActiveTranslationText),
              isActive && { color: colors.primary },
            ]}
          >
            {line.translation}
          </Text>
        )}
      </View>
    )
  }, [activeLyricLineIndex, colors.primary, colors.onSurface, colors.onSurfaceVariant, mode])

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
  miniLyricContainer: {
    marginVertical: 6,
  },
  miniOriginalText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
    opacity: 0.8,
  },
  miniActiveOriginalText: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '500',
    opacity: 1,
  },
  miniTranslationText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    opacity: 0.6,
    marginTop: 2,
  },
  miniActiveTranslationText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    opacity: 0.8,
  },

  // full 模式容器
  fullContentContainer: {
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  fullLyricContainer: {
    marginVertical: 12,
  },
  fullOriginalText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    opacity: 0.8,
  },
  fullActiveOriginalText: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    opacity: 1,
  },
  fullTranslationText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
    opacity: 0.6,
    marginTop: 4,
  },
  fullActiveTranslationText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    opacity: 0.8,
  },
})
