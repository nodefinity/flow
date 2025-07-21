import { useDisplayTrack } from '@flow/player'
import { Image } from 'expo-image'
import { Dimensions, StyleSheet, View } from 'react-native'

const { width: screenWidth } = Dimensions.get('window')

export default function FullPlayerArtwork() {
  const displayTrack = useDisplayTrack()

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: displayTrack?.artwork as string }}
        style={styles.artwork}
        contentFit="cover"
        transition={{ duration: 200, effect: 'cross-dissolve' }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  artwork: {
    width: screenWidth - 56,
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
})
