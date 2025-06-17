import { registerColorSchemeAdapter, registerLanguageAdapter, registerStorageAdapter, useSettingStore, useTrackStore } from '@flow/core'
import { ErrorBoundary } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { colorSchemeAdapter, languageAdapter, mobileStorageAdapter } from '@/adapters'
import { AppTheme } from '@/components/ui/AppTheme'
import { setupAudioPro, useSetupAudioPro } from '@/hooks/useAudioPro'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'

registerStorageAdapter(mobileStorageAdapter)
registerColorSchemeAdapter(colorSchemeAdapter)
registerLanguageAdapter(languageAdapter)

export { ErrorBoundary }

SplashScreen.preventAutoHideAsync()

setupAudioPro()

export default function RootLayout() {
  const { isTracksHydrated } = useTrackStore()
  const { isSettingHydrated } = useSettingStore()

  useSetupAudioPro()
  useNotificationPermission()

  if (!isTracksHydrated || !isSettingHydrated) {
    SplashScreen.hideAsync()
  }

  return (
    <AppTheme />
  )
}
