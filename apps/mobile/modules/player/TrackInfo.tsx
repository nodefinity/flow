import { useDisplayTrack } from '@flow/player'
import { formatFileSize, formatTime, useTranslation } from '@flow/shared'
import { Image, StyleSheet, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { usePlayerContext } from './Context'

export default function TrackInfo() {
  const { t } = useTranslation()
  const { artworkColors } = usePlayerContext()
  const displayTrack = useDisplayTrack()
  const groupBg = `${artworkColors.background}20`

  return (
    <Animated.ScrollView style={styles.root} showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={[styles.group, { backgroundColor: groupBg }]}>
        <Text style={styles.groupHeader}>{t('player.trackInfo.audioInfo')}</Text>
        <View style={styles.row}>
          {[
            { label: t('player.trackInfo.format'), value: displayTrack?.format?.toUpperCase() || '--' },
            { label: t('player.trackInfo.channels'), value: String(displayTrack?.channels || '--') },
            { label: t('player.trackInfo.bitrate'), value: displayTrack?.bitrate ? `${displayTrack.bitrate} kbps` : '--' },
            { label: t('player.trackInfo.sampleRate'), value: displayTrack?.sampleRate ? `${displayTrack.sampleRate} hz` : '--' },
          ].map(card => (
            <View key={card.label} style={styles.card}>
              <Text style={styles.cardLabel}>{card.label}</Text>
              <Text style={styles.cardValue}>{card.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.group, { backgroundColor: groupBg }]}>
        <Text style={styles.groupHeader}>{t('player.trackInfo.album')}</Text>
        <View style={styles.inlineRow}>
          <Image source={{ uri: displayTrack?.artwork }} style={styles.artwork} />
          <Text style={styles.inlineText}>{displayTrack?.album}</Text>
        </View>
      </View>

      <View style={[styles.group, { backgroundColor: groupBg }]}>
        <Text style={styles.groupHeader}>{t('player.trackInfo.artist')}</Text>
        <Text style={styles.inlineText}>{displayTrack?.artist}</Text>
      </View>

      <View style={[styles.group, { backgroundColor: groupBg }]}>
        <Text style={styles.groupHeader}>{t('player.trackInfo.fileInfo')}</Text>
        {[
          { label: t('player.trackInfo.filePath'), value: displayTrack?.url, path: true },
          { label: t('player.trackInfo.fileSize'), value: formatFileSize(displayTrack?.fileSize ?? 0) },
          { label: t('player.trackInfo.createdTime'), value: formatTime(displayTrack?.createdAt) },
          { label: t('player.trackInfo.modifiedTime'), value: formatTime(displayTrack?.modifiedAt) },
        ].map((row, i) => (
          <View key={row.label} style={[styles.fileRow, i === 3 && { marginBottom: 0 }]}>
            <Text style={styles.fileLabel}>{row.label}</Text>
            <Text style={row.path ? styles.pathText : styles.fileValue} numberOfLines={row.path ? 2 : 1} ellipsizeMode={row.path ? 'middle' : undefined}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </Animated.ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, marginVertical: 16 },
  container: { paddingHorizontal: 28, gap: 12 },
  group: { padding: 12, borderRadius: 12, overflow: 'hidden' },
  groupHeader: { fontSize: 14, fontWeight: '600', letterSpacing: 0.2, marginBottom: 10, color: 'rgba(255,255,255,0.9)' },
  row: { flexDirection: 'row', gap: 4 },
  card: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 5, paddingHorizontal: 4, borderRadius: 4, alignItems: 'center', minHeight: 36, justifyContent: 'center' },
  cardLabel: { fontSize: 9, fontWeight: '500', opacity: 0.6, marginBottom: 1, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.2, color: '#fff' },
  cardValue: { fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 14, color: '#fff' },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inlineText: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  artwork: { width: 38, height: 38, borderRadius: 4 },
  fileRow: { marginBottom: 8 },
  fileLabel: { fontSize: 11, fontWeight: '500', opacity: 0.7, marginBottom: 2, color: '#fff' },
  fileValue: { fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.85)' },
  pathText: { fontSize: 13, lineHeight: 15, color: 'rgba(255,255,255,0.85)' },
})
