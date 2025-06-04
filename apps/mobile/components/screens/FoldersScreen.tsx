import { useTranslation } from '@flow/core'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { IconButton, List, Text } from 'react-native-paper'
import { ThemedView } from '@/components/ui/ThemedView'

export function FoldersScreen() {
  const { t } = useTranslation()

  // 模拟文件夹数据
  const mockFolders = [
    {
      id: 1,
      name: 'Download',
      path: '/storage/emulated/0/Download/',
      songCount: 45,
      type: 'folder',
    },
    {
      id: 2,
      name: 'Music',
      path: '/storage/emulated/0/Music/',
      songCount: 120,
      type: 'folder',
    },
    {
      id: 3,
      name: '周杰伦',
      path: '/storage/emulated/0/Music/周杰伦/',
      songCount: 30,
      type: 'folder',
    },
    {
      id: 4,
      name: 'Podcasts',
      path: '/storage/emulated/0/Podcasts/',
      songCount: 15,
      type: 'folder',
    },
    {
      id: 5,
      name: '网易云音乐',
      path: '/storage/emulated/0/netease/',
      songCount: 80,
      type: 'folder',
    },
  ]

  const formatPath = (path: string) => {
    return path.replace('/storage/emulated/0/', '~/').replace(/\/$/, '')
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('navigation.folders')}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          按文件夹浏览您的音乐文件
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <List.Section>
          {mockFolders.map(folder => (
            <List.Item
              key={folder.id}
              title={folder.name}
              description={(
                <View style={styles.description}>
                  <Text variant="bodySmall" style={styles.path}>
                    {formatPath(folder.path)}
                  </Text>
                  <Text variant="bodySmall" style={styles.count}>
                    {folder.songCount}
                    {' '}
                    首歌曲
                  </Text>
                </View>
              )}
              left={props => (
                <List.Icon
                  {...props}
                  icon="folder-music"
                  color="#FFA726"
                />
              )}
              right={props => (
                <View style={styles.rightActions}>
                  <IconButton
                    {...props}
                    icon="dots-vertical"
                    size={20}
                    onPress={() => {}}
                  />
                  <List.Icon {...props} icon="chevron-right" />
                </View>
              )}
              onPress={() => {}}
              style={styles.listItem}
            />
          ))}
        </List.Section>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            长按文件夹查看更多选项
          </Text>
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
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  listItem: {
    paddingVertical: 12,
  },
  description: {
    marginTop: 4,
  },
  path: {
    opacity: 0.6,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  count: {
    opacity: 0.8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    opacity: 0.5,
  },
})
