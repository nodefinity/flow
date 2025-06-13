import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'

export default function QueueList() {
  return (
    <View style={[styles.container, { backgroundColor: '#666' }]}>
      <Text style={{ color: '#fff' }}>QueueList - Swipe Down To FullPlayer</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
