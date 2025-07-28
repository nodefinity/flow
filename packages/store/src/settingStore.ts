import type { Language, Theme } from '@flow/core'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { storage } from './providers/storage'
import { createSelectors } from './utils/createSelectors'

interface SettingStore {
  hasHydrated: boolean
  setHasHydrated: (state: boolean) => void

  theme: Theme
  language: Language

  updateSetting: (partial: Partial<Pick<SettingStore, 'theme' | 'language'>>) => void
}

const settingStoreBase = create<SettingStore>()(
  immer(
    persist(
      set => ({
        hasHydrated: false,
        setHasHydrated: (state: boolean) => {
          set((draft) => {
            draft.hasHydrated = state
          })
        },

        theme: 'auto',
        language: 'auto',

        updateSetting: partial => set((draft) => {
          Object.assign(draft, partial)
        }),
      }),
      {
        name: 'setting-store',
        storage,
        onRehydrateStorage: () => state => state?.setHasHydrated(true),
      },
    ),
  ),
)

export const useSettingStore = createSelectors(settingStoreBase)
