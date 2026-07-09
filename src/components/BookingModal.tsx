import { useEffect, useMemo, useState } from 'react'
import { FaHouse, FaRegStar, FaUserGroup, FaXmark } from 'react-icons/fa6'
import { FiArrowLeft, FiArrowRight, FiCheck, FiChevronDown, FiMinus, FiPlus } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import type { Tour } from '../data/tours'
import { countries, countryFlag } from '../data/countries'
import { useLocale } from '../context/LocaleContext'
import type { CurrencyCode } from '../utils/currency'
import { buildBookingEmail } from '../utils/contactEmailTemplates'
import { getLocalizedTourTitle } from '../utils/localizedTourContent'

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
const emailRequestTimeoutMs = 20000

async function postEmail(payload: unknown) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), emailRequestTimeoutMs)

  try {
    return await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } finally {
    window.clearTimeout(timeoutId)
  }
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
  SA: 'SAR',
  TZ: 'TZS',
  UG: 'UGX',
}

function currencyForCountryCode(countryCode?: string, fallback: CurrencyCode = 'USD') {
  if (!countryCode) return fallback
  if (euroCountryCodes.has(countryCode)) return 'EUR'
  return countryCurrencyOverrides[countryCode] ?? fallback
}

function getFixedAccommodationPreference(tier?: Tour['accommodationTier']): AccommodationPreference | null {
  if (tier === 'budget') return 'Budget'
  if (tier === 'mid_range') return 'Mid-range'
  if (tier === 'luxury') return 'Luxury'
  return null
}

export function BookingModal({ isOpen, tour, onClose }: BookingModalProps) {
  const { t, i18n } = useTranslation()
  const { currency, formatCurrencyIn, hasLiveExchangeRates } = useLocale()
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasAttemptedFinalSubmit, setHasAttemptedFinalSubmit] = useState(false)

  const selectedTour = useMemo(
    () => t('bookingForm.selectedTourValue', {
      tour: tour ? getLocalizedTourTitle(t, tour) : t('bookingForm.defaultTourName'),
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
  const requestedSelectedCurrency = currencyForCountryCode(selectedCountry?.code, currency)
  const selectedCurrency = hasLiveExchangeRates ? requestedSelectedCurrency : 'USD'
  const fixedAccommodationPreference = getFixedAccommodationPreference(tour?.accommodationTier)
  const isAccommodationFixed = fixedAccommodationPreference !== null
  const packagePriceUSD = typeof tour?.priceUSD === 'number' ? tour.priceUSD : null
  const hasPackagePrice = packagePriceUSD !== null
  const perPersonBudgetUSD = packagePriceUSD ?? 0
  const travelers = Math.max(1, Number(form.adults) + Number(form.children))
  const accommodationMultiplier = accommodationMultipliers[form.accommodation]
  const adjustedPerPersonBudgetUSD = perPersonBudgetUSD * accommodationMultiplier
  const estimatedPerPersonBudget = hasPackagePrice ? formatCurrencyIn(adjustedPerPersonBudgetUSD, selectedCurrency) : 'Custom quote'
  const estimatedGroupBudget = hasPackagePrice ? formatCurrencyIn(adjustedPerPersonBudgetUSD * travelers, selectedCurrency) : 'Custom quote'
  const accommodationStayLabelKey =
    form.accommodation === 'Budget'
      ? 'budget'
      : form.accommodation === 'Luxury'
        ? 'luxury'
        : 'midRange'
  const steps = [
    t('bookingForm.steps.trip', { defaultValue: 'Trip' }),
    t('bookingForm.steps.travelers', { defaultValue: 'Travelers' }),
    t('bookingForm.steps.contact', { defaultValue: 'Contact' }),
  ]
  const stepImages = [
    tour?.heroImage || tour?.image || tour?.galleryImages?.[0],
    tour?.galleryImages?.[1] || tour?.image || tour?.heroImage,
    tour?.galleryImages?.[2] || tour?.heroImage || tour?.image,
  ].filter(Boolean) as string[]
  const tourImage = stepImages[currentStep] ?? stepImages[0]

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

  useEffect(() => {
    if (!isOpen) return
    setCurrentStep(0)
    setForm((currentForm) => ({
      ...currentForm,
      accommodation: fixedAccommodationPreference ?? currentForm.accommodation,
    }))
    setErrors({})
    setStatus(null)
    setShowSuccess(false)
    setHasAttemptedFinalSubmit(false)
  }, [fixedAccommodationPreference, isOpen, tour?.slug, tour?.accommodationTier])

  if (!isOpen) return null

  const update = (field: keyof FormState, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStatus(null)
  }

  const updateAccommodation = (value: AccommodationPreference) => {
    if (fixedAccommodationPreference && value !== fixedAccommodationPreference) return
    update('accommodation', value)
  }

  const validateStep = (step = currentStep, updateErrors = true) => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {}
    const stepFields: (keyof FormState)[] =
      step === 0
        ? ['travelDate', 'country']
        : step === 1
          ? ['adults', 'children']
          : ['fullName', 'email', 'phone']

    if (step === 0) {
      if (!form.travelDate.trim()) nextErrors.travelDate = t('common.required')
      if (!form.country.trim()) nextErrors.country = t('common.required')
    }

    if (step === 1) {
      if (!Number.isFinite(form.adults) || form.adults < 1) nextErrors.adults = t('common.required')
      if (!Number.isFinite(form.children) || form.children < 0) nextErrors.children = t('common.required')
    }

    if (step === 2) {
      if (!form.fullName.trim()) nextErrors.fullName = t('common.required')
      if (!form.email.trim()) nextErrors.email = t('common.required')
      if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = t('common.validEmail')
      if (!form.phone.trim()) nextErrors.phone = t('common.required')
    }

    if (updateErrors) {
      setErrors((current) => {
        const updated = { ...current }
        stepFields.forEach((field) => {
          delete updated[field]
        })
        return { ...updated, ...nextErrors }
      })
    }

    return Object.keys(nextErrors).length === 0
  }

  const nextStep = () => {
    if (!validateStep(currentStep)) return
    if (currentStep === 1) {
      setHasAttemptedFinalSubmit(false)
      setStatus(null)
      setErrors((current) => {
        const updated = { ...current }
        ;(['fullName', 'email', 'phone'] as const).forEach((field) => {
          delete updated[field]
        })
        return updated
      })
    }
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1))
  }

  const previousStep = () => {
    setStatus(null)
    if (currentStep === 2) {
      setHasAttemptedFinalSubmit(false)
      setErrors((current) => {
        const updated = { ...current }
        ;(['fullName', 'email', 'phone'] as const).forEach((field) => {
          delete updated[field]
        })
        return updated
      })
    }
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  const validateAll = () => {
    const isTripValid = validateStep(0, false)
    const isTravelersValid = validateStep(1, false)
    const isContactValid = validateStep(2)
    if (!isTripValid) setCurrentStep(0)
    else if (!isTravelersValid) setCurrentStep(1)
    else if (!isContactValid) setCurrentStep(2)
    return isTripValid && isTravelersValid && isContactValid
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (currentStep < 2) {
      nextStep()
      return
    }

    setHasAttemptedFinalSubmit(true)
    if (!validateAll()) {
      setStatus(null)
      return
    }
    const payload = { selectedTour, ...form }
    setIsSubmitting(true)
    setStatus({ type: 'info', message: t('bookingForm.sending') })

    try {
      const response = await postEmail(buildBookingEmail({
          ...payload,
          budgetPerPerson: estimatedPerPersonBudget,
          estimatedGroupBudget,
          currency: selectedCurrency,
        }))
      const result = await response.json().catch(() => null)

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || result?.error || t('bookingForm.error'))
      }

      setForm(initialForm)
      setStatus(null)
      setShowSuccess(true)
      setHasAttemptedFinalSubmit(false)
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'AbortError'
        ? 'The email request timed out. Please try again, or contact us directly by WhatsApp.'
        : error instanceof Error
          ? error.message
          : t('bookingForm.error')

      setStatus({
        type: 'error',
        message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const visibleStatus = status?.message === t('bookingForm.requiredMissing') ? null : status

  return (
    <div className="booking-modal fixed inset-0 z-[100] h-dvh w-full overflow-hidden bg-dark text-white" role="dialog" aria-modal="true" aria-labelledby="booking-title">
      {showSuccess ? (
        <div className="grid h-full place-items-center px-5 text-center">
          <div className="mx-auto max-w-xl">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-primary/30 bg-primary text-4xl text-white shadow-[0_20px_60px_rgb(0_0_0_/_0.18)]">
              <FiCheck />
            </div>
            <h2 className="mt-7 text-3xl font-black leading-tight sm:text-4xl">Booking request sent successfully.</h2>
            <p className="mt-4 text-lg font-semibold leading-8 text-white/75">We will contact you soon.</p>
            <button className="btn-primary mt-8" type="button" onClick={onClose}>{t('common.close')}</button>
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col">
          <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex min-h-16 shrink-0 items-center justify-end gap-2 px-3 py-2 text-sm font-bold sm:px-8 lg:static lg:border-b lg:border-white/10 lg:bg-dark">
            <button className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full text-3xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition hover:bg-white/10" type="button" aria-label={t('common.close')} onClick={onClose}>
              <FaXmark />
            </button>
          </header>

          <div className="grid min-h-0 min-w-0 flex-1 overflow-hidden lg:grid-cols-[48%_52%]">
            <aside className="relative hidden min-h-0 overflow-hidden lg:block">
              {tourImage && <img className="absolute inset-0 h-full w-full object-cover" src={tourImage} alt={selectedTour} />}
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/25 to-black/15" />
              <div className="absolute inset-x-0 bottom-0 p-10">
                <h2 id="booking-title" className="max-w-xl text-4xl font-semibold leading-tight">{selectedTour}</h2>
                <p className="mt-4 max-w-lg text-base leading-7 text-white/78">{t('bookingForm.subtitle')}</p>
              </div>
            </aside>

            <form className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-dark text-white" onSubmit={submit} noValidate>
              <div className="relative h-32 shrink-0 overflow-hidden sm:h-36 lg:hidden">
                {tourImage && <img className="h-full w-full object-cover" src={tourImage} alt={selectedTour} />}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/85 to-black/15" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-xl font-semibold leading-tight">{selectedTour}</h2>
                </div>
              </div>

              <div className="shrink-0 px-4 pt-4 sm:px-8 lg:px-10 lg:pt-7">
                <ProgressIndicator currentStep={currentStep} steps={steps} />
              </div>

              <div className="booking-step-content min-h-0 flex-1 overflow-hidden px-4 py-3 sm:px-8 lg:px-10 lg:py-4">
                <div className="mx-auto w-full max-w-[48rem]">
                  {currentStep === 0 && (
                    <div className="grid gap-3 pt-1">
                      <Field label={t('bookingForm.selectedTour')}>
                        <input className="booking-input" value={selectedTour} readOnly />
                      </Field>
                      <div className="grid min-w-0 gap-3 md:grid-cols-2">
                        <Field label={t('bookingForm.travelDate')} required error={errors.travelDate}>
                          <input className="booking-input" type="date" value={form.travelDate} onChange={(event) => update('travelDate', event.target.value)} />
                        </Field>
                        <Field label={t('bookingForm.country')} required error={errors.country}>
                          <CountryPicker value={form.country} locale={i18n.language} onChange={(country) => update('country', country)} />
                        </Field>
                      </div>
                      <Field label={t('bookingForm.flexibleDates')}>
                        <div className="grid grid-cols-2 gap-3">
                          {(['Yes', 'No'] as const).map((value) => (
                            <button key={value} className={`booking-choice ${form.flexible === value ? 'booking-choice-active' : ''}`} type="button" onClick={() => update('flexible', value)}>
                              {value === 'Yes' ? t('common.yes') : t('common.no')}
                            </button>
                          ))}
                        </div>
                      </Field>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="grid gap-3 pt-1">
                      <div className="grid min-w-0 gap-3 md:grid-cols-2">
                        <Counter label={t('bookingForm.adults')} value={form.adults} error={errors.adults} onChange={(value) => update('adults', Math.max(1, value))} />
                        <Counter label={t('bookingForm.children')} value={form.children} error={errors.children} onChange={(value) => update('children', Math.max(0, value))} />
                      </div>
                      {form.children > 0 && (
                        <Field label={t('bookingForm.childrenAges')} error={errors.childrenAges}>
                          <input className="booking-input" value={form.childrenAges} onChange={(event) => update('childrenAges', event.target.value)} placeholder={t('bookingForm.childrenAgesPlaceholder')} />
                        </Field>
                      )}
                      <Field label={t('bookingForm.accommodation')} required>
                        <div className="grid min-w-0 grid-cols-3 gap-2">
                          {([
                            { name: 'Budget', label: t('bookingForm.accommodationOptions.budget'), icon: FaHouse },
                            { name: 'Mid-range', label: t('bookingForm.accommodationOptions.midRange'), icon: FaUserGroup },
                            { name: 'Luxury', label: t('bookingForm.accommodationOptions.luxury'), icon: FaRegStar },
                          ] as Array<{ name: AccommodationPreference; label: string; icon: typeof FaHouse }>).map(({ name, label, icon: Icon }) => (
                            <button
                              key={name}
                              className={`booking-accommodation ${form.accommodation === name ? 'booking-accommodation-active' : ''}`}
                              type="button"
                              onClick={() => updateAccommodation(name)}
                              disabled={isAccommodationFixed && name !== fixedAccommodationPreference}
                              aria-disabled={isAccommodationFixed && name !== fixedAccommodationPreference}
                              title={isAccommodationFixed && name !== fixedAccommodationPreference ? 'This package has a fixed accommodation preference.' : undefined}
                            >
                              <Icon className="mx-auto mb-1.5 text-base" />{label}
                            </button>
                          ))}
                        </div>
                      </Field>
                      <BudgetCard
                        estimatedGroupBudget={estimatedGroupBudget}
                        estimatedPerPersonBudget={estimatedPerPersonBudget}
                        travelers={travelers}
                        stay={t(`bookingForm.accommodationStay.${accommodationStayLabelKey}`)}
                      />
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="grid gap-2 pt-1">
                      <div className="grid min-w-0 gap-3 md:grid-cols-2">
                        <Field label={t('bookingForm.fullName')} required error={hasAttemptedFinalSubmit ? errors.fullName : undefined}>
                          <input className="booking-input" value={form.fullName} onChange={(event) => update('fullName', event.target.value)} placeholder={t('bookingForm.fullNamePlaceholder')} />
                        </Field>
                        <Field label={t('bookingForm.email')} required error={hasAttemptedFinalSubmit ? errors.email : undefined}>
                          <input className="booking-input" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder={t('bookingForm.emailPlaceholder')} />
                        </Field>
                      </div>
                      <Field label={t('bookingForm.phone')} required error={hasAttemptedFinalSubmit ? errors.phone : undefined}>
                        <input className="booking-input" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder={t('inquiryForm.phonePlaceholder')} />
                      </Field>
                      <Field label={t('bookingForm.specialRequests')} error={errors.notes}>
                        <textarea className="booking-input min-h-16 resize-none" value={form.notes} maxLength={500} onChange={(event) => update('notes', event.target.value)} placeholder={t('bookingForm.notesPlaceholder')} />
                        <p className="mt-1 text-right text-xs text-white/60">{form.notes.length}/500</p>
                      </Field>
                      <SummaryCard
                        selectedTour={selectedTour}
                        form={form}
                        estimatedGroupBudget={estimatedGroupBudget}
                        travelers={travelers}
                      />
                    </div>
                  )}
                </div>

                {visibleStatus && (
                  <p className={`mx-auto mt-5 max-w-4xl rounded-xl p-3 text-sm font-semibold ${
                    visibleStatus.type === 'success'
                      ? 'bg-green-50 text-green-700'
                      : visibleStatus.type === 'error'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-primary/20 text-primary'
                  }`}>
                    {visibleStatus.message}
                  </p>
                )}
              </div>

              <footer className="shrink-0 border-t border-white/10 bg-dark px-4 py-2.5 sm:px-8 lg:px-10">
                <div className={`mx-auto flex max-w-[48rem] items-center gap-3 ${currentStep === 0 ? 'justify-end' : 'justify-between'}`}>
                  {currentStep > 0 && (
                    <button className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 py-3 text-sm font-black text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:px-5" type="button" onClick={previousStep} disabled={isSubmitting}>
                      <FiArrowLeft /> {t('toursPage.previousPage')}
                    </button>
                  )}
                  {currentStep < 2 ? (
                    <button className="btn-primary min-w-0 justify-center px-5 py-3 sm:min-w-32" type="button" onClick={nextStep}>
                      {t('toursPage.nextPage')} <FiArrowRight />
                    </button>
                  ) : (
                    <button className="btn-primary min-w-0 flex-1 justify-center px-4 py-3 disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-52 sm:flex-none" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? t('common.sending') : t('bookingForm.submit')} <FiArrowRight />
                    </button>
                  )}
                </div>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ProgressIndicator({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <div>
      <div className="relative mx-auto max-w-[44rem]">
        <div className="absolute left-0 right-0 top-4 h-px bg-white/35" />
        <div className="relative grid grid-cols-3 gap-3">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isComplete = index < currentStep

            return (
              <div key={step} className="flex flex-col items-center gap-2">
                <span className={`grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-black transition ${
                  isActive || isComplete
                    ? 'border-primary bg-primary text-white'
                    : 'border-white/70 bg-dark text-white/75'
                }`}>
                  {isComplete ? <FiCheck /> : index + 1}
                </span>
                <span className={`text-[0.66rem] font-black uppercase tracking-[0.12em] ${isActive ? 'text-primary' : 'text-white/60'}`}>{step}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, error, className = '', children }: { label: string; required?: boolean; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`block min-w-0 text-left text-[0.82rem] font-semibold text-white ${error ? 'field-error' : ''} ${className}`}>
      <span>
        {label} {required && <span className="text-primary">*</span>}
      </span>
      <span className="mt-2 block">{children}</span>
    </div>
  )
}

function Counter({ label, value, error, onChange }: { label: string; value: number; error?: string; onChange: (value: number) => void }) {
  const { t } = useTranslation()

  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[0.82rem] font-semibold text-white">{label} <span className="text-primary">*</span></p>
      <div className="flex h-11 min-w-0 items-center justify-between rounded-xl border border-white/35 bg-white/10 px-2 text-white">
        <button className="counter-btn bg-white text-primary shadow-sm" type="button" onClick={() => onChange(value - 1)} aria-label={t('common.decrease', { label })}><FiMinus /></button>
        <span className="font-semibold">{value}</span>
        <button className="counter-btn bg-white text-primary shadow-sm" type="button" onClick={() => onChange(value + 1)} aria-label={t('common.increase', { label })}><FiPlus /></button>
      </div>
      {error && <span className="mt-1 block text-xs font-semibold text-red-300">{error}</span>}
    </div>
  )
}

function CountryPicker({ value, locale, onChange }: { value: string; locale: string; onChange: (country: string) => void }) {
  const { t } = useTranslation()
  const displayNames = useMemo(() => new Intl.DisplayNames([locale], { type: 'region' }), [locale])
  const countryOptions = useMemo(
    () => countries.map((country) => ({
      ...country,
      displayName: displayNames.of(country.code) ?? country.name,
    })),
    [displayNames],
  )
  const selected = countryOptions.find((country) => country.displayName === value || country.name === value)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false)
        }
      }}
    >
      <button
        className="booking-country-input text-left"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="booking-country-listbox"
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setIsOpen(false)
        }}
      >
        {selected ? (
          <>
            <span className="booking-country-flag">{countryFlag(selected.code)}</span>
            <span className="min-w-0 flex-1 truncate text-white">{selected.displayName}</span>
          </>
        ) : (
          <span className="min-w-0 flex-1 text-white/50">{t('bookingForm.selectCountry')}</span>
        )}
        <FiChevronDown className={`shrink-0 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div id="booking-country-listbox" className="booking-country-menu" role="listbox">
          {countryOptions.map((country) => (
            <button
              key={country.code}
              className={`booking-country-option ${country.displayName === value || country.name === value ? 'booking-country-option-active' : ''}`}
              type="button"
              role="option"
              aria-selected={country.displayName === value || country.name === value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(country.displayName)
                setIsOpen(false)
              }}
            >
              <span className="booking-country-flag">{countryFlag(country.code)}</span>
              <span className="min-w-0 truncate">{country.displayName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function BudgetCard({
  estimatedGroupBudget,
  estimatedPerPersonBudget,
  travelers,
  stay,
}: {
  estimatedGroupBudget: string
  estimatedPerPersonBudget: string
  travelers: number
  stay: string
}) {
  const { t } = useTranslation()

  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-3">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">{t('bookingForm.budget')}</p>
      <p className="mt-1.5 text-xl font-black leading-tight text-white sm:text-2xl">{estimatedGroupBudget}</p>
      <p className="mt-1.5 text-xs font-semibold leading-5 text-white/65">
        {t('bookingForm.budgetCalculation', {
          perPerson: estimatedPerPersonBudget,
          travelers,
          travelerLabel: travelers === 1 ? t('bookingForm.traveler') : t('bookingForm.travelers'),
          stay,
        })}
      </p>
    </div>
  )
}

function SummaryCard({
  selectedTour,
  form,
  estimatedGroupBudget,
  travelers,
}: {
  selectedTour: string
  form: FormState
  estimatedGroupBudget: string
  travelers: number
}) {
  const { t } = useTranslation()
  const rows = [
    [t('bookingForm.selectedTour'), selectedTour],
    [t('bookingForm.travelDate'), form.travelDate || '-'],
    [t('bookingForm.country'), form.country || '-'],
    [travelers === 1 ? t('bookingForm.traveler') : t('bookingForm.travelers'), String(travelers)],
    [t('bookingForm.accommodation'), t(`bookingForm.accommodationOptions.${form.accommodation === 'Budget' ? 'budget' : form.accommodation === 'Luxury' ? 'luxury' : 'midRange'}`)],
    [t('bookingForm.budgetTotal'), estimatedGroupBudget],
  ]

  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-3 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">{t('bookingForm.title')}</p>
      <dl className="mt-2 grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="font-bold text-white/55">{label}</dt>
            <dd className="mt-0.5 font-semibold text-white">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
