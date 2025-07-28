import { useAppearanceSetting } from '@flow/hooks'
import { PlaybackService, setupPlayer } from '@flow/player'
import { useSettingStore, useTrackStore } from '@flow/store'
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme, ThemeProvider } from '@react-navigation/native'
import { ErrorBoundary, Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { adaptNavigationTheme, PaperProvider } from 'react-native-paper'
import TrackPlayer from 'react-native-track-player'
import { ThemedView } from '@/components/ui/ThemedView'
import { ToastProvider } from '@/components/ui/Toast'
import Themes from '@/constants/Themes'
import { useInitLocalTracks } from '@/hooks/useInitLocalTracks'
import { Player } from '@/modules/player'

SplashScreen.preventAutoHideAsync()

TrackPlayer.registerPlaybackService(() => PlaybackService)
setupPlayer()

export default function RootLayout() {
  const remoteTracksHydrated = useTrackStore.use.hasHydrated()
  const { effectiveColorScheme } = useAppearanceSetting()
  const isSettingHydrated = useSettingStore.use.hasHydrated()

  const localTracksHydrated = useInitLocalTracks()

  if (remoteTracksHydrated && isSettingHydrated && localTracksHydrated) {
    SplashScreen.hideAsync()
  }
  else {
    return null
  }

  const paperTheme = Themes[effectiveColorScheme as keyof typeof Themes] ?? Themes.light

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
          <ToastProvider>
            <ThemedView style={{ flex: 1 }} testID="root-surface">
              <StatusBar style={statusBarStyle} />
              <Slot />
              <Player />
            </ThemedView>
          </ToastProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </PaperProvider>
  )
}

export { ErrorBoundary }
