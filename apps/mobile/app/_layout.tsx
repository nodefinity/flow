import { registerColorSchemeAdapter, registerLanguageAdapter, registerStorageAdapter } from '@flow/core'
import { useFonts } from 'expo-font'
import { colorSchemeAdapter, languageAdapter, mobileStorageAdapter } from '@/adapters'
import { AppTheme } from '@/components/ui/AppTheme'

registerStorageAdapter(mobileStorageAdapter)
registerColorSchemeAdapter(colorSchemeAdapter)
registerLanguageAdapter(languageAdapter)

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Urbanist: require('../assets/fonts/Urbanist-VariableFont_wght.ttf'),
    UrbanistItalic: require('../assets/fonts/Urbanist-Italic-VariableFont_wght.ttf'),
  })

  if (!loaded) {
    // Async font loading only occurs in development.
    return null
  }

  return (
    <AppTheme />
  )
}
