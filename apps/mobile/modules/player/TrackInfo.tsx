import { useDisplayTrack } from '@flow/player'
import { formatFileSize, formatTime, useTranslation } from '@flow/shared'
import { Image, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import Animated from 'react-native-reanimated'
import { usePlayerContext } from './Context'

export default function TrackInfo() {
  const { t } = useTranslation()
  const { artworkColors } = usePlayerContext()
  const displayTrack = useDisplayTrack()

  return (
    <Animated.ScrollView
      style={styles.rootContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <View style={[styles.group, { backgroundColor: `${artworkColors.background}20` }]}>
        <Text style={styles.header}>{t('player.trackInfo.audioInfo')}</Text>
        <View style={styles.audioSingleRow}>
          <View style={styles.audioCompactCard}>
            <Text style={styles.audioCompactLabel}>{t('player.trackInfo.format')}</Text>
            <Text style={styles.audioCompactValue}>{displayTrack?.format?.toUpperCase() || '--'}</Text>
          </View>
          <View style={styles.audioCompactCard}>
            <Text style={styles.audioCompactLabel}>{t('player.trackInfo.channels')}</Text>
            <Text style={styles.audioCompactValue}>
              {displayTrack?.channels || '--'}
            </Text>
          </View>
          <View style={styles.audioCompactCard}>
            <Text style={styles.audioCompactLabel}>{t('player.trackInfo.bitrate')}</Text>
            <Text style={styles.audioCompactValue}>
              {displayTrack?.bitrate ? `${displayTrack.bitrate} kbps` : '--'}
            </Text>
          </View>
          <View style={styles.audioCompactCard}>
            <Text style={styles.audioCompactLabel}>{t('player.trackInfo.sampleRate')}</Text>
            <Text style={styles.audioCompactValue}>
              {displayTrack?.sampleRate ? `${displayTrack.sampleRate} hz` : '--'}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.group, { backgroundColor: `${artworkColors.background}20` }]}>
        <Text style={styles.header}>{t('player.trackInfo.album')}</Text>
        <View style={styles.content}>
          <Image
            source={{ uri: displayTrack?.artwork }}
            style={styles.albumArtwork}
          />
          <Text>{displayTrack?.album}</Text>
        </View>
      </View>

      <View style={[styles.group, { backgroundColor: `${artworkColors.background}20` }]}>
        <Text style={styles.header}>{t('player.trackInfo.artist')}</Text>
        <View style={styles.content}>
          <Text>{displayTrack?.artist}</Text>
        </View>
      </View>

      <View style={[styles.group, { backgroundColor: `${artworkColors.background}20` }]}>
        <Text style={styles.header}>{t('player.trackInfo.fileInfo')}</Text>

        <View style={styles.fileInfoItem}>
          <Text style={styles.label}>{t('player.trackInfo.filePath')}</Text>
          <Text style={styles.pathText} numberOfLines={2} ellipsizeMode="middle">
            {displayTrack?.url}
          </Text>
        </View>
        <View style={styles.fileInfoItem}>
          <Text style={styles.label}>{t('player.trackInfo.fileSize')}</Text>
          <Text style={styles.value}>{formatFileSize(displayTrack?.fileSize ?? 0)}</Text>
        </View>
        <View style={styles.fileInfoItem}>
          <Text style={styles.label}>{t('player.trackInfo.createdTime')}</Text>
          <Text style={styles.value}>{formatTime(displayTrack?.createdAt)}</Text>
        </View>
        <View style={[styles.fileInfoItem, { marginBottom: 0 }]}>
          <Text style={styles.label}>{t('player.trackInfo.modifiedTime')}</Text>
          <Text style={styles.value}>{formatTime(displayTrack?.modifiedAt)}</Text>
        </View>
      </View>
    </Animated.ScrollView>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    marginVertical: 16,
  },
  container: {
    paddingHorizontal: 28,
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  group: {
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioSingleRow: {
    flexDirection: 'row',
    gap: 4,
  },
  audioCompactCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 4,
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
  },
  audioCompactLabel: {
    fontSize: 9,
    fontWeight: '500',
    opacity: 0.6,
    marginBottom: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  audioCompactValue: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  fileInfoItem: {
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.7,
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    lineHeight: 18,
  },
  pathText: {
    fontSize: 13,
    lineHeight: 15,
  },
  albumArtwork: {
    width: 38,
    height: 38,
    borderRadius: 4,
  },
})
