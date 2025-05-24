import { useFonts } from 'expo-font';

import { AppTheme } from '@/components/ui/AppTheme';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AppTheme />
  );
}
