import { playerController, PlayMode, usePlayerStore } from '@flow/player'
import { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { IconButton, Text, useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function FullPlayerControl() {
  const { bottom } = useSafeAreaInsets()
  const { colors } = useTheme()
  const isPlaying = usePlayerStore.use.isPlaying()
  const mode = usePlayerStore.use.mode()

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      playerController.pause()
    }
    else {
      playerController.play()
    }
  }, [isPlaying])

  const handleNext = useCallback(() => {
    playerController.next()
  }, [])

  const handlePrevious = useCallback(() => {
    playerController.prev()
  }, [])

  return (
    <View style={[styles.container, { paddingBottom: bottom + 36 }]}>
      <View style={styles.controls}>
        <IconButton
          icon="skip-previous"
          size={32}
          onPress={handlePrevious}
        />
        <IconButton
          icon={isPlaying ? 'pause' : 'play'}
          size={40}
          onPress={handlePlayPause}
        />
        <IconButton
          icon="skip-next"
          size={32}
          onPress={handleNext}
        />
      </View>

      <View style={styles.modeInfo}>
        <Text style={[styles.modeText, { color: colors.onSurfaceVariant }]}>
          Play mode:
          {' '}
          {mode === PlayMode.SINGLE ? 'Single' : mode === PlayMode.ORDERED ? 'Ordered' : 'Shuffle'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  modeInfo: {
    alignItems: 'center',
  },
  modeText: {
    fontSize: 14,
    opacity: 0.6,
  },
})
