import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useColorScheme } from '../hooks/useColorScheme';
import { getStorageAdapter } from '../hooks/useStorageState';
import { AppSetting } from '../types/setting';


const DEFAULT_SETTING: AppSetting = {
  theme: 'auto',
  language: 'auto',
  color: 'default'
};

interface SettingsState {
  isLoading: boolean;
  setting: AppSetting;
  updateSetting: (newSetting: Partial<AppSetting>) => void;
  isInitialized: boolean;
  setInitialized: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isLoading: true,
      setting: DEFAULT_SETTING,
      updateSetting: (newSetting: Partial<AppSetting>) =>
        set((state) => ({
          setting: { ...state.setting, ...newSetting },
        })),
      isInitialized: false,
      setInitialized: (value: boolean) => set({ isInitialized: value }),
    }),
    {
      name: 'app-setting',
      storage: createJSONStorage(() => getStorageAdapter()),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);

export function useAppSetting() {
  const { 
    isLoading, 
    setting, 
    updateSetting, 
    isInitialized, 
    setInitialized 
  } = useSettingsStore();
  const colorScheme = useColorScheme();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!isLoading && !isInitialized) {
      setInitialized(true);
      if (!setting || Object.keys(setting).length === 0) {
        updateSetting(DEFAULT_SETTING);
      }
    }
  }, [isLoading, isInitialized, setting, updateSetting, setInitialized]);

  useEffect(() => {
    if (setting?.language) {
      const targetLang = setting.language === 'auto' ? 'zh' : setting.language;
      if (i18n.language !== targetLang) {
        i18n.changeLanguage(targetLang);
      }
    }
  }, [setting?.language, i18n]);

  const currentTheme = setting?.theme || 'auto';
  const effectiveColorScheme = currentTheme === 'auto' ? colorScheme : currentTheme;
  const currentColor = setting?.color || 'default';

  return {
    isSettingLoading: isLoading,
    setting,
    updateSetting,
    effectiveColorScheme,
    currentColor,
  };
}
