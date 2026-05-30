import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import it from './locales/it.json'
import de from './locales/de.json'
import sw from './locales/sw.json'
import rw from './locales/rw.json'
import lg from './locales/lg.json'

const supportedLanguages = ['en', 'fr', 'es', 'it', 'de', 'sw', 'rw', 'lg']
const savedLanguage = localStorage.getItem('uft-language') || 'en'
const initialLanguage = supportedLanguages.includes(savedLanguage) ? savedLanguage : 'en'

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
    it: { translation: it },
    de: { translation: de },
    sw: { translation: sw },
    rw: { translation: rw },
    lg: { translation: lg },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  returnEmptyString: false,
})

export default i18n
