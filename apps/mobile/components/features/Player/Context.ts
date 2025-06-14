import type { SharedValue } from 'react-native-reanimated'
import { createContext, use } from 'react'

interface ContextType {
  percent: SharedValue<number>
  thresholdPercent: SharedValue<number>
}

export const Context = createContext({} as ContextType)

export function usePlayerAnimation() {
  const value = use(Context)
  if (!value) {
    throw new Error('usePlayerAnimation must be used within a PlayerProvider')
  }
  return value
}
