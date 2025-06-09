import { useAppSetting } from '@flow/core'
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme, ThemeProvider } from '@react-navigation/native'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { adaptNavigationTheme, PaperProvider } from 'react-native-paper'
import Themes from '@/constants/Themes'
import { ThemedView } from './ThemedView'

export function AppTheme() {
  const { isSettingLoading, effectiveColorScheme, currentColor } = useAppSetting()

  if (isSettingLoading) {
    return null
  }

  console.log('effectiveColorScheme', effectiveColorScheme)
  console.log('currentColor', currentColor)

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
          </ThemedView>
        </GestureHandlerRootView>
      </ThemeProvider>
    </PaperProvider>
  )
}
