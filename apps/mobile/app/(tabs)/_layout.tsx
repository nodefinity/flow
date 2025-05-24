import type { ComponentProps } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTranslation } from '@flow/core'
import { Tabs } from 'expo-router'
import TabBar from '@/components/ui/TabBar'

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name']

interface TabConfig {
  name: string
  locale: string
  icon: IconName
  activeIcon: IconName
}

const TAB_CONFIG: TabConfig[] = [
  {
    name: 'index',
    locale: 'home',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    name: 'setting',
    locale: 'setting',
    icon: 'cog-outline',
    activeIcon: 'cog',
  },
]

function RenderTabItem(config: TabConfig) {
  const { t } = useTranslation()

  return (
    <Tabs.Screen
      key={config.name}
      name={config.name}
      options={{
        title: t(`${config.locale}.title`),
        tabBarIcon: ({ focused, color, size }) => {
          return <MaterialCommunityIcons size={size} name={focused ? config.activeIcon : config.icon} color={color} />
        },
      }}
    />
  )
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
      }}
    >
      {TAB_CONFIG.map(RenderTabItem)}
    </Tabs>
  )
}
