import type { StorageAdapter } from '@flow/core'
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()

export const mobileStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    try {
      const value = storage.getString(key)
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
        storage.delete(key)
      }
      else {
        storage.set(key, value)
        console.log('MMKV setItem:', { key, valueLength: value.length })
      }
    }
    catch (error) {
      console.error('MMKV setItem failed:', error)
    }
  },
  removeItem: async (key: string) => {
    try {
      storage.delete(key)
    }
    catch (error) {
      console.error('MMKV removeItem failed:', error)
    }
  },
}
