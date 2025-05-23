import { StyleSheet } from 'react-native'

import { Text } from 'react-native-paper'
import { IconSymbol } from '@/components/ui/IconSymbol'
import ParallaxScrollView from '@/components/ui/ParallaxScrollView'
import { ThemedView } from '@/components/ui/ThemedView'

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={(
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      )}
    >
      <ThemedView style={styles.titleContainer}>
        <Text>Setting</Text>
      </ThemedView>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
})
