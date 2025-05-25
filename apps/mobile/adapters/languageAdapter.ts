import type { LanguageType } from '@flow/core'
import { getLocales } from 'expo-localization'

export const languageAdapter = {
  // eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
  useLanguage: () => {
    const locales = getLocales()
    return (locales[0].languageCode || 'en') as LanguageType
  },
}
