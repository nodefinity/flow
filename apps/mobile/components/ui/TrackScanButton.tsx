import type { Track } from '@flow/core'
import type { IPaginatedResult } from '@nodefinity/react-native-music-library'
import { formatTime, useLocalTracks, useTranslation } from '@flow/core'
import { getTracksAsync } from '@nodefinity/react-native-music-library'
import { useEffect, useRef, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { ActivityIndicator, Button, Dialog, List, Portal, Text } from 'react-native-paper'
import { requestMusicPermission } from '@/utils/localTrackService'

interface TrackScanButtonProps {
  title: string
  description: string
  icon: string
  type: 'scan' | 'pick'
}

export function TrackScanButton({
  title,
  description,
  icon,
  type,
}: TrackScanButtonProps) {
  const { t } = useTranslation()
  const { addTracks } = useLocalTracks()

  const [isLoading, setIsLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [trackResult, setTrackResult] = useState<IPaginatedResult<Track> | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (endTime) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [endTime])

  const getLocalTracks = async () => {
    setStartTime(new Date())
    setEndTime(null)

    let hasMore = true
    let cursor

    while (hasMore) {
      const result = await getTracksAsync({
        first: 20,
        after: cursor,
      })

      setTrackResult(prev => ({
        ...prev,
        items: [...(prev?.items || []), ...result.items],
        hasNextPage: result.hasNextPage,
        endCursor: result.endCursor,
      }))

      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      })

      hasMore = result.hasNextPage
      cursor = result.endCursor
    }

    setEndTime(new Date())
  }

  const handlePress = async () => {
    setVisible(true)
    setIsLoading(true)

    const hasPermission = await requestMusicPermission()
    if (!hasPermission) {
      setVisible(false)
      setIsLoading(false)
      return
    }

    try {
      if (type === 'scan') {
        await getLocalTracks()
      }
      else {
        // TODO: pick audio files
      }
    }
    catch (error) {
      console.error('Scan tracks error:', error)
    }
    finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async () => {
    addTracks(trackResult?.items || [])
    setVisible(false)
    setTrackResult(null)
    setStartTime(null)
    setEndTime(null)
  }

  return (
    <>
      <List.Item
        title={title}
        description={description}
        left={props => <List.Icon {...props} icon={icon} />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={handlePress}
        disabled={isLoading}
      />

      <Portal>
        <Dialog
          visible={visible}
          onDismiss={() => {
            setVisible(false)
            setTrackResult(null)
            setStartTime(null)
            setEndTime(null)
          }}
        >
          <View style={styles.dialogTitleContainer}>
            <Dialog.Title>
              {title}
            </Dialog.Title>
            {isLoading && <ActivityIndicator size={16} />}
          </View>

          <Dialog.ScrollArea>
            <ScrollView
              ref={scrollViewRef}
              style={{ height: 300 }}
              showsVerticalScrollIndicator={false}
              scrollEnabled={!isLoading}
            >
              {startTime && (
                <>
                  <Text variant="labelSmall" style={styles.timeText}>
                    {t('setting.playback.startScan')}
                    :
                    {' '}
                    {formatTime(startTime)}
                  </Text>
                  <Text variant="labelSmall" style={styles.timeText}>
                    {t('setting.playback.foundTracks', { count: trackResult?.items.length })}
                  </Text>
                </>
              )}

              {trackResult?.items.map(item => (
                <Text key={item.id} style={styles.trackItem}>
                  {item.artist}
                  {' '}
                  -
                  {' '}
                  {item.title}
                </Text>
              ))}

              {endTime && (
                <>
                  <Text variant="labelSmall" style={styles.timeText}>
                    {t('setting.playback.endScan')}
                    :
                    {' '}
                    {formatTime(endTime)}
                  </Text>
                  <Text variant="labelSmall" style={styles.timeText}>
                    {t('setting.playback.foundTracks', { count: trackResult?.items.length })}
                  </Text>
                </>
              )}
            </ScrollView>
          </Dialog.ScrollArea>

          <Dialog.Actions>
            <Button onPress={handleConfirm}>
              {t('common.confirm')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  )
}

const styles = StyleSheet.create({
  dialogTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 24,
  },
  timeText: {
    color: '#666',
    fontSize: 12,
    marginVertical: 4,
    paddingHorizontal: 8,
    fontStyle: 'italic',
  },
  trackItem: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
})
