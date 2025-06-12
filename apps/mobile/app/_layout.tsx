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
    UrbanistThin: require('../assets/fonts/Urbanist-Thin.ttf'),
    UrbanistExtraLight: require('../assets/fonts/Urbanist-ExtraLight.ttf'),
    UrbanistLight: require('../assets/fonts/Urbanist-Light.ttf'),
    UrbanistRegular: require('../assets/fonts/Urbanist-Regular.ttf'),
    UrbanistMedium: require('../assets/fonts/Urbanist-Medium.ttf'),
    UrbanistSemiBold: require('../assets/fonts/Urbanist-SemiBold.ttf'),
    UrbanistBold: require('../assets/fonts/Urbanist-Bold.ttf'),
    UrbanistExtraBold: require('../assets/fonts/Urbanist-ExtraBold.ttf'),
    UrbanistBlack: require('../assets/fonts/Urbanist-Black.ttf'),
    UrbanistThinItalic: require('../assets/fonts/Urbanist-ThinItalic.ttf'),
    UrbanistExtraLightItalic: require('../assets/fonts/Urbanist-ExtraLightItalic.ttf'),
    UrbanistLightItalic: require('../assets/fonts/Urbanist-LightItalic.ttf'),
    UrbanistItalic: require('../assets/fonts/Urbanist-Italic.ttf'),
    UrbanistMediumItalic: require('../assets/fonts/Urbanist-MediumItalic.ttf'),
    UrbanistSemiBoldItalic: require('../assets/fonts/Urbanist-SemiBoldItalic.ttf'),
    UrbanistBoldItalic: require('../assets/fonts/Urbanist-BoldItalic.ttf'),
    UrbanistExtraBoldItalic: require('../assets/fonts/Urbanist-ExtraBoldItalic.ttf'),
    UrbanistBlackItalic: require('../assets/fonts/Urbanist-BlackItalic.ttf'),
  })

  if (!loaded) {
    // Async font loading only occurs in development.
    return null
  }

  return (
    <AppTheme />
  )
}
