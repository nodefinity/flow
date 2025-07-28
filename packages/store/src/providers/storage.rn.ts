import { MMKV } from 'react-native-mmkv'
import { createJSONStorage } from 'zustand/middleware'

const mmkv = new MMKV()

export const storage = createJSONStorage(() => {
  return {
    getItem: async (key: string) => {
      try {
        const value = mmkv.getString(key)
        return value ?? null
      }
      catch (error) {
        console.error('MMKV getItem failed:', error)
        return null
      }
    },
    setItem: async (key: string, value: string | null) => {
      try {
        if (value === null) {
          mmkv.delete(key)
        }
        else {
          mmkv.set(key, value)
        }
      }
      catch (error) {
        console.error('MMKV setItem failed:', error)
      }
    },
    removeItem: async (key: string) => {
      try {
        mmkv.delete(key)
      }
      catch (error) {
        console.error('MMKV removeItem failed:', error)
      }
    },
  }
})
