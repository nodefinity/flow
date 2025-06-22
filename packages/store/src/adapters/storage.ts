export const storageAdapter = {
  getItem: async (key: string) => {
    try {
      return localStorage.getItem(key)
    }
    catch (e) {
      console.error('Local storage is unavailable:', e)
      return null
    }
  },
  setItem: async (key: string, value: string | null) => {
    try {
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
      localStorage.removeItem(key)
    }
    catch (e) {
      console.error('Local storage is unavailable:', e)
    }
  },
}
