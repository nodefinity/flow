import type { Language, Theme } from '@flow/core'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getStorage } from './providers/storage'
import { createSelectors } from './utils/createSelectors'

interface SettingStore {
  hasHydrated: boolean
  setHasHydrated: (state: boolean) => void

  theme: Theme
  language: Language

  updateSetting: (partial: Partial<Pick<SettingStore, 'theme' | 'language'>>) => void
}

const settingStoreBase = create<SettingStore>()(
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
      storage: createJSONStorage(() => getStorage),
      onRehydrateStorage: () => state => state?.setHasHydrated(true),
    },
  ),
)

export const useSettingStore = createSelectors(settingStoreBase)
