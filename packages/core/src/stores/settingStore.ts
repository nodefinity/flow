import type { ColorName, Language, Theme } from '../types/setting'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getStorageAdapter } from '../hooks/useStorageState'
import { createSelectors } from '../utils/createSelectors'

interface SettingStore {
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void

  theme: Theme
  language: Language
  color: ColorName

  updateSetting: (partial: Partial<Pick<SettingStore, 'theme' | 'language' | 'color'>>) => void
}

let _store: ReturnType<typeof createSettingStore> | null = null

function createSettingStore() {
  return create<SettingStore>()(
    persist(
      set => ({
        _hasHydrated: false,
        setHasHydrated: (state: boolean) => {
          set({
            _hasHydrated: state,
          })
        },

        theme: 'auto',
        language: 'auto',
        color: 'default',

        updateSetting: partial => set(partial),
      }),
      {
        name: 'app-setting',
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
