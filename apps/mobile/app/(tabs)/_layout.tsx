import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTranslation } from '@flow/core'
import { Drawer } from 'expo-router/drawer'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { Appbar } from 'react-native-paper'
import DrawerContent from '@/components/ui/DrawerContent'
import DrawerHeader from '@/components/ui/DrawerHeader'
import { useThemeColor } from '@/hooks/useThemeColor'

export default function DrawerLayout() {
  const colors = useThemeColor()
  const { t } = useTranslation()

  const layout = useWindowDimensions()

  return (
    <View style={styles.container}>
      <Drawer
        drawerContent={props => <DrawerContent {...props} />}
        screenOptions={{
          drawerType: 'slide',
          drawerStyle: {
            backgroundColor: colors.background,
          },
          header: props => <DrawerHeader navProps={props} children={undefined} />,
          swipeEdgeWidth: layout.width,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: t(`navigation.home`),
            drawerIcon: ({ focused, color, size }) => {
              const icon = (focused ? 'home' : 'home-outline')
              return <MaterialCommunityIcons size={size} name={icon} color={color} />
            },
            headerRight: () => <Appbar.Action icon="magnify" onPress={() => { }} />,
          }}
        />

        <Drawer.Screen
          name="setting"
          options={{
            title: t(`navigation.setting`),
            drawerIcon: ({ focused, color, size }) => {
              const icon = (focused ? 'cog' : 'cog-outline')
              return <MaterialCommunityIcons size={size} name={icon} color={color} />
            },
          }}
        />
      </Drawer>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
