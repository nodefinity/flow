import { getLocales } from 'expo-localization'

// eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
export function useLanguage() {
  const locales = getLocales()
  return (locales[0]?.languageCode || 'en') as 'zh' | 'en'
}
