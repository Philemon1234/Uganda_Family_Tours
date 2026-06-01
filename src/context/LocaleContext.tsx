import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { CurrencyCode } from '../utils/currency'
import { formatPrice, formatPriceRange } from '../utils/currency'

export type LanguageCode = 'en-US' | 'en-GB' | 'es' | 'fr' | 'de' | 'ru' | 'nl' | 'ar'

export type LanguageOption = {
  code: LanguageCode
  name: string
  nativeName: string
  labelKey: string
  flag: string
  currency: CurrencyCode
  symbol: string
  dir?: 'ltr' | 'rtl'
}

export const languages: LanguageOption[] = [
  { code: 'en-GB', name: 'English UK', nativeName: 'English UK', labelKey: 'languages.enGB', flag: '\u{1F1EC}\u{1F1E7}', currency: 'GBP', symbol: '\u00A3' },
  { code: 'en-US', name: 'English USA', nativeName: 'English USA', labelKey: 'languages.enUS', flag: '\u{1F1FA}\u{1F1F8}', currency: 'USD', symbol: '$' },
  { code: 'es', name: 'Spanish', nativeName: 'Espanol', labelKey: 'languages.es', flag: '\u{1F1EA}\u{1F1F8}', currency: 'EUR', symbol: '\u20AC' },
  { code: 'fr', name: 'French', nativeName: 'Francais', labelKey: 'languages.fr', flag: '\u{1F1EB}\u{1F1F7}', currency: 'EUR', symbol: '\u20AC' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', labelKey: 'languages.de', flag: '\u{1F1E9}\u{1F1EA}', currency: 'EUR', symbol: '\u20AC' },
  { code: 'ru', name: 'Russian', nativeName: 'Russian', labelKey: 'languages.ru', flag: '\u{1F1F7}\u{1F1FA}', currency: 'RUB', symbol: '\u20BD' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', labelKey: 'languages.nl', flag: '\u{1F1F3}\u{1F1F1}', currency: 'EUR', symbol: '\u20AC' },
  { code: 'ar', name: 'Arabic', nativeName: 'Arabic', labelKey: 'languages.ar', flag: '\u{1F1E6}\u{1F1EA}', currency: 'AED', symbol: 'AED', dir: 'rtl' },
]

type LocaleContextValue = {
  language: LanguageOption
  currency: CurrencyCode
  setLanguage: (code: LanguageCode) => void
  formatCurrency: (amountUSD: number) => string
  formatCurrencyRange: (minUSD: number, maxUSD: number | null) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const currentLanguage = languages.find((language) => language.code === i18n.language) ?? languages[0]

  useEffect(() => {
    if (!languages.some((language) => language.code === i18n.language)) {
      void i18n.changeLanguage('en-US')
      return
    }

    document.documentElement.lang = currentLanguage.code
    document.documentElement.dir = currentLanguage.dir ?? 'ltr'
    localStorage.setItem('uft-language', currentLanguage.code)
  }, [currentLanguage, i18n])

  const value = useMemo<LocaleContextValue>(() => ({
    language: currentLanguage,
    currency: currentLanguage.currency,
    setLanguage: (code) => {
      void i18n.changeLanguage(code)
    },
    formatCurrency: (amountUSD) => formatPrice(amountUSD, currentLanguage.currency),
    formatCurrencyRange: (minUSD, maxUSD) => formatPriceRange(minUSD, maxUSD, currentLanguage.currency),
  }), [currentLanguage, i18n])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) throw new Error('useLocale must be used inside LocaleProvider')
  return context
}
