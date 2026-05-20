import type { ScanProgress } from '@/utils/localTrackService'
import { formatTime, useTranslation } from '@flow/shared'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useColors } from '@/hooks/useColors'
import { scanLocalTracks } from '@/utils/localTrackService'

export function TrackScanDialog({ onDismiss, type }: { onDismiss: () => void, type: 'scan' | 'pick' }) {
  const colors = useColors()
  const { t } = useTranslation()

  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<ScanProgress | null>(null)
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
    await scanLocalTracks((p) => {
      setProgress(p)
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }))
    })
    setEndTime(new Date())
    setIsLoading(false)
  }

  useEffect(() => {
    if (type === 'scan')
      scan()
  }, [type])

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
                {progress && (
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                    {t('setting.playback.foundTracks', { count: progress.scanned })}
                  </Text>
                )}
              </>
            )}
            {endTime && (
              <>
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                  {t('setting.playback.endScan')}
                  :
                  {' '}
                  {formatTime(endTime)}
                </Text>
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                  {t('setting.playback.foundTracks', { count: progress?.scanned ?? 0 })}
                </Text>
              </>
            )}
          </ScrollView>

          <View style={[styles.actions, { borderTopColor: colors.border }]}>
            <Pressable onPress={onDismiss} style={styles.btn}>
              <Text style={{ color: isLoading ? colors.mutedForeground : colors.primary, fontWeight: '600' }}>
                {isLoading ? t('common.cancel') : t('common.confirm')}
              </Text>
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
  actions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: StyleSheet.hairlineWidth, padding: 8, gap: 8 },
  btn: { paddingHorizontal: 16, paddingVertical: 10 },
})
