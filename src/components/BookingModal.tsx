import { useEffect, useMemo, useState } from 'react'
import { FaCalendarDays, FaHouse, FaRegStar, FaUserGroup, FaXmark } from 'react-icons/fa6'
import { FiArrowRight, FiChevronDown, FiInfo, FiMinus, FiPlus } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import type { Tour } from '../data/tours'
import { countries, countryFlag } from '../data/countries'
import { useLocale } from '../context/LocaleContext'
import { formatPrice, type CurrencyCode } from '../utils/currency'

type BookingModalProps = {
  isOpen: boolean
  tour?: Tour
  onClose: () => void
}

type FormState = {
  fullName: string
  email: string
  phone: string
  country: string
  travelDate: string
  flexible: 'Yes' | 'No'
  adults: number
  children: number
  childrenAges: string
  accommodation: 'Budget' | 'Mid-range' | 'Luxury'
  notes: string
}

type AccommodationPreference = FormState['accommodation']

const initialForm: FormState = {
  fullName: '',
  email: '',
  phone: '',
  country: '',
  travelDate: '',
  flexible: 'Yes',
  adults: 1,
  children: 0,
  childrenAges: '',
  accommodation: 'Mid-range',
  notes: '',
}

const accommodationMultipliers: Record<AccommodationPreference, number> = {
  Budget: 0.85,
  'Mid-range': 1,
  Luxury: 1.35,
}

const euroCountryCodes = new Set([
  'AD', 'AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MC', 'ME',
  'MT', 'NL', 'PT', 'SI', 'SK', 'SM', 'VA',
])

const countryCurrencyOverrides: Partial<Record<string, CurrencyCode>> = {
  AE: 'AED',
  CN: 'CNY',
  IN: 'INR',
  RU: 'RUB',
  RW: 'RWF',
  TZ: 'TZS',
  UG: 'UGX',
}

function currencyForCountryCode(countryCode?: string, fallback: CurrencyCode = 'USD') {
  if (!countryCode) return fallback
  if (euroCountryCodes.has(countryCode)) return 'EUR'
  return countryCurrencyOverrides[countryCode] ?? fallback
}

export function BookingModal({ isOpen, tour, onClose }: BookingModalProps) {
  const { t, i18n } = useTranslation()
  const { currency } = useLocale()
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCountryOpen, setIsCountryOpen] = useState(false)

  const selectedTour = useMemo(
    () => t('bookingForm.selectedTourValue', {
      tour: tour?.title ?? t('bookingForm.defaultTourName'),
    }),
    [t, tour],
  )
  const countryDisplayNames = useMemo(
    () => new Intl.DisplayNames([i18n.language], { type: 'region' }),
    [i18n.language],
  )
  const selectedCountry = countries.find((country) => {
    const countryInput = form.country.trim().toLowerCase()
    const translatedName = countryDisplayNames.of(country.code)?.toLowerCase()

    return country.name.toLowerCase() === countryInput || translatedName === countryInput
  })
  const selectedCurrency = currencyForCountryCode(selectedCountry?.code, currency)
  const perPersonBudgetUSD = tour?.priceUSD ?? 1970
  const travelers = Math.max(0, Number(form.adults) + Number(form.children))
  const accommodationMultiplier = accommodationMultipliers[form.accommodation]
  // Children are counted as full travelers for now to match the existing group-size estimate.
  const adjustedPerPersonBudgetUSD = perPersonBudgetUSD * accommodationMultiplier
  const estimatedPerPersonBudget = formatPrice(adjustedPerPersonBudgetUSD, selectedCurrency)
  const estimatedGroupBudget = formatPrice(adjustedPerPersonBudgetUSD * travelers, selectedCurrency)
  const accommodationStayLabelKey =
    form.accommodation === 'Budget'
      ? 'budget'
      : form.accommodation === 'Luxury'
        ? 'luxury'
        : 'midRange'

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const update = (field: keyof FormState, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStatus(null)
  }

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {}
    ;(['fullName', 'email', 'phone', 'country', 'travelDate'] as const).forEach((field) => {
      if (!String(form[field]).trim()) nextErrors[field] = t('common.required')
    })
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = t('common.validEmail')
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) {
      setStatus({
        type: 'error',
        message: t('bookingForm.requiredMissing'),
      })
      return
    }
    const payload = { selectedTour, ...form }
    setIsSubmitting(true)
    setStatus({ type: 'info', message: t('bookingForm.sending') })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          packageId: tour?.packageId,
          budgetPerPerson: estimatedPerPersonBudget,
          baseBudgetPerPerson: formatPrice(perPersonBudgetUSD, selectedCurrency),
          estimatedGroupBudget,
          travelers,
          accommodationPreference: form.accommodation,
          accommodationMultiplier,
          currency: selectedCurrency,
        }),
      })
      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.message || t('bookingForm.error'))
      }

      setForm(initialForm)
      setStatus({ type: 'success', message: t('bookingForm.success') })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : t('bookingForm.error'),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-x-hidden bg-black/65 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6" onMouseDown={onClose}>
      <div
        className="max-h-[94vh] w-full max-w-[54rem] overflow-hidden rounded-[1.5rem] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="booking-modal-scroll max-h-[94vh] overflow-x-hidden overflow-y-auto p-5 pb-24 sm:p-6 sm:pb-8 md:p-7 lg:p-8">
          <div className="relative text-center">
            <button className="absolute right-0 top-0 text-2xl text-muted transition hover:text-primary" type="button" aria-label={t('common.close')} onClick={onClose}>
              <FaXmark />
            </button>
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-2xl text-primary">
              <FaCalendarDays />
            </div>
            <h2 id="booking-title" className="mt-3 text-2xl font-bold text-ink md:text-3xl">{t('bookingForm.title')}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              {t('bookingForm.subtitle')}
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
            <Field label={t('bookingForm.selectedTour')}>
              <input className="input" value={selectedTour} readOnly />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('bookingForm.fullName')} required error={errors.fullName}>
                <input className="input" value={form.fullName} onChange={(event) => update('fullName', event.target.value)} placeholder={t('bookingForm.fullNamePlaceholder')} />
              </Field>
              <Field label={t('bookingForm.email')} required error={errors.email}>
                <input className="input" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder={t('bookingForm.emailPlaceholder')} />
              </Field>
              <Field label={t('bookingForm.phone')} required error={errors.phone}>
                <input className="input" value={form.phone} onChange={(event) => update('phone', event.target.value)} />
              </Field>
              <Field label={t('bookingForm.country')} required error={errors.country}>
                <CountrySelect
                  value={form.country}
                  locale={i18n.language}
                  isOpen={isCountryOpen}
                  onOpenChange={setIsCountryOpen}
                  onChange={(value) => update('country', value)}
                />
              </Field>
              <Field label={t('bookingForm.travelDate')} required error={errors.travelDate}>
                <input className="input" type="date" value={form.travelDate} onChange={(event) => update('travelDate', event.target.value)} />
              </Field>
              <Field label={t('bookingForm.flexibleDates')}>
                <div className="grid grid-cols-2 gap-2">
                  {(['Yes', 'No'] as const).map((value) => (
                    <button
                      key={value}
                      className={`segmented ${form.flexible === value ? 'segmented-active' : ''}`}
                      type="button"
                      onClick={() => update('flexible', value)}
                    >
                      {value === 'Yes' ? t('common.yes') : t('common.no')}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-ink">{t('bookingForm.groupSize')}</p>
              <div className="grid gap-4 md:grid-cols-3">
                <Counter label={t('bookingForm.adults')} value={form.adults} onChange={(value) => update('adults', Math.max(1, value))} />
                <Counter label={t('bookingForm.children')} value={form.children} onChange={(value) => update('children', Math.max(0, value))} />
                <Field label={t('bookingForm.childrenAges')}>
                  <input className="input" value={form.childrenAges} onChange={(event) => update('childrenAges', event.target.value)} placeholder={t('bookingForm.childrenAgesPlaceholder')} />
                </Field>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('bookingForm.accommodation')} required>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Budget', label: t('bookingForm.accommodationOptions.budget'), icon: FaHouse },
                    { name: 'Mid-range', label: t('bookingForm.accommodationOptions.midRange'), icon: FaUserGroup },
                    { name: 'Luxury', label: t('bookingForm.accommodationOptions.luxury'), icon: FaRegStar },
                  ].map(({ name, label, icon: Icon }) => (
                    <button
                      key={name}
                      className={`rounded-lg border p-3 text-xs font-semibold transition hover:border-primary ${form.accommodation === name ? 'border-primary bg-primary/5 text-primary' : 'border-border text-ink'}`}
                      type="button"
                      onClick={() => update('accommodation', name)}
                    >
                      <Icon className="mx-auto mb-2 text-lg" />
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs font-semibold text-muted">
                  {t('bookingForm.accommodationNote')}
                </p>
              </Field>
              <Field label={t('bookingForm.budget')} required>
                <input className="input font-bold text-ink" value={estimatedGroupBudget} readOnly />
                <p className="mt-2 text-xs font-semibold text-muted">
                  {t('bookingForm.budgetCalculation', {
                    perPerson: estimatedPerPersonBudget,
                    travelers,
                    travelerLabel: travelers === 1 ? t('bookingForm.traveler') : t('bookingForm.travelers'),
                    stay: t(`bookingForm.accommodationStay.${accommodationStayLabelKey}`),
                  })}
                </p>
              </Field>
              <Field label={t('bookingForm.specialRequests')} className="md:col-span-2">
                <textarea
                  className="input min-h-20 resize-none"
                  value={form.notes}
                  maxLength={500}
                  onChange={(event) => update('notes', event.target.value)}
                  placeholder={t('bookingForm.notesPlaceholder')}
                />
                <p className="mt-1 text-right text-xs text-muted">{form.notes.length}/500</p>
              </Field>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 p-3 text-sm text-ink">
              <FiInfo className="mt-0.5 shrink-0 text-primary" />
              {t('bookingForm.info')}
            </div>
            {status && (
              <p
                className={`rounded-lg p-3 text-sm font-semibold ${
                  status.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : status.type === 'error'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-primary/5 text-primary'
                }`}
              >
                {status.message}
              </p>
            )}
            <div className="flex flex-col gap-3 pt-1">
              <button className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('common.sending') : t('bookingForm.submit')} <FiArrowRight />
              </button>
              <button className="btn-outline justify-center" type="button" onClick={onClose} disabled={isSubmitting}>{t('common.cancel')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

type FieldProps = {
  label: string
  required?: boolean
  error?: string
  className?: string
  children: React.ReactNode
}

function Field({ label, required, error, className = '', children }: FieldProps) {
  return (
    <label className={`block text-left text-sm font-semibold text-ink ${error ? 'field-error' : ''} ${className}`}>
      {label} {required && <span className="text-primary">*</span>}
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  )
}

function CountrySelect({
  value,
  locale,
  isOpen,
  onOpenChange,
  onChange,
}: {
  value: string
  locale: string
  isOpen: boolean
  onOpenChange: (value: boolean) => void
  onChange: (value: string) => void
}) {
  const { t } = useTranslation()
  const displayNames = useMemo(() => new Intl.DisplayNames([locale], { type: 'region' }), [locale])
  const countryOptions = useMemo(
    () => countries.map((country) => ({
      ...country,
      displayName: displayNames.of(country.code) ?? country.name,
    })),
    [displayNames],
  )
  const search = value.trim().toLowerCase()
  const filteredCountries = countryOptions.filter((country) => {
    if (!search) return true
    return (
      country.name.toLowerCase().includes(search) ||
      country.displayName.toLowerCase().includes(search) ||
      country.iso3.toLowerCase().includes(search) ||
      country.code.toLowerCase().includes(search)
    )
  })

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onOpenChange(false)
        }
      }}
    >
      <input
        className="input pr-11"
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          onOpenChange(true)
        }}
        onFocus={() => onOpenChange(true)}
        placeholder={t('bookingForm.selectCountry')}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="country-listbox"
        aria-autocomplete="list"
      />
      <button
        className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center text-muted transition hover:text-primary"
        type="button"
        aria-label={t('bookingForm.toggleCountryList')}
        onClick={() => onOpenChange(!isOpen)}
      >
        <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          id="country-listbox"
          className="country-options-scroll absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-64 overflow-y-auto rounded-lg border border-border bg-white py-2 shadow-[0_18px_35px_rgba(17,24,39,0.16)]"
          role="listbox"
        >
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <button
                key={country.code}
                className="flex w-full items-center gap-4 px-4 py-3 text-left text-sm font-semibold text-ink transition hover:bg-primary/5 hover:text-primary"
                type="button"
                role="option"
                aria-selected={value === country.name}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(country.displayName)
                  onOpenChange(false)
                }}
              >
                <span className="w-9 shrink-0 text-2xl leading-none">{countryFlag(country.code)}</span>
                <span>{country.displayName} - {country.iso3}</span>
              </button>
            ))
          ) : (
            <p className="px-4 py-4 text-sm font-semibold text-muted">{t('bookingForm.noCountries')}</p>
          )}
        </div>
      )}
    </div>
  )
}

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const { t } = useTranslation()

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink">{label} <span className="text-primary">*</span></p>
      <div className="flex h-12 items-center justify-between rounded-lg border border-border px-3">
        <button className="counter-btn" type="button" onClick={() => onChange(value - 1)} aria-label={t('common.decrease', { label })}>
          <FiMinus />
        </button>
        <span className="font-semibold text-ink">{value}</span>
        <button className="counter-btn" type="button" onClick={() => onChange(value + 1)} aria-label={t('common.increase', { label })}>
          <FiPlus />
        </button>
      </div>
    </div>
  )
}
