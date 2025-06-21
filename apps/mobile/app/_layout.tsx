import { registerColorSchemeAdapter, registerLanguageAdapter, registerStorageAdapter, useAppearanceSetting, useSettingStore, useTrackStore } from '@flow/core'
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme, ThemeProvider } from '@react-navigation/native'
import { ErrorBoundary, Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { adaptNavigationTheme, PaperProvider } from 'react-native-paper'
import { colorSchemeAdapter, languageAdapter, mobileStorageAdapter } from '@/adapters'
import { ThemedView } from '@/components/ui/ThemedView'
import Themes from '@/constants/Themes'
import { setupAudioPro, useSetupAudioPro } from '@/hooks/useAudioPro'
import { useInitLocalTracks } from '@/hooks/useInitLocalTracks'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'
import { Player } from '@/modules/player'

registerStorageAdapter(mobileStorageAdapter)
registerColorSchemeAdapter(colorSchemeAdapter)
registerLanguageAdapter(languageAdapter)

export { ErrorBoundary }

SplashScreen.preventAutoHideAsync()

setupAudioPro()

export default function RootLayout() {
  const remoteTracksHydrated = useTrackStore.use.hasHydrated()
  const { effectiveColorScheme } = useAppearanceSetting()
  const isSettingHydrated = useSettingStore.use.hasHydrated()

  useSetupAudioPro()
  useNotificationPermission()
  const localTracksHydrated = useInitLocalTracks()

  if (remoteTracksHydrated && isSettingHydrated && localTracksHydrated) {
    SplashScreen.hideAsync()
  }
  else {
    return null
  }

  const paperTheme = Themes[effectiveColorScheme ?? 'light']

  const { DarkTheme, LightTheme } = adaptNavigationTheme({
    reactNavigationDark: NavDarkTheme,
    reactNavigationLight: NavLightTheme,
    materialDark: Themes.dark,
    materialLight: Themes.light,
  })

  const statusBarStyle = effectiveColorScheme === 'dark' ? 'light' : 'dark'

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={effectiveColorScheme === 'dark' ? DarkTheme : LightTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemedView style={{ flex: 1 }} testID="root-surface">
            <StatusBar style={statusBarStyle} />
            <Slot />
            <Player />
          </ThemedView>
        </GestureHandlerRootView>
      </ThemeProvider>
    </PaperProvider>
  )
}
