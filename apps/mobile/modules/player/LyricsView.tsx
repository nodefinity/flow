import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'

export default function LyricsView() {
  return (
    <View style={styles.container}>
      <Text>Lyrics</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
})
