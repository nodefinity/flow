import type { Track } from '@flow/core'
import { formatDuration, useLocalTracks } from '@flow/core'
import { memo } from 'react'
import { FlatList, Image, StyleSheet, View } from 'react-native'
import { IconButton, List, Text } from 'react-native-paper'
import { ThemedView } from '@/components/ui/ThemedView'

export const TracksScreen = memo(() => {
  const { tracks, isTracksLoading } = useLocalTracks()

  const renderItem = ({ item }: { item: Track }) => (
    <List.Item
      key={item.id}
      title={item.title}
      description={`${item.artist} - ${item.album}`}
      descriptionNumberOfLines={1}
      style={{ paddingLeft: 24, paddingRight: 12 }}
      left={() => <Image source={{ uri: item.artwork }} style={{ aspectRatio: 1, borderRadius: 10 }} />}
      right={() => (
        <View style={styles.rightContent}>
          <Text variant="bodySmall" style={styles.duration}>
            {formatDuration(item.duration)}
          </Text>

          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => console.log('Pressed')}
          />
        </View>
      )}
      onPress={() => { }}
    />
  )

  if (isTracksLoading) {
    return null
  }

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
    gap: 8,
  },
  duration: {
    opacity: 0.6,
  },
})
