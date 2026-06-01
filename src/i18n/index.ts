import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enUS from './locales/en-US.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import de from './locales/de.json'
import ru from './locales/ru.json'
import nl from './locales/nl.json'
import ar from './locales/ar.json'

const supportedLanguages = ['en-US', 'en-GB', 'es', 'fr', 'de', 'ru', 'nl', 'ar']
const legacyLanguageMap: Record<string, string> = {
  en: 'en-US',
}
const savedLanguage = localStorage.getItem('uft-language') || 'en-US'
const normalizedSavedLanguage = legacyLanguageMap[savedLanguage] ?? savedLanguage
const initialLanguage = supportedLanguages.includes(normalizedSavedLanguage) ? normalizedSavedLanguage : 'en-US'

void i18n.use(initReactI18next).init({
  resources: {
    'en-US': { translation: enUS },
    'en-GB': { translation: enUS },
    fr: { translation: fr },
    es: { translation: es },
    de: { translation: de },
    ru: { translation: ru },
    nl: { translation: nl },
    ar: { translation: ar },
  },
  lng: initialLanguage,
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false,
  },
  returnEmptyString: false,
})

export default i18n
