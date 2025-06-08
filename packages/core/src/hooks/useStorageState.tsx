/**
 * This module is platform-agnostic. Each platform (mobile, desktop) must inject its own implementation.
 */

export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string | null) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

// Default storage adapter
const webStorageAdapter: StorageAdapter = {
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

// Memory storage adapter for fallback
// Note: memory storage will be lost after app restart, only as a fallback
// Recommend to register appropriate persistent storage adapter for each platform
interface MemoryStorageAdapter extends StorageAdapter {
  _store: Map<string, string>
}

const memoryStorageAdapter: MemoryStorageAdapter = {
  _store: new Map<string, string>(),
  getItem: async (key: string) => memoryStorageAdapter._store.get(key) || null,
  setItem: async (key: string, value: string | null) => {
    if (value === null) {
      memoryStorageAdapter._store.delete(key)
    }
    else {
      memoryStorageAdapter._store.set(key, value)
    }
  },
  removeItem: async (key: string) => {
    memoryStorageAdapter._store.delete(key)
  },
}

let storageAdapter: StorageAdapter

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined'

// Initialize default adapter
if (isBrowser) {
  storageAdapter = webStorageAdapter
}
else {
  storageAdapter = memoryStorageAdapter
}

/**
 * Register a storage adapter for different platforms
 * @param adapter - The storage adapter to register
 */
export function registerStorageAdapter(adapter: StorageAdapter): void {
  if (isBrowser) {
    storageAdapter = webStorageAdapter
  }
  else {
    storageAdapter = adapter
  }
}

export function getStorageAdapter(): StorageAdapter {
  return storageAdapter
}
