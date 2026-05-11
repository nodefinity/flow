import type { Track } from '@flow/shared'
import { playerController, useDisplayTrack } from '@flow/player'
import { useTrackStore } from '@flow/store'
import { FlashList } from '@shopify/flash-list'
import { useCallback, useRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MINI_HEIGHT } from '@/constants/Player'
import { useColors } from '@/hooks/useColors'
import TrackItem from '@/modules/track/TrackItem'

export default function HomeScreen() {
  const colors = useColors()
  const localTracks = useTrackStore.use.localTracks()
  const remoteTracks = useTrackStore.use.remoteTracks()
  const tracks = [...localTracks, ...remoteTracks]
  const activeTrack = useDisplayTrack()
  const listRef = useRef<FlashList<Track>>(null)

  const onTrackPress = useCallback((track: Track) => {
    if (activeTrack?.id === track.id)
      return
    playerController.playQueue(tracks, track)
  }, [activeTrack?.id, tracks])

  const handleScrollToActive = useCallback(() => {
    if (!activeTrack)
      return
    const index = tracks.findIndex(t => t.id === activeTrack.id)
    if (index !== -1)
      listRef.current?.scrollToIndex({ index })
  }, [activeTrack, tracks])

  if (tracks.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: colors.mutedForeground }}>No songs</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlashList
        ref={listRef}
        data={tracks}
        renderItem={({ item }) => (
          <TrackItem
            isActive={activeTrack?.id === item.id}
            item={item}
            onPress={() => onTrackPress(item)}
          />
        )}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        extraData={activeTrack?.id}
        estimatedItemSize={60}
        contentContainerStyle={{ paddingBottom: MINI_HEIGHT + 16 }}
      />
      <Pressable onPress={handleScrollToActive} style={[styles.fab, { backgroundColor: colors.secondary }]}>
        <Text style={{ color: colors.foreground }}>⊙</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 16 + MINI_HEIGHT, right: 16, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
})
