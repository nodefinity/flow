import type { Track } from '@flow/core'
import { playerController } from '@flow/player'
import { useTrackStore } from '@flow/store'
import { FlashList } from '@shopify/flash-list'
import { useCallback } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'
import { useActiveTrack } from 'react-native-track-player'
import TrackItem from '@/modules/track/TrackItem'

export default function HomeScreen() {
  const localTracks = useTrackStore.use.localTracks()
  const remoteTracks = useTrackStore.use.remoteTracks()
  const tracks = [...localTracks, ...remoteTracks]

  const activeTrack = useActiveTrack()

  const onTrackPress = useCallback((track: Track) => {
    if (activeTrack?.id === track.id) {
      return
    }
    playerController.playQueue(tracks, track)
  }, [activeTrack?.id, tracks])

  return (
    <>
      {
        tracks.length > 0
          ? (
              <FlashList
                data={tracks}
                renderItem={({ item }) => <TrackItem item={item} onPress={() => onTrackPress(item)} />}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                extraData={tracks}
                estimatedItemSize={70}
              />
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
