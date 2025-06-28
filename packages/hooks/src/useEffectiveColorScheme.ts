import { useSettingStore } from '@flow/store'
import { useColorScheme } from './providers/colorScheme'

export function useEffectiveColorScheme() {
  const currentTheme = useSettingStore.use.theme()
  const systemColorScheme = useColorScheme()

  return currentTheme === 'auto' ? systemColorScheme : currentTheme
}
