import { useTranslation } from '@flow/core'
import { memo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Avatar, Chip, List, Text } from 'react-native-paper'
import { ThemedView } from '@/components/ui/ThemedView'

export const ArtistsScreen = memo(() => {
  const { t } = useTranslation()

  // 模拟艺术家数据
  const mockArtists = [
    { id: 1, name: '周杰伦', albumCount: 15, songCount: 150, description: '华语流行音乐天王' },
    { id: 2, name: '林俊杰', albumCount: 12, songCount: 120, description: '新加坡创作歌手' },
    { id: 3, name: '陈奕迅', albumCount: 20, songCount: 200, description: '香港实力派歌手' },
    { id: 4, name: '邓紫棋', albumCount: 8, songCount: 80, description: '香港创作女歌手' },
    { id: 5, name: '薛之谦', albumCount: 10, songCount: 100, description: '内地流行歌手' },
    { id: 6, name: '张学友', albumCount: 25, songCount: 250, description: '香港歌神' },
  ]

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('navigation.artists')}
        </Text>
        <View style={styles.chips}>
          <Chip selected>全部</Chip>
          <Chip>常听</Chip>
          <Chip>收藏</Chip>
          <Chip>A-Z</Chip>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <List.Section>
          {mockArtists.map(artist => (
            <List.Item
              key={artist.id}
              title={artist.name}
              description={(
                <View style={styles.description}>
                  <Text variant="bodySmall" style={styles.subtitle}>
                    {artist.description}
                  </Text>
                  <Text variant="bodySmall" style={styles.meta}>
                    {artist.albumCount}
                    {' '}
                    张专辑 ·
                    {artist.songCount}
                    {' '}
                    首歌曲
                  </Text>
                </View>
              )}
              left={props => (
                <Avatar.Text
                  {...props}
                  label={artist.name.charAt(0)}
                  size={56}
                />
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
              style={styles.listItem}
            />
          ))}
        </List.Section>
      </ScrollView>
    </ThemedView>
  )
})

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
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  listItem: {
    paddingVertical: 8,
  },
  description: {
    marginTop: 4,
  },
  subtitle: {
    opacity: 0.8,
    marginBottom: 4,
  },
  meta: {
    opacity: 0.6,
  },
})
