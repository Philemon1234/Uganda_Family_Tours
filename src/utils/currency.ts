export type CurrencyCode = 'USD' | 'EUR' | 'TZS' | 'RWF' | 'UGX' | 'CNY' | 'RUB' | 'AED' | 'INR'

export const exchangeRatesFromUSD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  TZS: 2600,
  RWF: 1300,
  UGX: 3800,
  CNY: 7.2,
  RUB: 90,
  AED: 3.67,
  INR: 83,
}

export const currencyLocales: Record<CurrencyCode, string> = {
  USD: 'en-US',
  EUR: 'fr-FR',
  TZS: 'sw-TZ',
  RWF: 'rw-RW',
  UGX: 'en-UG',
  CNY: 'zh-CN',
  RUB: 'ru-RU',
  AED: 'ar-AE',
  INR: 'hi-IN',
}

export function convertFromUSD(amountUSD: number, currencyCode: CurrencyCode) {
  return amountUSD * exchangeRatesFromUSD[currencyCode]
}

export function formatPrice(amountUSD: number, currencyCode: CurrencyCode) {
  const converted = convertFromUSD(amountUSD, currencyCode)
  const zeroDecimalCurrencies: CurrencyCode[] = ['TZS', 'RWF', 'UGX', 'RUB', 'INR']

  return new Intl.NumberFormat(currencyLocales[currencyCode], {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: zeroDecimalCurrencies.includes(currencyCode) ? 0 : 2,
    minimumFractionDigits: zeroDecimalCurrencies.includes(currencyCode) ? 0 : 0,
  }).format(converted)
}

export function formatPriceRange(minUSD: number, maxUSD: number | null, currencyCode: CurrencyCode) {
  if (maxUSD === null) return `${formatPrice(minUSD, currencyCode)}+`
  return `${formatPrice(minUSD, currencyCode)} - ${formatPrice(maxUSD, currencyCode)}`
}
