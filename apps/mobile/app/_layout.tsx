import { useAppearanceSetting } from '@flow/hooks'

import { PlaybackService, setupPlayer } from '@flow/player'
import { useSettingStore, useTrackStore } from '@flow/store'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { ErrorBoundary, Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import TrackPlayer from 'react-native-track-player'
import { ToastProvider } from '@/components/ui/Toast'
import { useInitLocalTracks } from '@/hooks/useInitLocalTracks'
import { Player } from '@/modules/player'
import '../global.css'

SplashScreen.preventAutoHideAsync()

if (Platform.OS !== 'web') {
  TrackPlayer.registerPlaybackService(() => PlaybackService)
  setupPlayer()
}

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

  const statusBarStyle = effectiveColorScheme === 'dark' ? 'light' : 'dark'

  return (
    <ThemeProvider value={effectiveColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView className="flex-1">
        <BottomSheetModalProvider>
          <ToastProvider>
            <StatusBar style={statusBarStyle} />
            <Slot />
            <Player />
          </ToastProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  )
}

export { ErrorBoundary }
