import type { Track } from '@flow/shared'
import { usePlayerStore } from '@flow/player'
import { BottomSheetFlashList } from '@gorhom/bottom-sheet'
import { StyleSheet, View } from 'react-native'
import { Appbar, IconButton, List, Text } from 'react-native-paper'
import { ThemedBottomSheetModal } from '@/components/ui/ThemedBottomSheetModal'

interface QueueListProps {
  visible: boolean
  onDismiss: () => void
}

export function QueueList({ visible, onDismiss }: QueueListProps) {
  const { queue, removeFromQueue } = usePlayerStore()

  const renderItem = ({ item }: { item: Track }) => (
    <List.Item
      key={item.id}
      title={item.title}
      description={`${item.artist} - ${item.album}`}
      descriptionNumberOfLines={1}
      style={{ paddingRight: 8 }}
      right={() => (
        <View style={styles.rightContent}>
          <IconButton
            icon="minus"
            size={14}
            onPress={() => removeFromQueue(item.id)}
          />
        </View>
      )}
      onPress={() => {
        // playQueue(queue, item)
      }}
    />
  )

  return (
    <ThemedBottomSheetModal
      visible={visible}
      snapPoints={['60%', '90%']}
      onDismiss={onDismiss}
    >
      <View style={styles.header}>
        <Appbar.Content title="播放队列" />
        <Appbar.Action
          icon="close"
          onPress={onDismiss}
        />
      </View>

      <View style={styles.content}>
        {
          queue.length > 0
            ? (
                <BottomSheetFlashList
                  data={queue}
                  renderItem={renderItem}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  extraData={queue}
                  estimatedItemSize={70}
                />
              )
            : (
                <View style={styles.emptyContainer}>
                  <Text>暂无歌曲</Text>
                </View>
              )
        }
      </View>
    </ThemedBottomSheetModal>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    opacity: 0.6,
  },
})

export default QueueList
