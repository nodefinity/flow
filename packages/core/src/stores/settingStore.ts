import type { Language, Theme } from '../types/setting'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getStorageAdapter } from '../hooks/useStorageState'
import { createSelectors } from '../utils/createSelectors'

interface SettingStore {
  hasHydrated: boolean
  setHasHydrated: (state: boolean) => void

  theme: Theme
  language: Language

  updateSetting: (partial: Partial<Pick<SettingStore, 'theme' | 'language'>>) => void
}

let _store: ReturnType<typeof createSettingStore> | null = null

function createSettingStore() {
  return create<SettingStore>()(
    persist(
      set => ({
        hasHydrated: false,
        setHasHydrated: (state: boolean) => {
          set({
            hasHydrated: state,
          })
        },

        theme: 'auto',
        language: 'auto',

        updateSetting: partial => set(partial),
      }),
      {
        name: 'setting-store',
        storage: createJSONStorage(() => getStorageAdapter()),
        onRehydrateStorage: () => state => state?.setHasHydrated(true),
      },
    ),
  )
}

export const useSettingStore = (() => {
  if (!_store) {
    _store = createSettingStore()
  }

  return createSelectors(_store)
})()
