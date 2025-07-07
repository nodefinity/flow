import type { Track } from '@flow/core'
import type { ListItemProps } from 'react-native-paper'
import { Image } from 'expo-image'
import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { IconButton, List } from 'react-native-paper'

interface TrackItemProps extends Partial<ListItemProps> {
  item: Track
}

function TrackItem({ item, ...props }: TrackItemProps) {
  const renderLeft = useCallback(() => (
    <Image source={{ uri: item.artwork }} style={{ aspectRatio: 1, borderRadius: 10 }} />
  ), [item.artwork])

  const renderRight = useCallback(() => (
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
  ), [])

  return (
    <List.Item
      {...props}
      title={item.title}
      description={`${item.artist} - ${item.album}`}
      descriptionNumberOfLines={1}
      style={{ paddingLeft: 16, paddingRight: 8 }}
      left={renderLeft}
      right={renderRight}
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
