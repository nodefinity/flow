import { StyleSheet, Text } from 'react-native'
import { ThemedView } from '@/components/ui/ThemedView'

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <Text>Home</Text>
      {/* <RootNavigator /> */}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
