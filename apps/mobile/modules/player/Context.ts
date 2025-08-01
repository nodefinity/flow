import type { SharedValue } from 'react-native-reanimated'
import type { ArtworkGradientColors } from '@/hooks/useArtworkColors'
import { createContext, use } from 'react'

interface ContextType {
  percent: SharedValue<number>
  thresholdPercent: SharedValue<number>
  artworkColors: ArtworkGradientColors
}

export const Context = createContext({} as ContextType)

export function usePlayerContext() {
  const value = use(Context)
  if (!value) {
    throw new Error('usePlayerContext must be used within a PlayerProvider')
  }
  return value
}
