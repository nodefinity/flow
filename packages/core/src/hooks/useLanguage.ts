export type LanguageType = 'zh' | 'en' | undefined

export interface LanguageAdapter {
  useLanguage: () => LanguageType
}

export type LanguageHook = () => LanguageType

const defaultAdapter: LanguageAdapter = {
  // eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
  useLanguage: () => 'zh',
}

let currentAdapter: LanguageAdapter = defaultAdapter

export function registerLanguageAdapter(adapter: LanguageAdapter): void {
  currentAdapter = adapter
}

export function useLanguage() {
  return currentAdapter.useLanguage()
}
