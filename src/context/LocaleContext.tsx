import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { CurrencyCode, ExchangeRates } from '../utils/currency'
import { formatCardPrice, formatPrice, formatPriceRange } from '../utils/currency'

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
  requestedCurrency: CurrencyCode
  hasLiveExchangeRates: boolean
  setLanguage: (code: LanguageCode) => void
  formatCurrency: (amountUSD: number) => string
  formatCardCurrency: (amountUSD: number) => string
  formatCurrencyIn: (amountUSD: number, currencyCode: CurrencyCode) => string
  formatCurrencyRange: (minUSD: number, maxUSD: number | null) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)
const exchangeRateCacheKey = 'uft-exchange-rates-usd'
const exchangeRateCacheMaxAgeMs = 1000 * 60 * 30
const supportedCurrencies: CurrencyCode[] = ['USD', 'GBP', 'EUR', 'TZS', 'RWF', 'UGX', 'CNY', 'RUB', 'AED', 'SAR', 'INR']
const exchangeRateSymbols = supportedCurrencies.filter((currencyCode) => currencyCode !== 'USD').join(',')

type ExchangeRateCache = {
  fetchedAt: number
  rates: Partial<Record<CurrencyCode, number>>
}

function readCachedExchangeRates(): ExchangeRates | null {
  try {
    const cached = localStorage.getItem(exchangeRateCacheKey)
    if (!cached) return null

    const parsed = JSON.parse(cached) as ExchangeRateCache
    if (!parsed.fetchedAt || Date.now() - parsed.fetchedAt > exchangeRateCacheMaxAgeMs) return null

    return normalizeExchangeRates(parsed.rates)
  } catch (error) {
    console.error('Failed to read cached exchange rates', error)
    return null
  }
}

function normalizeExchangeRates(rates: Partial<Record<CurrencyCode, number>>): ExchangeRates | null {
  const normalized = supportedCurrencies.reduce<Partial<ExchangeRates>>((nextRates, currencyCode) => {
    const rate = currencyCode === 'USD' ? 1 : rates[currencyCode]
    if (!Number.isFinite(rate) || Number(rate) <= 0) return nextRates

    nextRates[currencyCode] = Number(rate)
    return nextRates
  }, {})

  return supportedCurrencies.every((currencyCode) => normalized[currencyCode])
    ? normalized as ExchangeRates
    : null
}

async function fetchJson<TPayload>(url: string, signal: AbortSignal): Promise<TPayload> {
  const response = await fetch(url, { signal })
  const payload = await response.json() as TPayload

  if (!response.ok) {
    throw new Error('Exchange rate API returned an invalid response')
  }

  return payload
}

async function fetchExchangeRateHostRates(signal: AbortSignal): Promise<ExchangeRates> {
  const payload = await fetchJson<{
    success?: boolean
    rates?: Partial<Record<CurrencyCode, number>>
  }>(`https://api.exchangerate.host/latest?base=USD&symbols=${exchangeRateSymbols}`, signal)

  if (payload.success === false || !payload.rates) {
    throw new Error('exchangerate.host returned an invalid response')
  }

  const normalizedRates = normalizeExchangeRates(payload.rates)
  if (!normalizedRates) {
    throw new Error('exchangerate.host response is missing required currencies')
  }

  return normalizedRates
}

async function fetchOpenExchangeRates(signal: AbortSignal): Promise<ExchangeRates> {
  const payload = await fetchJson<{
    result?: string
    rates?: Partial<Record<CurrencyCode, number>>
  }>('https://open.er-api.com/v6/latest/USD', signal)

  if (payload.result === 'error' || !payload.rates) {
    throw new Error('open.er-api.com returned an invalid response')
  }

  const normalizedRates = normalizeExchangeRates(payload.rates)
  if (!normalizedRates) {
    throw new Error('open.er-api.com response is missing required currencies')
  }

  return normalizedRates
}

async function fetchExchangeRates(signal: AbortSignal): Promise<ExchangeRates> {
  const errors: Error[] = []

  for (const requestRates of [fetchExchangeRateHostRates, fetchOpenExchangeRates]) {
    try {
      const rates = await requestRates(signal)

      localStorage.setItem(exchangeRateCacheKey, JSON.stringify({
        fetchedAt: Date.now(),
        rates,
      }))

      return rates
    } catch (error) {
      if (signal.aborted) throw error

      errors.push(error instanceof Error ? error : new Error(String(error)))
    }
  }

  throw new Error(errors.map((error) => error.message).join(' | ') || 'Exchange rate APIs failed')
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(() => readCachedExchangeRates())
  const currentLanguage = languages.find((language) => language.code === i18n.language) ?? languages[0]
  const requestedCurrency = currentLanguage.currency
  const currency = requestedCurrency

  useEffect(() => {
    if (!languages.some((language) => language.code === i18n.language)) {
      void i18n.changeLanguage('en-US')
      return
    }

    document.documentElement.lang = currentLanguage.code
    document.documentElement.dir = currentLanguage.dir ?? 'ltr'
    localStorage.setItem('uft-language', currentLanguage.code)
  }, [currentLanguage, i18n])

  useEffect(() => {
    const controller = new AbortController()

    fetchExchangeRates(controller.signal)
      .then((nextRates) => setExchangeRates(nextRates))
      .catch((error) => {
        if (controller.signal.aborted) return

        console.error('Failed to fetch live exchange rates; using fallback exchange rates.', error)
        setExchangeRates(null)
      })

    return () => controller.abort()
  }, [currentLanguage.code])

  const value = useMemo<LocaleContextValue>(() => ({
    language: currentLanguage,
    currency,
    requestedCurrency,
    hasLiveExchangeRates: Boolean(exchangeRates),
    setLanguage: (code) => {
      void i18n.changeLanguage(code)
    },
    formatCurrency: (amountUSD) => formatPrice(amountUSD, currency, exchangeRates ?? undefined),
    formatCardCurrency: (amountUSD) => formatCardPrice(amountUSD, currency, exchangeRates ?? undefined),
    formatCurrencyIn: (amountUSD, currencyCode) => {
      return formatPrice(amountUSD, currencyCode, exchangeRates ?? undefined)
    },
    formatCurrencyRange: (minUSD, maxUSD) => formatPriceRange(minUSD, maxUSD, currency, exchangeRates ?? undefined),
  }), [currency, currentLanguage, exchangeRates, i18n, requestedCurrency])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) throw new Error('useLocale must be used inside LocaleProvider')
  return context
}
