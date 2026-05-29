import { useEffect, useState } from 'react'
import { FaEnvelope, FaPhone, FaRegUser, FaXmark } from 'react-icons/fa6'
import { FiArrowRight } from 'react-icons/fi'

type InquiryModalProps = {
  isOpen: boolean
  onClose: () => void
}

type InquiryForm = {
  fullName: string
  email: string
  phone: string
  message: string
}

const initialForm: InquiryForm = {
  fullName: '',
  email: '',
  phone: '',
  message: '',
}

export function InquiryModal({ isOpen, onClose }: InquiryModalProps) {
  const [form, setForm] = useState<InquiryForm>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryForm, string>>>({})
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const update = (field: keyof InquiryForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStatus(null)
  }

  const validate = () => {
    const nextErrors: Partial<Record<keyof InquiryForm, string>> = {}
    ;(['fullName', 'email', 'phone', 'message'] as const).forEach((field) => {
      if (!form[field].trim()) nextErrors[field] = 'This field is required.'
    })
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setStatus({ type: 'info', message: 'Sending your inquiry...' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'inquiry', ...form }),
      })
      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.message || 'The inquiry could not be sent right now.')
      }

      setForm(initialForm)
      setStatus({ type: 'success', message: 'Inquiry sent successfully. We will contact you soon.' })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'The inquiry could not be sent right now.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-x-hidden bg-black/65 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6" onMouseDown={onClose}>
      <div
        className="w-full max-w-[42rem] overflow-hidden rounded-[1.75rem] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="booking-modal-scroll max-h-[94vh] overflow-x-hidden overflow-y-auto p-5 sm:p-7 md:p-9">
          <div className="relative text-center">
            <button className="absolute right-0 top-0 grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-xl text-muted transition hover:bg-primary hover:text-white" type="button" aria-label="Close inquiry modal" onClick={onClose}>
              <FaXmark />
            </button>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-2xl text-primary">
              <FaEnvelope />
            </div>
            <h2 id="inquiry-title" className="mt-4 text-3xl font-bold text-ink">Make an Inquiry</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Tell us how we can help and our travel specialists will get back to you by email or WhatsApp.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Full Name" required error={errors.fullName}>
                <div className="relative">
                  <FaRegUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input className="input pl-11" value={form.fullName} onChange={(event) => update('fullName', event.target.value)} placeholder="Enter your full name" />
                </div>
              </Field>
              <Field label="Email Address" required error={errors.email}>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input className="input pl-11" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="Enter your email address" />
                </div>
              </Field>
            </div>

            <Field label="Phone / WhatsApp" required error={errors.phone}>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input className="input pl-11" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="Enter your phone number" />
              </div>
            </Field>

            <Field label="Message" required error={errors.message}>
              <textarea
                className="input min-h-32 resize-none"
                value={form.message}
                maxLength={500}
                onChange={(event) => update('message', event.target.value)}
                placeholder="Tell us more about your plans, interests or any special requests..."
              />
              <p className="mt-1 text-right text-xs text-muted">{form.message.length}/500</p>
            </Field>

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

            <button className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Inquiry'} <FiArrowRight />
            </button>
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
