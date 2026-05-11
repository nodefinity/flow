import type { Track } from '@flow/shared'
import { usePlayerStore } from '@flow/player'
import { BottomSheetFlashList } from '@gorhom/bottom-sheet'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ThemedBottomSheetModal } from '@/components/ui/ThemedBottomSheetModal'
import { useColors } from '@/hooks/useColors'

interface QueueListProps {
  visible: boolean
  onDismiss: () => void
}

export function QueueList({ visible, onDismiss }: QueueListProps) {
  const colors = useColors()
  const { queue, removeFromQueue } = usePlayerStore()

  const renderItem = ({ item }: { item: Track }) => (
    <View style={[styles.item, { borderBottomColor: colors.border }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.itemSub, { color: colors.mutedForeground }]} numberOfLines={1}>
          {item.artist}
          {item.album ? ` — ${item.album}` : ''}
        </Text>
      </View>
      <Pressable onPress={() => removeFromQueue(item.id)} style={styles.removeBtn} hitSlop={8}>
        <Text style={{ color: colors.mutedForeground, fontSize: 18 }}>×</Text>
      </Pressable>
    </View>
  )

  return (
    <ThemedBottomSheetModal visible={visible} snapPoints={['60%', '90%']} onDismiss={onDismiss}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>播放队列</Text>
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Text style={{ color: colors.mutedForeground, fontSize: 18 }}>×</Text>
        </Pressable>
      </View>

      {queue.length > 0
        ? (
            <BottomSheetFlashList
              data={queue}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              estimatedItemSize={64}
            />
          )
        : (
            <View style={styles.empty}>
              <Text style={{ color: colors.mutedForeground }}>暂无歌曲</Text>
            </View>
          )}
    </ThemedBottomSheetModal>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  itemInfo: { flex: 1, marginRight: 8 },
  itemTitle: { fontSize: 14, fontWeight: '500' },
  itemSub: { fontSize: 12, marginTop: 2 },
  removeBtn: { padding: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})

export default QueueList
