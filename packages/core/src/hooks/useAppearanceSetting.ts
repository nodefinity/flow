import type { Language } from '../types'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingStore } from '../stores'
import { useColorScheme } from './useColorScheme'
import { useLanguage } from './useLanguage'

export function useAppearanceSetting() {
  const colorScheme = useColorScheme()
  const systemLanguage = useLanguage() as Language
  const { i18n } = useTranslation()

  const theme = useSettingStore.use.theme()
  const language = useSettingStore.use.language()
  const color = useSettingStore.use.color()

  useEffect(() => {
    if (language) {
      const targetLang = language === 'auto' ? systemLanguage : language
      if (i18n.language !== targetLang) {
        i18n.changeLanguage(targetLang)
      }
    }
  }, [language, systemLanguage, i18n])

  const currentTheme = theme
  const effectiveColorScheme = currentTheme === 'auto' ? colorScheme : currentTheme
  const currentColor = color

  return {
    effectiveColorScheme,
    currentColor,
  }
}
