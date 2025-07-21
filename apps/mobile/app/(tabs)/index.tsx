import type { Track } from '@flow/core'
import { playerController, useDisplayTrack } from '@flow/player'
import { useTrackStore } from '@flow/store'
import { FlashList } from '@shopify/flash-list'
import { useCallback, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { IconButton, Text } from 'react-native-paper'
import { MINI_HEIGHT } from '@/constants/Player'
import TrackItem from '@/modules/track/TrackItem'

export default function HomeScreen() {
  const localTracks = useTrackStore.use.localTracks()
  const remoteTracks = useTrackStore.use.remoteTracks()
  const tracks = [...localTracks, ...remoteTracks]

  const activeTrack = useDisplayTrack()

  const onTrackPress = useCallback((track: Track) => {
    if (activeTrack?.id === track.id) {
      return
    }
    playerController.playQueue(tracks, track)
  }, [activeTrack?.id, tracks])

  const listRef = useRef<FlashList<Track>>(null)

  const handleTargetPress = useCallback(() => {
    if (activeTrack) {
      const currentTrackIndex = tracks.findIndex(track => track.id === activeTrack.id)
      if (currentTrackIndex !== -1) {
        listRef.current?.scrollToIndex({ index: currentTrackIndex, animated: true })
      }
    }
  }, [activeTrack, tracks])

  return (
    <>
      {
        tracks.length > 0
          ? (
              <>
                <FlashList
                  ref={listRef}
                  data={tracks}
                  renderItem={({ item }) => <TrackItem isActive={activeTrack?.id === item.id} item={item} onPress={() => onTrackPress(item)} />}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  extraData={tracks}
                  estimatedItemSize={70}
                />
                <IconButton
                  size={20}
                  mode="contained"
                  icon="crosshairs-gps"
                  onPress={handleTargetPress}
                  style={styles.target}
                />
              </>
            )
          : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>No songs</Text>
              </View>
            )
      }
    </>
  )
}

const styles = StyleSheet.create({
  target: {
    position: 'absolute',
    bottom: 16 + MINI_HEIGHT,
    right: 16,
  },
})
