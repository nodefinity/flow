import type { Language } from '../types'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingStore } from '../stores'
import { useColorScheme } from './useColorScheme'
import { useLanguage } from './useLanguage'

export function useAppearanceSetting() {
  const systemColorScheme = useColorScheme()
  const systemLanguage = useLanguage() as Language
  const { i18n } = useTranslation()

  const currentTheme = useSettingStore.use.theme()
  const language = useSettingStore.use.language()

  useEffect(() => {
    if (language) {
      const targetLang = language === 'auto' ? systemLanguage : language
      if (i18n.language !== targetLang) {
        i18n.changeLanguage(targetLang)
      }
    }
  }, [language, systemLanguage, i18n])

  const effectiveColorScheme = currentTheme === 'auto' ? systemColorScheme : currentTheme

  return {
    effectiveColorScheme,
  }
}
