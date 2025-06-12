import { StyleSheet } from 'react-native'
import { TracksScreen } from '@/components/screens'
import { ThemedView } from '@/components/ui/ThemedView'

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <TracksScreen />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
