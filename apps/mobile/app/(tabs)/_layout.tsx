import type { NavigationConfig } from '@flow/core'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { NAVIGATION_CONFIG, useTranslation } from '@flow/core'
import { Tabs } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import BottomTabBar from '@/components/ui/BottomTabBar'
import DrawerTabBar from '@/components/ui/DrawerTabBar'
import { useDeviceType } from '@/hooks/useDeviceType'

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

export default function TabLayout() {
  const deviceType = useDeviceType()

  return (
    <View style={styles.container}>
      <Tabs
        tabBar={props =>
          deviceType === 'tablet'
            ? <DrawerTabBar {...props} config={NAVIGATION_CONFIG} />
            : <BottomTabBar {...props} />}
        screenOptions={{
          tabBarHideOnKeyboard: true,
          headerShown: false,
          animation: 'shift',
          ...(deviceType === 'tablet' && {
            sceneStyle: { marginLeft: 92 },
          }),
        }}
      >
        {NAVIGATION_CONFIG.map(RenderTabItem)}
      </Tabs>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
