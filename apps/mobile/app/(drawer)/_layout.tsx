import { useTranslation } from '@flow/shared'
import { Drawer } from 'expo-router/drawer'
import { useWindowDimensions } from 'react-native'
import { useColors } from '@/hooks/useColors'

export default function DrawerLayout() {
  const colors = useColors()
  const { t } = useTranslation()
  const { width } = useWindowDimensions()

  return (
    <Drawer
      screenOptions={{
        drawerType: 'slide',
        swipeEdgeWidth: width,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.mutedForeground,
        drawerActiveBackgroundColor: colors.primarySoft,
        drawerStyle: { backgroundColor: colors.background, width: Math.min(width * 0.82, 340) },
        drawerLabelStyle: { fontSize: 16, fontWeight: '600' },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
      }}
    >
      <Drawer.Screen name="index" options={{ title: 'Radio', headerShown: false }} />
      <Drawer.Screen name="library" options={{ title: t('navigation.home') }} />
      <Drawer.Screen name="setting" options={{ title: t('navigation.setting') }} />
    </Drawer>
  )
}
