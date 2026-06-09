import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enUS from './locales/en-US.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import de from './locales/de.json'
import ru from './locales/ru.json'
import nl from './locales/nl.json'
import ar from './locales/ar.json'
import { aboutPageTranslations } from './aboutPageTranslations'

const supportedLanguages = ['en-US', 'en-GB', 'es', 'fr', 'de', 'ru', 'nl', 'ar']
const legacyLanguageMap: Record<string, string> = {
  en: 'en-US',
}
const savedLanguage = localStorage.getItem('uft-language') || 'en-US'
const normalizedSavedLanguage = legacyLanguageMap[savedLanguage] ?? savedLanguage
const initialLanguage = supportedLanguages.includes(normalizedSavedLanguage) ? normalizedSavedLanguage : 'en-US'

function withAboutPageTranslations<TLocale extends { aboutPage?: unknown }>(
  locale: TLocale,
  language: keyof typeof aboutPageTranslations,
) {
  return {
    ...locale,
    aboutPage: aboutPageTranslations[language],
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    'en-US': { translation: enUS },
    'en-GB': { translation: enUS },
    fr: { translation: withAboutPageTranslations(fr, 'fr') },
    es: { translation: withAboutPageTranslations(es, 'es') },
    de: { translation: withAboutPageTranslations(de, 'de') },
    ru: { translation: withAboutPageTranslations(ru, 'ru') },
    nl: { translation: withAboutPageTranslations(nl, 'nl') },
    ar: { translation: withAboutPageTranslations(ar, 'ar') },
  },
  lng: initialLanguage,
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false,
  },
  returnEmptyString: false,
})

export default i18n
