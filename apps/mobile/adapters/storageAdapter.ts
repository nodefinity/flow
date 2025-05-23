import { StorageAdapter } from '@flow/core';
import * as SecureStore from 'expo-secure-store';

export const mobileStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem failed:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string | null) => {
    try {
      if (value === null) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('SecureStore setItem failed:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem failed:', error);
    }
  }
};
