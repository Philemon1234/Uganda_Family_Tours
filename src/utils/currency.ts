export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'TZS' | 'RWF' | 'UGX' | 'CNY' | 'RUB' | 'AED' | 'SAR' | 'INR'

export type ExchangeRates = Record<CurrencyCode, number>

export const fallbackExchangeRatesFromUSD: ExchangeRates = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  TZS: 2600,
  RWF: 1300,
  UGX: 3800,
  CNY: 7.2,
  RUB: 90,
  AED: 3.67,
  SAR: 3.75,
  INR: 83,
}

export const currencyLocales: Record<CurrencyCode, string> = {
  USD: 'en-US',
  GBP: 'en-GB',
  EUR: 'fr-FR',
  TZS: 'sw-TZ',
  RWF: 'rw-RW',
  UGX: 'en-UG',
  CNY: 'zh-CN',
  RUB: 'ru-RU',
  AED: 'ar-AE',
  SAR: 'ar-SA',
  INR: 'hi-IN',
}

function safeAmount(value: number) {
  return Number.isFinite(value) ? value : 0
}

function safeRate(value: number | undefined) {
  if (typeof value !== 'number') return 1
  return Number.isFinite(value) && value > 0 ? value : 1
}

export function convertFromUSD(amountUSD: number, currencyCode: CurrencyCode, rates: ExchangeRates = fallbackExchangeRatesFromUSD) {
  return safeAmount(amountUSD) * safeRate(rates[currencyCode] ?? fallbackExchangeRatesFromUSD[currencyCode])
}

export function formatPrice(amountUSD: number, currencyCode: CurrencyCode, rates: ExchangeRates = fallbackExchangeRatesFromUSD) {
  const converted = convertFromUSD(amountUSD, currencyCode, rates)

  return new Intl.NumberFormat(currencyLocales[currencyCode], {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(converted)
}

export function formatCardPrice(amountUSD: number, currencyCode: CurrencyCode, rates: ExchangeRates = fallbackExchangeRatesFromUSD) {
  const converted = convertFromUSD(amountUSD, currencyCode, rates)

  return new Intl.NumberFormat(currencyLocales[currencyCode], {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(converted)
}

export function formatPriceRange(
  minUSD: number,
  maxUSD: number | null,
  currencyCode: CurrencyCode,
  rates: ExchangeRates = fallbackExchangeRatesFromUSD,
) {
  if (maxUSD === null) return `${formatPrice(minUSD, currencyCode, rates)}+`
  return `${formatPrice(minUSD, currencyCode, rates)} - ${formatPrice(maxUSD, currencyCode, rates)}`
}
