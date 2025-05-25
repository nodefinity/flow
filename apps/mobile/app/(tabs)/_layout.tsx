import type { NavigationConfig } from '@flow/core'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { NAVIGATION_CONFIG, useTranslation } from '@flow/core'
import { Tabs } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { StyleSheet } from 'react-native'
import DrawerContent from '@/components/ui/DrawerContent'
import TabBar from '@/components/ui/TabBar'
import { useDeviceType } from '@/hooks/useDeviceType'
import { useThemeColor } from '@/hooks/useThemeColor'

function RenderTabItem(config: NavigationConfig) {
  const { t } = useTranslation()

  return (
    <Tabs.Screen
      key={config.name}
      name={config.name}
      options={{
        title: t(`${config.locale}.title`),
        tabBarIcon: ({ focused, color, size }) => {
          return <MaterialCommunityIcons size={size} name={focused ? config.focusedIcon : config.unfocusedIcon} color={color} />
        },
      }}
    />
  )
}

function RenderDrawerItem(config: NavigationConfig) {
  const { t } = useTranslation()

  return (
    <Drawer.Screen
      key={config.name}
      name={config.name}
      options={{
        title: t(`${config.locale}.title`),
        drawerIcon: ({ focused, color, size }) => (
          <MaterialCommunityIcons
            size={size}
            name={focused ? config.focusedIcon : config.unfocusedIcon}
            color={color}
          />
        ),
      }}
    />
  )
}

export default function TabLayout() {
  const deviceType = useDeviceType()
  const theme = useThemeColor()

  if (deviceType === 'tablet') {
    return (
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerType: 'permanent',
          drawerStyle: {
            backgroundColor: theme.background,
            width: 80,
            justifyContent: 'center',
            borderRightWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          drawerContentStyle: styles.drawerContentStyle,
        }}
        drawerContent={props => (
          <DrawerContent
            navProps={props}
            showDivider={false}
            title="Flow"
            children={undefined}
          />
        )}
      >
        {NAVIGATION_CONFIG.map(RenderDrawerItem)}
      </Drawer>
    )
  }
  else {
    return (
      <Tabs
        tabBar={props => <TabBar {...props} />}
        screenOptions={{
          tabBarHideOnKeyboard: true,
          headerShown: false,
          animation: 'shift',
        }}
      >
        {NAVIGATION_CONFIG.map(RenderTabItem)}
      </Tabs>
    )
  }
}

const styles = StyleSheet.create({
  drawerContentStyle: {
    paddingTop: 20,
    flex: 1,
    justifyContent: 'center',
  },
})
