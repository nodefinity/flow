import { useTranslation } from '@flow/shared'
import { Drawer } from 'expo-router/drawer'
import { useColors } from '@/hooks/useColors'

export default function DrawerLayout() {
  const colors = useColors()
  const { t } = useTranslation()

  return (
    <Drawer
      screenOptions={{
        drawerType: 'slide',
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.mutedForeground,
        drawerStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
      }}
    >
      <Drawer.Screen name="index" options={{ title: t('navigation.home') }} />
      <Drawer.Screen name="setting" options={{ title: t('navigation.setting') }} />
    </Drawer>
  )
}
