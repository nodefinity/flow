import type { LyricLine } from '@flow/player'
import { findLyricLine, parseLyrics, useDisplayTrack, usePlaybackStore } from '@flow/player'
import { FlashList } from '@shopify/flash-list'
import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

export default function LyricsView() {
  const { colors } = useTheme()
  const activeTrack = useDisplayTrack()
  const position = usePlaybackStore.use.position()
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const activeLyricLineIndex = findLyricLine(lyrics, position)
  const scrollViewRef = useRef<FlashList<LyricLine>>(null)

  useEffect(() => {
    setLyrics(parseLyrics(activeTrack?.lyrics ?? ''))
  }, [activeTrack])

  useEffect(() => {
    if (scrollViewRef.current && activeLyricLineIndex !== null) {
      scrollViewRef.current.scrollToIndex({ index: activeLyricLineIndex, animated: true, viewPosition: 0.5 })
    }
  }, [activeLyricLineIndex])

  const renderItem = useCallback(({ item: line, index }: { item: LyricLine, index: number }) => {
    const isActive = activeLyricLineIndex === index

    return (
      <Text
        style={[
          styles.lyricLine,
          isActive && styles.activeLyricLine,
          isActive && { color: colors.primary },
        ]}
      >
        {line.text}
      </Text>
    )
  }, [activeLyricLineIndex, colors.primary])

  return (
    <View style={styles.container}>
      <FlashList
        data={lyrics}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
        ref={scrollViewRef}
        estimatedItemSize={20}
        extraData={activeLyricLineIndex}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.time}-${index}`}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 20,
  },
  contentContainer: {
    paddingHorizontal: 28,
  },
  lyricLine: {
    fontSize: 18,
    marginVertical: 12,
    fontWeight: '500',
  },
  activeLyricLine: {
    fontSize: 20,
  },
})
