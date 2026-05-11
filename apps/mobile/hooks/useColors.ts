import { useColorScheme } from 'nativewind'

const COLORS = {
  light: {
    background: 'hsl(40 20% 97%)',
    foreground: 'hsl(30 10% 10%)',
    card: 'hsl(40 20% 99%)',
    primary: 'hsl(38 92% 50%)',
    secondary: 'hsl(40 15% 92%)',
    muted: 'hsl(40 15% 92%)',
    mutedForeground: 'hsl(30 8% 45%)',
    border: 'hsl(40 15% 88%)',
    destructive: 'hsl(0 84% 60%)',
  },
  dark: {
    background: 'hsl(30 8% 8%)',
    foreground: 'hsl(40 15% 95%)',
    card: 'hsl(30 8% 11%)',
    primary: 'hsl(38 95% 55%)',
    secondary: 'hsl(30 8% 18%)',
    muted: 'hsl(30 8% 18%)',
    mutedForeground: 'hsl(40 10% 55%)',
    border: 'hsl(30 8% 20%)',
    destructive: 'hsl(0 70% 55%)',
  },
} as const

export function useColors() {
  const { colorScheme } = useColorScheme()
  return COLORS[colorScheme ?? 'light']
}
