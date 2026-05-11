import type { LyricLine } from '@flow/player'
import { findLyricLine, parseLyrics, useDisplayTrack, usePlaybackStore } from '@flow/player'
import { FlashList } from '@shopify/flash-list'
import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useColors } from '@/hooks/useColors'
import { usePlayerContext } from './Context'

export default function LyricsView({ mode = 'mini' }: { mode?: 'mini' | 'full' }) {
  const colors = useColors()
  const { artworkColors } = usePlayerContext()
  const activeTrack = useDisplayTrack()
  const position = usePlaybackStore.use.position()
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [isReady, setIsReady] = useState(false)
  const activeLyricLineIndex = findLyricLine(lyrics, position)
  const scrollViewRef = useRef<FlashList<LyricLine>>(null)

  useEffect(() => {
    setLyrics(parseLyrics(activeTrack?.lyrics ?? ''))
  }, [activeTrack])

  useEffect(() => {
    if (scrollViewRef.current && activeLyricLineIndex !== null && isReady) {
      const id = setTimeout(() => {
        scrollViewRef.current?.scrollToIndex({ index: activeLyricLineIndex, animated: true, viewPosition: 0.5 })
      }, 100)
      return () => clearTimeout(id)
    }
  }, [activeLyricLineIndex, isReady])

  const isMini = mode === 'mini'
  const activeColor = artworkColors.vibrant || colors.primary

  const renderItem = useCallback(({ item: line, index }: { item: LyricLine, index: number }) => {
    const isActive = activeLyricLineIndex === index
    return (
      <View style={isMini ? styles.miniRow : styles.fullRow}>
        {line.originalText && (
          <Text
            style={[
              isMini ? styles.miniText : styles.fullText,
              { color: isActive ? activeColor : 'rgba(255,255,255,0.5)' },
              isActive && (isMini ? styles.miniTextActive : styles.fullTextActive),
            ]}
          >
            {line.originalText}
          </Text>
        )}
        {line.translation && (
          <Text
            style={[
              isMini ? styles.miniTranslation : styles.fullTranslation,
              { color: isActive ? activeColor : 'rgba(255,255,255,0.35)' },
            ]}
          >
            {line.translation}
          </Text>
        )}
      </View>
    )
  }, [activeLyricLineIndex, activeColor, isMini])

  return (
    <FlashList
      ref={scrollViewRef}
      data={lyrics}
      renderItem={renderItem}
      contentContainerStyle={isMini ? styles.miniPadding : styles.fullPadding}
      estimatedItemSize={isMini ? 20 : 30}
      extraData={activeLyricLineIndex}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item, i) => `${item.time}-${i}`}
      onLayout={() => setIsReady(true)}
    />
  )
}

const styles = StyleSheet.create({
  miniPadding: { paddingHorizontal: 28, paddingVertical: 16 },
  fullPadding: { paddingHorizontal: 28, paddingVertical: 40 },
  miniRow: { marginVertical: 6 },
  fullRow: { marginVertical: 12 },
  miniText: { fontSize: 14, lineHeight: 18, fontWeight: '400' },
  miniTextActive: { fontSize: 15, lineHeight: 19, fontWeight: '600' },
  miniTranslation: { fontSize: 12, lineHeight: 16, marginTop: 2 },
  fullText: { fontSize: 18, lineHeight: 24, fontWeight: '500' },
  fullTextActive: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  fullTranslation: { fontSize: 14, lineHeight: 18, marginTop: 4 },
})
