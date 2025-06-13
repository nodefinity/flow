import type { Track } from '@flow/core'
import type { IPaginatedResult } from '@nodefinity/react-native-music-library'
import { formatTime, useTrackStore, useTranslation } from '@flow/core'
import { getTracksAsync } from '@nodefinity/react-native-music-library'
import { useEffect, useRef, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { ActivityIndicator, Button, Dialog, Portal, Text } from 'react-native-paper'

export function TrackScanDialog({ onDismiss, type }: { onDismiss: () => void, type: 'scan' | 'pick' }) {
  const { addTracks } = useTrackStore()

  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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
    setIsLoading(true)
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
    setIsLoading(false)
  }

  useEffect(() => {
    if (type === 'scan') {
      getLocalTracks()
    }
  }, [type])

  const handleConfirm = () => {
    setIsSaving(true)
    addTracks(trackResult?.items || [])
    setIsSaving(false)
    onDismiss()
  }

  return (
    <Portal>
      <Dialog visible={true} onDismiss={onDismiss}>
        <View style={styles.dialogTitleContainer}>
          <Dialog.Title>
            {t('setting.playback.scanTracks')}
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
          <Button onPress={handleConfirm} loading={isSaving} disabled={isSaving || isLoading}>
            {t('common.confirm')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
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
