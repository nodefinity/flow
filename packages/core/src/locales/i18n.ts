import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import English from './en';
import Chinese from './zh';

const resources = {
  en: { translation: English },
  zh: { translation: Chinese }
};

i18n.use(initReactI18next).init({
  resources,
  compatibilityJSON: 'v4',
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false // react already safes from xss
  },
  react: {
    useSuspense: false // avoid suspense problem
  }
});

export * from 'react-i18next';

export default i18n;
