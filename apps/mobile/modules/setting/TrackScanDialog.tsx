import type { Track } from '@flow/shared'
import type { PaginatedResult } from '@nodefinity/react-native-music-library'
import { formatTime, useTranslation } from '@flow/shared'
import { useTrackStore } from '@flow/store'
import { getTracksAsync } from '@nodefinity/react-native-music-library'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useColors } from '@/hooks/useColors'

export function TrackScanDialog({ onDismiss, type }: { onDismiss: () => void, type: 'scan' | 'pick' }) {
  const colors = useColors()
  const setLocalTracks = useTrackStore.use.setLocalTracks()
  const { t } = useTranslation()

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [trackResult, setTrackResult] = useState<PaginatedResult<Track> | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (endTime) {
      const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200)
      return () => clearTimeout(id)
    }
  }, [endTime])

  const scan = async () => {
    setIsLoading(true)
    setStartTime(new Date())
    setEndTime(null)
    let hasMore = true
    let cursor
    while (hasMore) {
      const result = await getTracksAsync({ first: 20, after: cursor })
      setTrackResult(prev => ({ ...prev, items: [...(prev?.items ?? []), ...result.items], hasNextPage: result.hasNextPage, endCursor: result.endCursor }))
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }))
      hasMore = result.hasNextPage
      cursor = result.endCursor
    }
    setEndTime(new Date())
    setIsLoading(false)
  }

  useEffect(() => {
    if (type === 'scan')
      scan()
  }, [type])

  const handleConfirm = () => {
    setIsSaving(true)
    setLocalTracks(trackResult?.items ?? [])
    setIsSaving(false)
    onDismiss()
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.foreground }]}>{t('setting.playback.scanTracks')}</Text>
            {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
          </View>

          <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false} scrollEnabled={!isLoading}>
            {startTime && (
              <>
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                  {t('setting.playback.startScan')}
                  :
                  {' '}
                  {formatTime(startTime)}
                </Text>
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>{t('setting.playback.foundTracks', { count: trackResult?.items.length })}</Text>
              </>
            )}
            {trackResult?.items.map(item => (
              <Text key={item.id} style={[styles.track, { color: colors.foreground }]}>
                {item.artist}
                {' '}
                -
                {' '}
                {item.title}
              </Text>
            ))}
            {endTime && (
              <>
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                  {t('setting.playback.endScan')}
                  :
                  {' '}
                  {formatTime(endTime)}
                </Text>
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>{t('setting.playback.foundTracks', { count: trackResult?.items.length })}</Text>
              </>
            )}
          </ScrollView>

          <View style={[styles.actions, { borderTopColor: colors.border }]}>
            <Pressable onPress={onDismiss} style={styles.btn}>
              <Text style={{ color: colors.mutedForeground }}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={isSaving || isLoading}
              style={[styles.btn, { opacity: isSaving || isLoading ? 0.5 : 1 }]}
            >
              {isSaving
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('common.confirm')}</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: 24 },
  dialog: { width: '100%', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 16, fontWeight: '600' },
  scroll: { height: 300, paddingHorizontal: 16 },
  meta: { fontSize: 12, fontStyle: 'italic', marginVertical: 4 },
  track: { fontSize: 13, paddingVertical: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: StyleSheet.hairlineWidth, padding: 8, gap: 8 },
  btn: { paddingHorizontal: 16, paddingVertical: 10 },
})
