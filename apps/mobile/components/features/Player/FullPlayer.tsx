import { Dimensions, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import MiniPlayer from './MiniPlayer'

const MINI_HEIGHT = 80
const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function FullPlayer() {
  return (
    <View style={styles.container}>
      <MiniPlayer height={MINI_HEIGHT} />

      <View style={{ flex: 1, backgroundColor: '#333' }}>
        <View key="1" style={styles.page}>
          <Text>Track Info</Text>
        </View>
        <View key="2" style={styles.page}>
          <Text>Artwork</Text>
        </View>
        <View key="3" style={styles.page}>
          <Text>Lyrics</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT,
    backgroundColor: '#444',
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
