import { useTranslation } from '@flow/core'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Button, Card, Text } from 'react-native-paper'
import { ThemedView } from '@/components/ui/ThemedView'

export function SuggestedScreen() {
  const { t } = useTranslation()

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            {t('navigation.suggested')}
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">今日推荐</Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                根据您的音乐喜好为您推荐
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="contained">开始听歌</Button>
            </Card.Actions>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">热门榜单</Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                发现当下最流行的音乐
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button>查看更多</Button>
            </Card.Actions>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">为你定制</Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                基于您的听歌历史智能推荐
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button>个性化推荐</Button>
            </Card.Actions>
          </Card>
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    marginBottom: 8,
  },
  card: {
    marginVertical: 4,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
})
