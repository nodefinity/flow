import type { Track } from '@flow/core'
import { useTrackStore } from '@flow/store'
import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { StyleSheet, View } from 'react-native'
import { IconButton, List, Text } from 'react-native-paper'
import { usePlayerControl } from '@/hooks/usePlayerControl'

export default function HomeScreen() {
  const localTracks = useTrackStore.use.localTracks()
  const remoteTracks = useTrackStore.use.remoteTracks()
  const tracks = [...localTracks, ...remoteTracks]

  const { playList } = usePlayerControl()

  const renderItem = ({ item }: { item: Track }) => (
    <List.Item
      title={item.title}
      description={`${item.artist} - ${item.album}`}
      descriptionNumberOfLines={1}
      style={{ paddingLeft: 16, paddingRight: 8 }}
      left={() => <Image source={{ uri: item.artwork }} style={{ aspectRatio: 1, borderRadius: 10 }} />}
      right={() => (
        <View style={styles.rightContent}>
          <IconButton
            icon="plus"
            size={14}
            onPress={() => console.log('Pressed')}
          />

          <IconButton
            icon="dots-vertical"
            size={14}
            onPress={() => console.log('Pressed')}
          />
        </View>
      )}
      onPress={() => {
        playList(item, tracks)
      }}
    />
  )

  console.log('home')

  return (
    <>
      {
        tracks.length > 0
          ? (
              <FlashList
                data={tracks}
                renderItem={renderItem}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    opacity: 0.6,
  },
})
