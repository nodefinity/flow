import { Image } from 'expo-image'
import { StyleSheet } from 'react-native'

import { Text } from 'react-native-paper'
import { HelloWave } from '@/components/ui/HelloWave'
import ParallaxScrollView from '@/components/ui/ParallaxScrollView'
import { ThemedView } from '@/components/ui/ThemedView'

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={(
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      )}
    >
      <ThemedView style={styles.titleContainer}>
        <Text>Welcome!</Text>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Text style={styles.urbanistText}>Urbanist 字体测试: Welcome 欢迎</Text>
        <Text style={styles.spaceMonoText}>SpaceMono 字体测试: Welcome 欢迎</Text>
        <Text style={styles.urbanistItalicText}>UrbanistItalic 字体测试: Welcome 欢迎</Text>
      </ThemedView>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  urbanistText: {
    fontFamily: 'Urbanist',
    fontSize: 18,
    marginBottom: 10,
  },
  spaceMonoText: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    marginBottom: 10,
  },
  urbanistItalicText: {
    fontFamily: 'UrbanistItalic',
    fontSize: 18,
    marginBottom: 10,
  },
})
