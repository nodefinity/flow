import type { SharedValue } from 'react-native-reanimated'
import type { RootStackParamList } from '@/navigators/RootNavigator'
import { Pressable, StyleSheet, Text } from 'react-native'
import useTypeSafeNavigation from '@/hooks/useTypeSafeNavigation'

export interface DrawerListType {
  name: string
  navigate: string
}

interface Props {
  item: DrawerListType
  active: SharedValue<boolean>
}

export function DrawerItem({ item, active }: Props) {
  const navigation = useTypeSafeNavigation()
  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        navigation.navigate(item.navigate as keyof RootStackParamList)
        active.value = false
      }}
    >
      <Text style={styles.text}>{item.name}</Text>
    </Pressable>
  )
}

export default DrawerItem

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  image: {
    width: 26,
    height: 26,
  },
  text: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
})
