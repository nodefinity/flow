import type { AppSetting } from '../types/setting'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useColorScheme } from '../hooks/useColorScheme'
import { useLanguage } from '../hooks/useLanguage'
import { getStorageAdapter } from '../hooks/useStorageState'

const DEFAULT_SETTING: AppSetting = {
  theme: 'auto',
  language: 'auto',
  color: 'default',
}

interface SettingStore {
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  setting: AppSetting
  updateSetting: (newSetting: Partial<AppSetting>) => void
}

let _store: ReturnType<typeof createSettingStore> | null = null

function createSettingStore() {
  return create<SettingStore>()(
    persist(
      set => ({
        _hasHydrated: true,
        setHasHydrated: (state: boolean) => {
          set({
            _hasHydrated: state,
          })
        },
        setting: DEFAULT_SETTING,
        updateSetting: (newSetting: Partial<AppSetting>) =>
          set(state => ({
            setting: { ...state.setting, ...newSetting },
          })),
      }),
      {
        name: 'app-setting',
        storage: createJSONStorage(() => getStorageAdapter()),
        onRehydrateStorage: () => (state) => {
          console.log('onRehydrateStorage', state)
          if (state) {
            state.setHasHydrated(true)
          }
        },
      },
    ),
  )
}

export function useSettingStore() {
  if (!_store) {
    _store = createSettingStore()
  }
  const { _hasHydrated, setting, updateSetting } = _store()
  const colorScheme = useColorScheme()
  const language = useLanguage()
  const { i18n } = useTranslation()

  useEffect(() => {
    if (setting?.language) {
      const targetLang = setting.language === 'auto' ? language : setting.language
      i18n.changeLanguage(targetLang)
    }
  }, [setting?.language, i18n, language])

  const currentTheme = setting?.theme || 'auto'
  const effectiveColorScheme = currentTheme === 'auto' ? colorScheme : currentTheme
  const currentColor = setting?.color || 'default'

  return {
    isSettingHydrated: _hasHydrated,
    setting,
    updateSetting,
    effectiveColorScheme,
    currentColor,
  }
}
