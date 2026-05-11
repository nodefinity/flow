import type { Track } from '@flow/shared'
import { usePlayerStore } from '@flow/player'
import { Image } from 'expo-image'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useColors } from '@/hooks/useColors'
import { useToast } from '@/hooks/useToast'

interface TrackItemProps {
  item: Track
  isActive?: boolean
  onPress?: () => void
}

function TrackItem({ item, isActive, onPress }: TrackItemProps) {
  const colors = useColors()
  const insertNext = usePlayerStore.use.insertNext()
  const toast = useToast()

  const handleInsertNext = () => {
    insertNext(item)
    toast.success('成功添加到下一首播放', 'top')
  }

  return (
    <Pressable onPress={onPress} style={styles.container} unstable_pressDelay={50}>
      <Image source={{ uri: item.artwork }} style={styles.artwork} />
      <View style={styles.info}>
        <Text style={[styles.title, { color: isActive ? colors.primary : colors.foreground }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.sub, { color: isActive ? colors.primary : colors.mutedForeground }]} numberOfLines={1}>
          {item.artist}
          {item.album ? ` — ${item.album}` : ''}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={handleInsertNext} style={styles.actionBtn} hitSlop={8}>
          <Text style={{ color: colors.mutedForeground, fontSize: 18 }}>+</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} hitSlop={8} onPress={() => {}}>
          <Text style={{ color: colors.mutedForeground, fontSize: 18 }}>⋮</Text>
        </Pressable>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 8, paddingVertical: 8 },
  artwork: { width: 44, height: 44, borderRadius: 6 },
  info: { flex: 1, marginHorizontal: 12 },
  title: { fontSize: 14, fontWeight: '500' },
  sub: { fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 8 },
})

export default React.memo(TrackItem)
