import { useEffect, useMemo, useState } from 'react'
import { FaCalendarDays, FaHouse, FaRegStar, FaUserGroup, FaXmark } from 'react-icons/fa6'
import { FiArrowRight, FiInfo, FiMinus, FiPlus } from 'react-icons/fi'
import type { Tour } from '../data/tours'

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
  duration: string
  accommodation: 'Budget' | 'Mid-range' | 'Luxury'
  budget: string
  notes: string
}

const initialForm: FormState = {
  fullName: '',
  email: '',
  phone: '+256 700 123 456',
  country: '',
  travelDate: '',
  flexible: 'Yes',
  adults: 2,
  children: 0,
  childrenAges: '',
  duration: '',
  accommodation: 'Mid-range',
  budget: '',
  notes: '',
}

export function BookingModal({ isOpen, tour, onClose }: BookingModalProps) {
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [sent, setSent] = useState(false)

  const selectedTour = useMemo(() => `Bucket list: ${tour?.title ?? 'Gorilla Tracking in Bwindi'}`, [tour])

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
    setSent(false)
  }

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {}
    ;(['fullName', 'email', 'phone', 'country', 'travelDate', 'duration', 'budget'] as const).forEach((field) => {
      if (!String(form[field]).trim()) nextErrors[field] = 'This field is required.'
    })
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) return
    const payload = { selectedTour, ...form }
    console.log('Booking request', payload)
    setSent(true)
    window.alert('Booking request sent successfully. We will contact you soon.')
    setForm(initialForm)
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-x-hidden bg-black/65 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6" onMouseDown={onClose}>
      <div
        className="max-h-[94vh] w-full max-w-[58rem] overflow-hidden rounded-[1.75rem] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="booking-modal-scroll max-h-[94vh] overflow-x-hidden overflow-y-auto p-5 pb-24 sm:p-6 sm:pb-8 md:p-8 lg:p-10">
          <div className="relative text-center">
            <button className="absolute right-0 top-0 text-2xl text-muted transition hover:text-primary" type="button" aria-label="Close modal" onClick={onClose}>
              <FaXmark />
            </button>
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-2xl text-primary">
              <FaCalendarDays />
            </div>
            <h2 id="booking-title" className="mt-3 text-3xl font-bold text-ink">Book This Tour</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Tell us about your trip and we'll get back to you with availability and pricing.
            </p>
          </div>

          <form className="mt-7 space-y-5" onSubmit={submit} noValidate>
            <Field label="Selected Tour">
              <input className="input" value={selectedTour} readOnly />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Full Name" required error={errors.fullName}>
                <input className="input" value={form.fullName} onChange={(event) => update('fullName', event.target.value)} placeholder="Enter your full name" />
              </Field>
              <Field label="Email Address" required error={errors.email}>
                <input className="input" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="Enter your email" />
              </Field>
              <Field label="Phone / WhatsApp" required error={errors.phone}>
                <input className="input" value={form.phone} onChange={(event) => update('phone', event.target.value)} />
              </Field>
              <Field label="Country of Residence" required error={errors.country}>
                <select className="input" value={form.country} onChange={(event) => update('country', event.target.value)}>
                  <option value="">Select your country</option>
                  <option>Uganda</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                  <option>Canada</option>
                </select>
              </Field>
              <Field label="Preferred Travel Date" required error={errors.travelDate}>
                <input className="input" type="date" value={form.travelDate} onChange={(event) => update('travelDate', event.target.value)} />
              </Field>
              <Field label="Are your dates flexible?">
                <div className="grid grid-cols-2 gap-2">
                  {(['Yes', 'No'] as const).map((value) => (
                    <button
                      key={value}
                      className={`segmented ${form.flexible === value ? 'segmented-active' : ''}`}
                      type="button"
                      onClick={() => update('flexible', value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-ink">Group Size</p>
              <div className="grid gap-5 md:grid-cols-3">
                <Counter label="Adults" value={form.adults} onChange={(value) => update('adults', Math.max(1, value))} />
                <Counter label="Children" value={form.children} onChange={(value) => update('children', Math.max(0, value))} />
                <Field label="Children's Ages">
                  <input className="input" value={form.childrenAges} onChange={(event) => update('childrenAges', event.target.value)} placeholder="e.g. 5, 8, 12" />
                </Field>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Number of Days / Preferred Duration" required error={errors.duration}>
                <select className="input" value={form.duration} onChange={(event) => update('duration', event.target.value)}>
                  <option value="">Select number of days</option>
                  <option>2 Days</option>
                  <option>3 Days</option>
                  <option>4 Days</option>
                  <option>5+ Days</option>
                </select>
              </Field>
              <Field label="Accommodation Preference" required>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Budget', icon: FaHouse },
                    { name: 'Mid-range', icon: FaUserGroup },
                    { name: 'Luxury', icon: FaRegStar },
                  ].map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      className={`rounded-lg border p-3 text-xs font-semibold transition hover:border-primary ${form.accommodation === name ? 'border-primary bg-primary/5 text-primary' : 'border-border text-ink'}`}
                      type="button"
                      onClick={() => update('accommodation', name)}
                    >
                      <Icon className="mx-auto mb-2 text-lg" />
                      {name}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Estimated Budget (Per Person)" required error={errors.budget}>
                <select className="input" value={form.budget} onChange={(event) => update('budget', event.target.value)}>
                  <option value="">Select budget range</option>
                  <option>$1,000 - $1,500</option>
                  <option>$1,500 - $2,500</option>
                  <option>$2,500 - $4,000</option>
                  <option>$4,000+</option>
                </select>
              </Field>
              <Field label="Special Requests / Notes">
                <textarea
                  className="input min-h-28 resize-none"
                  value={form.notes}
                  maxLength={500}
                  onChange={(event) => update('notes', event.target.value)}
                  placeholder="Any special requests or additional information..."
                />
                <p className="mt-1 text-right text-xs text-muted">{form.notes.length}/500</p>
              </Field>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 p-4 text-sm text-ink">
              <FiInfo className="mt-0.5 shrink-0 text-primary" />
              We'll contact you by email or WhatsApp to confirm availability.
            </div>
            {sent && <p className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-700">Booking request sent successfully. We will contact you soon.</p>}
            <div className="flex flex-col gap-3 pt-2">
              <button className="btn-primary justify-center" type="submit">Send Booking Request <FiArrowRight /></button>
              <button className="btn-outline justify-center" type="button" onClick={onClose}>Cancel</button>
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
  children: React.ReactNode
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <label className="block text-left text-sm font-semibold text-ink">
      {label} {required && <span className="text-primary">*</span>}
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  )
}

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink">{label} <span className="text-primary">*</span></p>
      <div className="flex h-12 items-center justify-between rounded-lg border border-border px-3">
        <button className="counter-btn" type="button" onClick={() => onChange(value - 1)} aria-label={`Decrease ${label}`}>
          <FiMinus />
        </button>
        <span className="font-semibold text-ink">{value}</span>
        <button className="counter-btn" type="button" onClick={() => onChange(value + 1)} aria-label={`Increase ${label}`}>
          <FiPlus />
        </button>
      </div>
    </div>
  )
}
