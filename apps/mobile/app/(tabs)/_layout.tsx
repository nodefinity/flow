import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTranslation } from '@flow/shared'
import { DeviceType, deviceType } from 'expo-device'
import { Drawer } from 'expo-router/drawer'
import { useWindowDimensions } from 'react-native'
import { Appbar, useTheme } from 'react-native-paper'
import DrawerContent from '@/components/layout/drawer/DrawerContent'
import DrawerHeader from '@/components/layout/drawer/DrawerHeader'

export default function DrawerLayout() {
  const { colors } = useTheme()
  const { t } = useTranslation()

  const layout = useWindowDimensions()

  return (
    <Drawer
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        drawerType: deviceType === DeviceType.PHONE ? 'slide' : 'permanent',
        drawerStyle: {
          backgroundColor: colors.background,
          borderRightColor: colors.outlineVariant,
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
  )
}
