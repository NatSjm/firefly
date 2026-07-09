import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uk from './locales/uk/common.json';

void i18n.use(initReactI18next).init({
  lng: 'uk',
  fallbackLng: 'uk',
  resources: {
    uk: { translation: uk },
  },
  interpolation: { escapeValue: false },
  // Resources are bundled, so initialize synchronously: translations must be
  // available to module-level helpers on first render (and in tests).
  initAsync: false,
});

export default i18n;
