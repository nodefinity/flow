import { useTranslation } from '@flow/core'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native'
import { Card, Chip, Text } from 'react-native-paper'
import { ThemedView } from '@/components/ui/ThemedView'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2 // 2 columns with margins

export function AlbumsScreen() {
  const { t } = useTranslation()

  // 模拟专辑数据
  const mockAlbums = [
    { id: 1, title: '周杰伦的床边故事', artist: '周杰伦', year: '2016', songCount: 10 },
    { id: 2, title: '十二新作', artist: '周杰伦', year: '2012', songCount: 12 },
    { id: 3, title: '魔杰座', artist: '周杰伦', year: '2008', songCount: 11 },
    { id: 4, title: '我很忙', artist: '周杰伦', year: '2007', songCount: 10 },
    { id: 5, title: '依然范特西', artist: '周杰伦', year: '2006', songCount: 10 },
    { id: 6, title: '十一月的萧邦', artist: '周杰伦', year: '2005', songCount: 12 },
  ]

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('navigation.albums')}
        </Text>
        <View style={styles.chips}>
          <Chip selected>全部</Chip>
          <Chip>最近播放</Chip>
          <Chip>收藏</Chip>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          {mockAlbums.map(album => (
            <Card key={album.id} style={styles.card} onPress={() => {}}>
              <Card.Cover
                source={{ uri: 'https://via.placeholder.com/200x200/e0e0e0/666?text=Album' }}
                style={styles.cover}
              />
              <Card.Content style={styles.content}>
                <Text variant="titleSmall" numberOfLines={2} style={styles.albumTitle}>
                  {album.title}
                </Text>
                <Text variant="bodySmall" style={styles.artist}>
                  {album.artist}
                </Text>
                <View style={styles.meta}>
                  <Text variant="bodySmall" style={styles.year}>
                    {album.year}
                  </Text>
                  <Text variant="bodySmall" style={styles.songCount}>
                    {album.songCount}
                    {' '}
                    首
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
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
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  card: {
    width: CARD_WIDTH,
  },
  cover: {
    height: CARD_WIDTH,
  },
  content: {
    padding: 12,
  },
  albumTitle: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  artist: {
    opacity: 0.7,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  year: {
    opacity: 0.6,
  },
  songCount: {
    opacity: 0.6,
  },
})
