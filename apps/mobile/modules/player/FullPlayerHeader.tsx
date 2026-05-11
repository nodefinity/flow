import { useDisplayTrack } from '@flow/player'
import { StyleSheet, Text, View } from 'react-native'
import { ScrollingText } from '@/components/ui/ScrollingText'

export default function FullPlayerHeader() {
  const displayTrack = useDisplayTrack()

  return (
    <View style={styles.container}>
      <ScrollingText style={styles.title}>
        {displayTrack?.title || ''}
      </ScrollingText>
      <Text style={styles.artist} numberOfLines={1}>
        {displayTrack?.artist || ''}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: -16,
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  artist: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
})
