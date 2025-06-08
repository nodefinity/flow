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

interface SettingsState {
  isLoading: boolean
  setting: AppSetting
  updateSetting: (newSetting: Partial<AppSetting>) => void
}

let _store: ReturnType<typeof createSettingsStore> | null = null

function createSettingsStore() {
  return create<SettingsState>()(
    persist(
      set => ({
        isLoading: true,
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
          if (state) {
            state.isLoading = false
          }
        },
      },
    ),
  )
}

export function useAppSetting() {
  if (!_store) {
    _store = createSettingsStore()
  }
  const { isLoading, setting, updateSetting } = _store()
  const colorScheme = useColorScheme()
  const language = useLanguage()
  const { i18n } = useTranslation()

  useEffect(() => {
    if (setting?.language) {
      const targetLang = setting.language === 'auto' ? language : setting.language
      if (i18n.language !== targetLang) {
        i18n.changeLanguage(targetLang)
      }
    }
  }, [setting?.language, i18n, language])

  const currentTheme = setting?.theme || 'auto'
  const effectiveColorScheme = currentTheme === 'auto' ? colorScheme : currentTheme
  const currentColor = setting?.color || 'default'

  return {
    isSettingLoading: isLoading,
    setting,
    updateSetting,
    effectiveColorScheme,
    currentColor,
  }
}
