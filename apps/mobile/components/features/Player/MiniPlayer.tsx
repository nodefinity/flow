import { StyleSheet, Text, View } from 'react-native'

export default function MiniPlayer({ height }: { height: number }) {
  return (
    <View style={[styles.container, { height, backgroundColor: '#222' }]}>
      <Text style={{ color: '#fff' }}>MiniPlayer - Swipe Up To FullPlayer</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
