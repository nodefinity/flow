import { createJSONStorage } from 'zustand/middleware'

const memoryStorage = new Map<string, string>()

export const storage = createJSONStorage(() => {
  const localStorage = globalThis.localStorage

  return {
    getItem: async (key: string) => {
      try {
        if (!localStorage)
          return memoryStorage.get(key) ?? null

        return localStorage.getItem(key)
      }
      catch (e) {
        console.error('Local storage is unavailable:', e)
        return null
      }
    },
    setItem: async (key: string, value: string | null) => {
      try {
        if (!localStorage) {
          if (value === null) {
            memoryStorage.delete(key)
          }
          else {
            memoryStorage.set(key, value)
          }
          return
        }

        if (value === null) {
          localStorage.removeItem(key)
        }
        else {
          localStorage.setItem(key, value)
        }
      }
      catch (e) {
        console.error('Local storage is unavailable:', e)
      }
    },
    removeItem: async (key: string) => {
      try {
        if (!localStorage) {
          memoryStorage.delete(key)
          return
        }

        localStorage.removeItem(key)
      }
      catch (e) {
        console.error('Local storage is unavailable:', e)
      }
    },
  }
})
