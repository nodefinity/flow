import type { SharedValue } from 'react-native-reanimated'
import { Image, StyleSheet, Text, View } from 'react-native'

interface Props {
  active: SharedValue<boolean>
}

function Drawer({ active }: Props) {
  console.log('active123e4', active.value)
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.containerProfile}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.imageProfile}
          />
          <Text style={styles.textName}>Rakha Wibowo</Text>
        </View>
        <View style={styles.containerItem}>
          <Text>Text</Text>
        </View>
      </View>
    </View>
  )
}

export default Drawer

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#353E54',
    zIndex: -99,
    elevation: -99,
  },
  contentContainer: {
    paddingTop: 120,
    marginHorizontal: 30,
    maxWidth: 180,
  },
  containerProfile: {
    gap: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },
  imageProfile: {
    width: 48,
    height: 48,
  },
  textName: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 22,
  },
  containerItem: {
    marginTop: 10,
  },
})
