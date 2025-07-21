import { useDisplayTrack } from '@flow/player'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { ScrollingText } from '@/components/ui/ScrollingText'

export default function FullPlayerHeader() {
  const displayTrack = useDisplayTrack()

  return (
    <View style={styles.container}>
      <ScrollingText variant="headlineSmall">
        {displayTrack?.title || ''}
      </ScrollingText>
      <Text style={styles.artist}>{displayTrack?.artist || ''}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: -16,
    paddingHorizontal: 28,
  },
  artist: {
    opacity: 0.7,
  },
})
