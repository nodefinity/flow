import { Theme } from '@flow/shared'
import { useSettingStore } from '@flow/store'
import { useColorScheme } from './providers/colorScheme'

export function useEffectiveColorScheme() {
  const currentTheme = useSettingStore.use.theme()
  const systemColorScheme = useColorScheme()

  return currentTheme === Theme.AUTO ? systemColorScheme : currentTheme
}
