import type { SharedValue } from 'react-native-reanimated'
import { Pressable, StyleSheet, View } from 'react-native'
import { IconButton } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface Props {
  active: SharedValue<boolean>
}

function Header({ active }: Props) {
  const insets = useSafeAreaInsets()
  return (
    <Pressable
      onPress={() => active.value = !active.value}
      style={[
        styles.container,
        { paddingTop: insets.top },
      ]}
    >
      <View>
        <View style={styles.containerIcon}>
          <IconButton
            icon="menu"
            iconColor="white"
            onPress={() => active.value = !active.value}
          />
        </View>
      </View>
    </Pressable>
  )
}

export default Header

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#252d3a',
    zIndex: 1000,
    elevation: 1000,
    height: 50,
    boxSizing: 'content-box',
  },
  containerIcon: {
    height: 50,
  },
})
