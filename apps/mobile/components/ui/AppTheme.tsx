import { useSettingStore } from '@flow/core'
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme, ThemeProvider } from '@react-navigation/native'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { adaptNavigationTheme, PaperProvider } from 'react-native-paper'
import { Player } from '@/components/features/Player'
import Themes from '@/constants/Themes'
import { ThemedView } from './ThemedView'

export function AppTheme() {
  const { isSettingHydrated, effectiveColorScheme, currentColor } = useSettingStore()

  if (!isSettingHydrated) {
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
