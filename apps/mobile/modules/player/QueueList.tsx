import type { Track } from '@flow/core'
import { usePlayerStore } from '@flow/store'
import { FlatList, Image, StyleSheet, View } from 'react-native'
import { IconButton, List, Text } from 'react-native-paper'
import { ThemedView } from '@/components/ui/ThemedView'
import { usePlayerControl } from '@/hooks/usePlayerControl'

export default function QueueList() {
  const { queue } = usePlayerStore()
  const { playList } = usePlayerControl()

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
        playList(item, queue)
      }}
    />
  )

  return (
    <ThemedView style={styles.container}>
      {
        queue.length > 0
          ? (
              <FlatList
                data={queue}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                extraData={queue}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 150,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    opacity: 0.6,
  },
})
