import { useTranslation } from '@flow/core'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { FAB, List, Searchbar, Text } from 'react-native-paper'
import { ThemedView } from '@/components/ui/ThemedView'

export function SongsScreen() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  // 模拟歌曲数据
  const mockSongs = [
    { id: 1, title: '夜曲', artist: '周杰伦', duration: '3:45' },
    { id: 2, title: '稻香', artist: '周杰伦', duration: '3:21' },
    { id: 3, title: '青花瓷', artist: '周杰伦', duration: '4:02' },
    { id: 4, title: '告白气球', artist: '周杰伦', duration: '3:33' },
  ]

  const filteredSongs = mockSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
    || song.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('navigation.songs')}
        </Text>
        <Searchbar
          placeholder="搜索歌曲..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <ScrollView style={styles.scrollView}>
        <List.Section>
          {filteredSongs.map(song => (
            <List.Item
              key={song.id}
              title={song.title}
              description={song.artist}
              left={props => <List.Icon {...props} icon="music-note" />}
              right={props => (
                <View style={styles.rightContent}>
                  <Text variant="bodySmall" style={styles.duration}>
                    {song.duration}
                  </Text>
                  <List.Icon {...props} icon="dots-vertical" />
                </View>
              )}
              onPress={() => {}}
            />
          ))}
        </List.Section>
      </ScrollView>

      <FAB
        icon="shuffle"
        style={styles.fab}
        onPress={() => {}}
        label="随机播放"
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    marginBottom: 16,
  },
  searchbar: {
    marginBottom: 8,
  },
  scrollView: {
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
})
