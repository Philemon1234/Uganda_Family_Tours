import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { CurrencyCode } from '../utils/currency'
import { formatPrice, formatPriceRange } from '../utils/currency'

export type LanguageCode = 'en' | 'fr' | 'es' | 'it' | 'de' | 'sw' | 'rw' | 'lg'

export type LanguageOption = {
  code: LanguageCode
  name: string
  nativeName: string
  flag: string
  currency: CurrencyCode
  dir?: 'ltr' | 'rtl'
}

export const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', currency: 'USD' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', currency: 'EUR' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', currency: 'EUR' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', currency: 'EUR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', currency: 'EUR' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿', currency: 'TZS' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Kinyarwanda', flag: '🇷🇼', currency: 'RWF' },
  { code: 'lg', name: 'Luganda', nativeName: 'Luganda', flag: '🇺🇬', currency: 'UGX' },
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
      void i18n.changeLanguage('en')
      return
    }

    document.documentElement.lang = currentLanguage.code
    document.documentElement.dir = currentLanguage.dir ?? 'ltr'
    localStorage.setItem('uft-language', currentLanguage.code)
  }, [currentLanguage])

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
