import type { Track } from '@flow/core'
import type { AudioProTrack } from 'react-native-audio-pro'
import { useTrackStore } from '@flow/core'
import { memo } from 'react'
import { FlatList, Image, StyleSheet, View } from 'react-native'
import { AudioPro } from 'react-native-audio-pro'
import { IconButton, List, Text } from 'react-native-paper'
import { ThemedView } from '@/components/ui/ThemedView'

export const TracksScreen = memo(() => {
  const { tracks, setPlayQueue } = useTrackStore()

  const renderItem = ({ item }: { item: Track }) => (
    <List.Item
      key={item.id}
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
        setPlayQueue(tracks.map(track => track.id))
        AudioPro.play(item as unknown as AudioProTrack, { autoPlay: true })
      }}
    />
  )

  return (
    <ThemedView style={styles.container}>
      {
        tracks.length > 0
          ? (
              <FlatList
                data={tracks}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                extraData={tracks}
              />
            )
          : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>No songs</Text>
              </View>
            )
      }
    </ThemedView>
  )
})

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
