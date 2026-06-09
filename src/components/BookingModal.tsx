import { useEffect, useMemo, useState } from 'react'
import { FaHouse, FaRegStar, FaUserGroup, FaXmark } from 'react-icons/fa6'
import { FiArrowLeft, FiArrowRight, FiCheck, FiChevronDown, FiMail, FiMinus, FiPhone, FiPlus } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import type { Tour } from '../data/tours'
import { countries, countryFlag } from '../data/countries'
import { useLocale } from '../context/LocaleContext'
import type { CurrencyCode } from '../utils/currency'
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

const phoneDisplay = '+256 703 543027'
const phoneHref = 'tel:+256703543027'
const emailDisplay = 'safaris@ugandafamilytours.com'
const emailHref = 'mailto:safaris@ugandafamilytours.com'

function currencyForCountryCode(countryCode?: string, fallback: CurrencyCode = 'USD') {
  if (!countryCode) return fallback
  if (euroCountryCodes.has(countryCode)) return 'EUR'
  return countryCurrencyOverrides[countryCode] ?? fallback
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
  const perPersonBudgetUSD = tour?.priceUSD ?? 1970
  const travelers = Math.max(1, Number(form.adults) + Number(form.children))
  const accommodationMultiplier = accommodationMultipliers[form.accommodation]
  const adjustedPerPersonBudgetUSD = perPersonBudgetUSD * accommodationMultiplier
  const estimatedPerPersonBudget = formatCurrencyIn(adjustedPerPersonBudgetUSD, selectedCurrency)
  const estimatedGroupBudget = formatCurrencyIn(adjustedPerPersonBudgetUSD * travelers, selectedCurrency)
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
    setErrors({})
    setStatus(null)
    setShowSuccess(false)
  }, [isOpen, tour?.slug])

  if (!isOpen) return null

  const update = (field: keyof FormState, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStatus(null)
  }

  const validateStep = (step = currentStep) => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {}

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

    setErrors((current) => ({ ...current, ...nextErrors }))
    return Object.keys(nextErrors).length === 0
  }

  const nextStep = () => {
    if (!validateStep(currentStep)) return
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1))
  }

  const previousStep = () => {
    setStatus(null)
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  const validateAll = () => {
    const isTripValid = validateStep(0)
    const isTravelersValid = validateStep(1)
    const isContactValid = validateStep(2)
    if (!isTripValid) setCurrentStep(0)
    else if (!isTravelersValid) setCurrentStep(1)
    else if (!isContactValid) setCurrentStep(2)
    return isTripValid && isTravelersValid && isContactValid
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateAll()) {
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
          baseBudgetPerPerson: formatCurrencyIn(perPersonBudgetUSD, selectedCurrency),
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
      setStatus(null)
      setShowSuccess(true)
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
    <div className="fixed inset-0 z-[100] h-dvh w-full overflow-hidden bg-dark text-white" role="dialog" aria-modal="true" aria-labelledby="booking-title">
      {showSuccess ? (
        <div className="grid h-full place-items-center px-5 text-center">
          <div className="mx-auto max-w-xl">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-primary/30 bg-primary text-4xl text-white shadow-[0_20px_60px_rgb(0_0_0_/_0.18)]">
              <FiCheck />
            </div>
            <h2 className="mt-7 text-3xl font-black leading-tight sm:text-4xl">{t('bookingForm.success')}</h2>
            <p className="mt-4 text-lg font-semibold leading-8 text-white/75">{t('bookingForm.info')}</p>
            <button className="btn-primary mt-8" type="button" onClick={onClose}>{t('common.close')}</button>
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col">
          <header className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-dark px-3 py-2 text-sm font-bold sm:px-8">
            <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-1">
              <a className="flex items-center gap-2 text-white transition hover:text-primary" href={phoneHref}><FiPhone className="text-primary" />{phoneDisplay}</a>
              <a className="flex min-w-0 items-center gap-2 text-white transition hover:text-primary" href={emailHref}><FiMail className="shrink-0 text-primary" /><span className="truncate">{emailDisplay}</span></a>
            </div>
            <button className="grid h-11 w-11 place-items-center rounded-full text-3xl text-white transition hover:bg-white/10" type="button" aria-label={t('common.close')} onClick={onClose}>
              <FaXmark />
            </button>
          </header>

          <div className="grid min-h-0 min-w-0 flex-1 overflow-hidden lg:grid-cols-[48%_52%]">
            <aside className="relative hidden min-h-0 overflow-hidden lg:block">
              {tourImage && <img className="absolute inset-0 h-full w-full object-cover" src={tourImage} alt={selectedTour} />}
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/25 to-black/15" />
              <div className="absolute inset-x-0 bottom-0 p-10">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">Uganda Family Tours</p>
                <h2 id="booking-title" className="mt-3 max-w-xl text-4xl font-semibold leading-tight">{selectedTour}</h2>
                <p className="mt-4 max-w-lg text-base leading-7 text-white/78">{t('bookingForm.subtitle')}</p>
              </div>
            </aside>

            <form className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-dark text-white" onSubmit={submit} noValidate>
              <div className="relative h-32 shrink-0 overflow-hidden sm:h-36 lg:hidden">
                {tourImage && <img className="h-full w-full object-cover" src={tourImage} alt={selectedTour} />}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/85 to-black/15" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Uganda Family Tours</p>
                  <h2 className="mt-1 text-xl font-semibold leading-tight">{selectedTour}</h2>
                </div>
              </div>

              <div className="shrink-0 px-4 pt-5 sm:px-8 lg:px-12 lg:pt-9">
                <ProgressIndicator currentStep={currentStep} steps={steps} />
              </div>

              <div className="booking-modal-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
                <div className="mx-auto max-w-4xl overflow-hidden">
                  <div className="flex transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform: `translateX(-${currentStep * 100}%)` }}>
                    <StepPanel>
                      <div className="grid gap-5 pt-4">
                        <Field label={t('bookingForm.selectedTour')}>
                          <input className="booking-input" value={selectedTour} readOnly />
                        </Field>
                        <div className="grid gap-5 md:grid-cols-2">
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
                    </StepPanel>

                    <StepPanel>
                      <div className="grid gap-6 pt-4">
                        <div className="grid gap-5 md:grid-cols-2">
                          <Counter label={t('bookingForm.adults')} value={form.adults} error={errors.adults} onChange={(value) => update('adults', Math.max(1, value))} />
                          <Counter label={t('bookingForm.children')} value={form.children} error={errors.children} onChange={(value) => update('children', Math.max(0, value))} />
                        </div>
                        {form.children > 0 && (
                          <Field label={t('bookingForm.childrenAges')} error={errors.childrenAges}>
                            <input className="booking-input" value={form.childrenAges} onChange={(event) => update('childrenAges', event.target.value)} placeholder={t('bookingForm.childrenAgesPlaceholder')} />
                          </Field>
                        )}
                        <Field label={t('bookingForm.accommodation')} required>
                          <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {[
                              { name: 'Budget', label: t('bookingForm.accommodationOptions.budget'), icon: FaHouse },
                              { name: 'Mid-range', label: t('bookingForm.accommodationOptions.midRange'), icon: FaUserGroup },
                              { name: 'Luxury', label: t('bookingForm.accommodationOptions.luxury'), icon: FaRegStar },
                            ].map(({ name, label, icon: Icon }) => (
                              <button key={name} className={`booking-accommodation ${form.accommodation === name ? 'booking-accommodation-active' : ''}`} type="button" onClick={() => update('accommodation', name)}>
                                <Icon className="mx-auto mb-2 text-xl" />{label}
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
                    </StepPanel>

                    <StepPanel>
                      <div className="grid gap-5 pt-4">
                        <div className="grid gap-5 md:grid-cols-2">
                          <Field label={t('bookingForm.fullName')} required error={errors.fullName}>
                            <input className="booking-input" value={form.fullName} onChange={(event) => update('fullName', event.target.value)} placeholder={t('bookingForm.fullNamePlaceholder')} />
                          </Field>
                          <Field label={t('bookingForm.email')} required error={errors.email}>
                            <input className="booking-input" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder={t('bookingForm.emailPlaceholder')} />
                          </Field>
                        </div>
                        <Field label={t('bookingForm.phone')} required error={errors.phone}>
                          <input className="booking-input" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder={t('inquiryForm.phonePlaceholder')} />
                        </Field>
                        <Field label={t('bookingForm.specialRequests')} error={errors.notes}>
                          <textarea className="booking-input min-h-28 resize-none" value={form.notes} maxLength={500} onChange={(event) => update('notes', event.target.value)} placeholder={t('bookingForm.notesPlaceholder')} />
                          <p className="mt-1 text-right text-xs text-white/60">{form.notes.length}/500</p>
                        </Field>
                        <SummaryCard
                          selectedTour={selectedTour}
                          form={form}
                          estimatedGroupBudget={estimatedGroupBudget}
                          estimatedPerPersonBudget={estimatedPerPersonBudget}
                          travelers={travelers}
                        />
                      </div>
                    </StepPanel>
                  </div>
                </div>

                {status && (
                  <p className={`mx-auto mt-5 max-w-4xl rounded-xl p-3 text-sm font-semibold ${
                    status.type === 'success'
                      ? 'bg-green-50 text-green-700'
                      : status.type === 'error'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-primary/20 text-primary'
                  }`}>
                    {status.message}
                  </p>
                )}
              </div>

              <footer className="shrink-0 border-t border-white/10 bg-dark px-4 py-3 sm:px-8 lg:px-12">
                <div className={`mx-auto flex max-w-4xl items-center gap-3 ${currentStep === 0 ? 'justify-end' : 'justify-between'}`}>
                  {currentStep > 0 && (
                    <button className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 py-3 text-sm font-black text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:px-5" type="button" onClick={previousStep} disabled={isSubmitting}>
                      <FiArrowLeft /> {t('toursPage.previousPage')}
                    </button>
                  )}
                  {currentStep < 2 ? (
                    <button className="btn-primary min-w-0 justify-center px-5 sm:min-w-36" type="button" onClick={nextStep}>
                      {t('toursPage.nextPage')} <FiArrowRight />
                    </button>
                  ) : (
                    <button className="btn-primary min-w-0 flex-1 justify-center px-4 disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-56 sm:flex-none" type="submit" disabled={isSubmitting}>
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
      <div className="relative mx-auto max-w-3xl">
        <div className="absolute left-0 right-0 top-5 h-px bg-white/35" />
        <div className="relative grid grid-cols-3 gap-3">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isComplete = index < currentStep

            return (
              <div key={step} className="flex flex-col items-center gap-2">
                <span className={`grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-black transition ${
                  isActive || isComplete
                    ? 'border-primary bg-primary text-white'
                    : 'border-white/70 bg-dark text-white/75'
                }`}>
                  {isComplete ? <FiCheck /> : index + 1}
                </span>
                <span className={`text-xs font-black uppercase tracking-[0.12em] ${isActive ? 'text-primary' : 'text-white/60'}`}>{step}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StepPanel({ children }: { children: React.ReactNode }) {
  return <div className="w-full shrink-0 px-0">{children}</div>
}

function Field({ label, required, error, className = '', children }: { label: string; required?: boolean; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`block text-left text-sm font-semibold text-white ${error ? 'field-error' : ''} ${className}`}>
      <span>
        {label} {required && <span className="text-primary">*</span>}
      </span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1 block text-xs font-semibold text-red-300">{error}</span>}
    </div>
  )
}

function Counter({ label, value, error, onChange }: { label: string; value: number; error?: string; onChange: (value: number) => void }) {
  const { t } = useTranslation()

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-white">{label} <span className="text-primary">*</span></p>
      <div className="flex h-[3.25rem] items-center justify-between rounded-xl border border-white/35 bg-white/10 px-3 text-white">
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
    <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">{t('bookingForm.budget')}</p>
      <p className="mt-2 text-4xl font-black text-white">{estimatedGroupBudget}</p>
      <p className="mt-2 text-sm font-semibold text-white/65">
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
  estimatedPerPersonBudget,
  travelers,
}: {
  selectedTour: string
  form: FormState
  estimatedGroupBudget: string
  estimatedPerPersonBudget: string
  travelers: number
}) {
  const { t } = useTranslation()
  const rows = [
    [t('bookingForm.selectedTour'), selectedTour],
    [t('bookingForm.travelDate'), form.travelDate || '-'],
    [t('bookingForm.flexibleDates'), form.flexible === 'Yes' ? t('common.yes') : t('common.no')],
    [t('bookingForm.country'), form.country || '-'],
    [t('bookingForm.adults'), String(form.adults)],
    [t('bookingForm.children'), String(form.children)],
    ...(form.childrenAges ? [[t('bookingForm.childrenAges'), form.childrenAges]] : []),
    [t('bookingForm.accommodation'), t(`bookingForm.accommodationOptions.${form.accommodation === 'Budget' ? 'budget' : form.accommodation === 'Luxury' ? 'luxury' : 'midRange'}`)],
    [t('bookingForm.budgetTotal'), estimatedGroupBudget],
    [t('bookingForm.budget'), estimatedPerPersonBudget],
    [travelers === 1 ? t('bookingForm.traveler') : t('bookingForm.travelers'), String(travelers)],
  ]

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">{t('bookingForm.title')}</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
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
