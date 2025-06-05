import type { Track } from '@flow/core'
import { useState } from 'react'
import { Alert } from 'react-native'
import { ActivityIndicator, List } from 'react-native-paper'
import { getLocalTracks } from '@/utils/localTrackService'

interface TrackScanButtonProps {
  title: string
  description: string
  icon: string
  type: 'scan' | 'pick'
  onMusicLoaded?: (tracks: Track[]) => void
}

export function TrackScanButton({
  title,
  description,
  icon,
  type,
  onMusicLoaded,
}: TrackScanButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePress = async () => {
    setIsLoading(true)
    try {
      let tracks: Track[]
      if (type === 'scan') {
        tracks = await getLocalTracks()
      }
      else {
        // TODO: pick audio files
        tracks = []
      }

      if (tracks.length > 0) {
        Alert.alert(
          '扫描完成',
          `找到 ${tracks.length} 首音乐文件`,
          [{ text: '确定' }],
        )
        onMusicLoaded?.(tracks)
      }
      else {
        Alert.alert(
          '未找到音乐',
          type === 'scan'
            ? '未找到本地音乐文件或权限被拒绝'
            : '未选择任何音频文件',
          [{ text: '确定' }],
        )
      }
    }
    catch (error) {
      console.error('音乐扫描错误:', error)
      Alert.alert(
        '扫描失败',
        '扫描音乐时发生错误，请重试',
        [{ text: '确定' }],
      )
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <List.Item
      title={title}
      description={description}
      left={props => <List.Icon {...props} icon={icon} />}
      right={() =>
        isLoading
          ? (
              <ActivityIndicator size="small" />
            )
          : (
              <List.Icon icon="chevron-right" />
            )}
      onPress={handlePress}
      disabled={isLoading}
    />
  )
}
