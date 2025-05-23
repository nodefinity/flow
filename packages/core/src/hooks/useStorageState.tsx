/**
 * This module is platform-agnostic. Each platform (mobile, desktop) must inject its own implementation.
 */

import * as React from 'react';

export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string | null) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// Default storage adapter
const webStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
      return null;
    }
  },
  setItem: async (key: string, value: string | null) => {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  },
  removeItem: async (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  }
};

// Memory storage adapter for fallback
// Note: memory storage will be lost after app restart, only as a fallback
// Recommend to register appropriate persistent storage adapter for each platform
interface MemoryStorageAdapter extends StorageAdapter {
  _store: Map<string, string>;
}

const memoryStorageAdapter: MemoryStorageAdapter = {
  _store: new Map<string, string>(),
  getItem: async (key: string) => memoryStorageAdapter._store.get(key) || null,
  setItem: async (key: string, value: string | null) => {
    if (value === null) {
      memoryStorageAdapter._store.delete(key);
    } else {
      memoryStorageAdapter._store.set(key, value);
    }
  },
  removeItem: async (key: string) => {
    memoryStorageAdapter._store.delete(key);
  }
};

let storageAdapter: StorageAdapter;

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// Initialize default adapter
if (isBrowser) {
  storageAdapter = webStorageAdapter;
} else {
  storageAdapter = memoryStorageAdapter;
}

export function registerStorageAdapter(adapter: StorageAdapter): void {
  if (isBrowser) {
    storageAdapter = webStorageAdapter;
  } else {
    storageAdapter = adapter;
  }
}

export function getStorageAdapter(): StorageAdapter {
  return storageAdapter;
}

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(initialValue: [boolean, T | null] = [true, null]): UseStateHook<T> {
  return React.useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (value === null) {
    await storageAdapter.removeItem(key);
  } else {
    await storageAdapter.setItem(key, value);
  }
}

export async function removeStorageItemAsync(key: string) {
  await storageAdapter.removeItem(key);
}

export async function getStorageItemAsync(key: string) {
  return await storageAdapter.getItem(key);
}

export function useStorageState<T = string>(key: string): UseStateHook<T> {
  // Public
  const [state, setState] = useAsyncState<T>();

  // Get
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const value = await storageAdapter.getItem(key);
        
        if (value !== null) {
          try {
            setState(JSON.parse(value) as T);
          } catch {
            setState(value as unknown as T);
          }
        } else {
          setState(null);
        }
      } catch (error) {
        console.error('Failed to get storage item:', error);
        setState(null);
      }
    };

    fetchData();
  }, [key]);

  // Set
  const setValue = React.useCallback(
    (value: T | null) => {
      setState(value);
      const stringValue = value !== null && value !== undefined ? JSON.stringify(value) : null;
      setStorageItemAsync(key, typeof value === 'string' ? value : stringValue);
    },
    [key]
  );

  return [state, setValue];
}
