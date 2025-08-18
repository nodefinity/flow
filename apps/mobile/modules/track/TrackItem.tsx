import type { Track } from '@flow/shared'
import type { ListItemProps } from 'react-native-paper'
import { usePlayerStore } from '@flow/player'
import { Image } from 'expo-image'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { IconButton, List, useTheme } from 'react-native-paper'
import { useToast } from '@/hooks/useToast'

interface TrackItemProps extends Partial<ListItemProps> {
  item: Track
  isActive?: boolean
}

function TrackItem({ item, isActive, ...props }: TrackItemProps) {
  const { colors } = useTheme()
  const insertNext = usePlayerStore.use.insertNext()
  const toast = useToast()

  const insertToNext = () => {
    insertNext(item)
    toast.success(`成功添加到下一首播放`, 'top')
  }

  const renderLeft = () => (
    <Image source={{ uri: item.artwork }} style={{ aspectRatio: 1, borderRadius: 10 }} />
  )

  const renderRight = () => (
    <View style={styles.rightContent}>
      <IconButton
        icon="plus"
        size={14}
        onPress={insertToNext}
      />

      <IconButton
        icon="dots-vertical"
        size={14}
        onPress={() => console.log('Pressed')}
      />
    </View>
  )

  return (
    <List.Item
      {...props}
      title={item.title}
      titleStyle={{ color: isActive ? colors.primary : colors.onSurface }}
      description={`${item.artist} - ${item.album}`}
      descriptionStyle={{ color: isActive ? colors.primary : colors.onSurfaceVariant }}
      descriptionNumberOfLines={1}
      style={{ paddingLeft: 16, paddingRight: 8 }}
      left={renderLeft}
      right={renderRight}
      unstable_pressDelay={50}
    />
  )
}

const styles = StyleSheet.create({
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})

export default React.memo(TrackItem)
