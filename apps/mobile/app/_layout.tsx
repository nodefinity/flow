import { useFonts } from 'expo-font';

import { AppTheme } from '@/components/ui/AppTheme';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Urbanist: require('../assets/fonts/Urbanist-VariableFont_wght.ttf'),
    UrbanistItalic: require('../assets/fonts/Urbanist-Italic-VariableFont_wght.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AppTheme />
  );
}
