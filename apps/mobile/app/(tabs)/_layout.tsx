import { useTranslation } from '@flow/shared'
import { Tabs } from 'expo-router'
import { useColors } from '@/hooks/useColors'

export default function TabLayout() {
  const colors = useColors()
  const { t } = useTranslation()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('navigation.home') }} />
      <Tabs.Screen name="setting" options={{ title: t('navigation.setting') }} />
    </Tabs>
  )
}
