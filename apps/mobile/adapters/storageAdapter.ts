import type { StorageAdapter } from '@flow/core'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const mobileStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key)
      console.log('AsyncStorage getItem:', { key, value })
      return value
    }
    catch (error) {
      console.error('AsyncStorage getItem failed:', error)
      return null
    }
  },
  setItem: async (key: string, value: string | null) => {
    try {
      if (value === null) {
        await AsyncStorage.removeItem(key)
        console.log('AsyncStorage removeItem:', { key })
      }
      else {
        await AsyncStorage.setItem(key, value)
        console.log('AsyncStorage setItem:', { key, valueLength: value.length })
      }
    }
    catch (error) {
      console.error('AsyncStorage setItem failed:', error)
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key)
      console.log('AsyncStorage removeItem:', { key })
    }
    catch (error) {
      console.error('AsyncStorage removeItem failed:', error)
    }
  },
}
