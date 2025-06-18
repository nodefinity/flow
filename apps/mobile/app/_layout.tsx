import { registerColorSchemeAdapter, registerLanguageAdapter, registerStorageAdapter, useSettingStore, useTrackStore } from '@flow/core'
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme, ThemeProvider } from '@react-navigation/native'
import { ErrorBoundary, Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { adaptNavigationTheme, PaperProvider } from 'react-native-paper'
import { colorSchemeAdapter, languageAdapter, mobileStorageAdapter } from '@/adapters'
import { Player } from '@/components/features/Player'
import { ThemedView } from '@/components/ui/ThemedView'
import Themes from '@/constants/Themes'
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
  const { isSettingHydrated, effectiveColorScheme, currentColor } = useSettingStore()

  useSetupAudioPro()
  useNotificationPermission()

  if (isTracksHydrated && isSettingHydrated) {
    SplashScreen.hideAsync()
  }
  else {
    return null
  }

  const paperTheme = Themes[effectiveColorScheme ?? 'light'][currentColor]

  const { DarkTheme, LightTheme } = adaptNavigationTheme({
    reactNavigationDark: NavDarkTheme,
    reactNavigationLight: NavLightTheme,
    materialDark: Themes.dark.default,
    materialLight: Themes.light.default,
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
