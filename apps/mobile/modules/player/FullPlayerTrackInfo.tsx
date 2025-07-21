import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'

export default function FullPlayerTrackInfo() {
  return (
    <View style={styles.container}>
      <Text>Track Info</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
})
