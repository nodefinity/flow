import { StyleSheet } from 'react-native'
import { ThemedView } from '@/components/ui/ThemedView'
import { RootNavigator } from '@/navigators/RootNavigator'

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>

      <RootNavigator />

    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
