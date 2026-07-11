import { connect } from 'cloudflare:sockets'

const ADMIN_EMAIL = 'safaris@ugandafamilytours.com'
const DEFAULT_FROM_EMAIL = 'Uganda Family Tours <safaris@ugandafamilytours.com>'
const DEFAULT_SMTP_HOST = 'mail.ugandafamilytours.com'
const DEFAULT_SMTP_PORT = 587
const DEFAULT_SMTP_USER = 'safaris@ugandafamilytours.com'
const SMTP_TIMEOUT_MS = 20000

const corsHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders,
  })
}

function clean(value) {
  return String(value ?? '').trim()
}

function envValue(env, name) {
  return env?.[name] ?? (typeof process !== 'undefined' ? process.env?.[name] : undefined)
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value))
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toNullable(value) {
  const valueText = clean(value)
  return valueText || null
}

function toNullableNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function base64(value) {
  if (typeof btoa === 'function') return btoa(value)
  return Buffer.from(value, 'utf8').toString('base64')
}

function extractEmailAddress(value) {
  const text = clean(value)
  const match = text.match(/<([^<>]+)>/)
  return clean(match?.[1] ?? text)
}

function foldHeader(value) {
  return clean(value).replace(/[\r\n]+/g, ' ')
}

function encodeAddressHeader(value) {
  const text = foldHeader(value)
  const address = extractEmailAddress(text)
  if (text.includes('<') && isValidEmail(address)) return text
  return address
}

function normalizeLineEndings(value) {
  return String(value ?? '').replace(/\r?\n/g, '\r\n')
}

function dotStuff(value) {
  return normalizeLineEndings(value).replace(/^\./gm, '..')
}

function getSmtpConfig(env) {
  const host = clean(envValue(env, 'SMTP_HOST')) || DEFAULT_SMTP_HOST
  const port = Number(envValue(env, 'SMTP_PORT') || DEFAULT_SMTP_PORT)
  const user = clean(envValue(env, 'SMTP_USER') || envValue(env, 'SMTP_USERNAME')) || DEFAULT_SMTP_USER
  const pass = clean(envValue(env, 'SMTP_PASSWORD') || envValue(env, 'SMTP_PASS'))
  const from = clean(envValue(env, 'SMTP_FROM_EMAIL') || envValue(env, 'FROM_EMAIL')) || DEFAULT_FROM_EMAIL

  if (!host || !Number.isFinite(port) || !user || !pass) {
    throw new Error('SMTP credentials are not configured.')
  }

  return { host, port, user, pass, from }
}

function validateAndBuildMail(payload) {
  const formType = clean(payload?.formType)
  const formData = payload?.formData ?? {}
  const subject = foldHeader(payload?.subject)
  const html = clean(payload?.html)
  const text = clean(payload?.text)
  const replyTo = clean(payload?.replyTo)

  if (formType !== 'inquiry' && formType !== 'booking') {
    throw new Error('Invalid form type.')
  }

  if (!subject || !html || !text) {
    throw new Error('Email content is missing.')
  }

  if (!isValidEmail(replyTo)) {
    throw new Error('Please provide a valid email address.')
  }

  if (formType === 'inquiry') {
    const fullName = clean(formData.fullName)
    const email = clean(formData.email).toLowerCase()
    const phone = clean(formData.phone)
    const message = clean(formData.message)

    if (!fullName || !email || !phone || !message) {
      throw new Error('Please complete every required field before sending.')
    }

    if (!isValidEmail(email)) {
      throw new Error('Please enter a valid email address.')
    }
  }

  if (formType === 'booking') {
    const required = [
      formData.selectedTour,
      formData.fullName,
      formData.email,
      formData.phone,
      formData.country,
      formData.travelDate,
      formData.budgetPerPerson,
      formData.estimatedGroupBudget,
    ]

    if (required.some((value) => !clean(value))) {
      throw new Error('Please complete every required field before sending.')
    }

    if (!isValidEmail(formData.email)) {
      throw new Error('Please enter a valid email address.')
    }

    const adults = Number(formData.adults)
    const children = Number(formData.children)
    if (!Number.isFinite(adults) || adults < 1 || !Number.isFinite(children) || children < 0) {
      throw new Error('Please enter a valid group size.')
    }
  }

  return {
    formType,
    formData,
    to: [ADMIN_EMAIL],
    replyTo,
    subject,
    html,
    text,
  }
}

function buildSubmission(mail) {
  const formData = mail.formData

  if (mail.formType === 'inquiry') {
    return {
      type: 'inquiry',
      status: 'new',
      full_name: clean(formData.fullName),
      email: clean(formData.email).toLowerCase(),
      phone: clean(formData.phone),
      message: clean(formData.message),
      raw_payload: formData,
    }
  }

  return {
    type: 'booking',
    status: 'new',
    tour_package_name: clean(formData.selectedTour),
    full_name: clean(formData.fullName),
    email: clean(formData.email).toLowerCase(),
    phone: clean(formData.phone),
    country: clean(formData.country),
    preferred_travel_date: clean(formData.travelDate),
    date_flexible: clean(formData.flexible).toLowerCase() === 'yes',
    adults: toNullableNumber(formData.adults),
    children: toNullableNumber(formData.children),
    children_ages: toNullable(formData.childrenAges),
    accommodation_preference: toNullable(formData.accommodation),
    estimated_budget: toNullable(formData.estimatedGroupBudget),
    budget_per_person: toNullable(formData.budgetPerPerson),
    estimated_group_budget: toNullable(formData.estimatedGroupBudget),
    currency: toNullable(formData.currency),
    travelers: toNullableNumber(Number(formData.adults ?? 0) + Number(formData.children ?? 0)),
    special_requests: toNullable(formData.notes),
    raw_payload: formData,
  }
}

async function saveFormSubmission(mail, env) {
  const supabaseUrl = clean(envValue(env, 'SUPABASE_URL') || envValue(env, 'VITE_SUPABASE_URL'))
  const supabaseKey = clean(
    envValue(env, 'SUPABASE_SERVICE_ROLE_KEY') ||
      envValue(env, 'SUPABASE_ANON_KEY') ||
      envValue(env, 'VITE_SUPABASE_ANON_KEY'),
  )

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Submission storage is not configured.')
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/form_submissions`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(buildSubmission(mail)),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || 'Submission could not be saved.')
  }
}

async function sendWithResend(mail, env) {
  const apiKey = clean(envValue(env, 'RESEND_API_KEY'))
  if (!apiKey) return false

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: clean(envValue(env, 'RESEND_FROM_EMAIL') || envValue(env, 'SMTP_FROM_EMAIL')) || DEFAULT_FROM_EMAIL,
      to: mail.to,
      reply_to: mail.replyTo,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || 'Resend email delivery failed.')
  }

  return true
}

async function readSmtpResponse(reader, decoder, bufferRef) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < SMTP_TIMEOUT_MS) {
    const finalLineMatch = bufferRef.value.match(/(?:^|\r?\n)(\d{3}) [^\r\n]*(?:\r?\n)$/)
    if (finalLineMatch) {
      const response = bufferRef.value
      bufferRef.value = ''
      const code = Number(finalLineMatch[1])
      return { code, response }
    }

    const { value, done } = await reader.read()
    if (done) throw new Error('SMTP connection closed unexpectedly.')
    bufferRef.value += decoder.decode(value, { stream: true })
  }

  throw new Error('SMTP server timed out.')
}

async function expectSmtp(reader, decoder, bufferRef, expectedCodes) {
  const result = await readSmtpResponse(reader, decoder, bufferRef)
  if (!expectedCodes.includes(result.code)) {
    throw new Error(`SMTP server rejected the request (${result.code}).`)
  }
  return result
}

async function writeSmtp(writer, command) {
  await writer.write(new TextEncoder().encode(`${command}\r\n`))
}

async function sendWithSmtp(mail, env) {
  const smtp = getSmtpConfig(env)
  const secureTransport = smtp.port === 465 ? 'on' : smtp.port === 587 ? 'starttls' : 'off'
  let socket = connect({ hostname: smtp.host, port: smtp.port }, { secureTransport })
  let reader = socket.readable.getReader()
  let writer = socket.writable.getWriter()
  const decoder = new TextDecoder()
  const bufferRef = { value: '' }

  try {
    await expectSmtp(reader, decoder, bufferRef, [220])
    await writeSmtp(writer, `EHLO ${smtp.host}`)
    await expectSmtp(reader, decoder, bufferRef, [250])

    if (secureTransport === 'starttls') {
      await writeSmtp(writer, 'STARTTLS')
      await expectSmtp(reader, decoder, bufferRef, [220])
      writer.releaseLock()
      reader.releaseLock()
      socket = socket.startTls()
      reader = socket.readable.getReader()
      writer = socket.writable.getWriter()
      bufferRef.value = ''
      await writeSmtp(writer, `EHLO ${smtp.host}`)
      await expectSmtp(reader, decoder, bufferRef, [250])
    }

    await writeSmtp(writer, 'AUTH LOGIN')
    await expectSmtp(reader, decoder, bufferRef, [334])
    await writeSmtp(writer, base64(smtp.user))
    await expectSmtp(reader, decoder, bufferRef, [334])
    await writeSmtp(writer, base64(smtp.pass))
    await expectSmtp(reader, decoder, bufferRef, [235])

    const envelopeFrom = extractEmailAddress(smtp.from) || smtp.user
    await writeSmtp(writer, `MAIL FROM:<${envelopeFrom}>`)
    await expectSmtp(reader, decoder, bufferRef, [250])

    for (const recipient of mail.to) {
      await writeSmtp(writer, `RCPT TO:<${recipient}>`)
      await expectSmtp(reader, decoder, bufferRef, [250, 251])
    }

    await writeSmtp(writer, 'DATA')
    await expectSmtp(reader, decoder, bufferRef, [354])

    const boundary = `uft-${crypto.randomUUID()}`
    const rawMessage = [
      `From: ${encodeAddressHeader(smtp.from)}`,
      `To: ${mail.to.join(', ')}`,
      `Reply-To: ${mail.replyTo}`,
      `Subject: ${mail.subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      mail.text,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      mail.html,
      '',
      `--${boundary}--`,
    ].join('\r\n')

    await writer.write(new TextEncoder().encode(`${dotStuff(rawMessage)}\r\n.\r\n`))
    await expectSmtp(reader, decoder, bufferRef, [250])
    await writeSmtp(writer, 'QUIT')
  } finally {
    try {
      writer.releaseLock()
      reader.releaseLock()
      socket.close()
    } catch {
      // The SMTP transaction is already complete or failed.
    }
  }
}

async function sendEmail(mail, env) {
  const sentWithResend = await sendWithResend(mail, env)
  if (sentWithResend) return
  await sendWithSmtp(mail, env)
}

export function onRequestOptions() {
  return jsonResponse(200, { success: true })
}

export async function onRequestPost({ request, env }) {
  let payload

  try {
    payload = await request.json()
  } catch {
    return jsonResponse(400, { success: false, error: 'Invalid JSON request body.' })
  }

  let mail

  try {
    mail = validateAndBuildMail(payload)
  } catch (error) {
    return jsonResponse(400, {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid form submission.',
    })
  }

  try {
    await saveFormSubmission(mail, env)
  } catch (error) {
    console.error('Form submission save failed:', error instanceof Error ? error.message : String(error))

    return jsonResponse(502, {
      success: false,
      saved: false,
      emailSent: false,
      error: error instanceof Error ? error.message : 'The submission could not be saved.',
    })
  }

  try {
    await sendEmail(mail, env)
  } catch (error) {
    console.error('Email delivery failed:', error instanceof Error ? error.message : String(error))

    return jsonResponse(502, {
      success: false,
      saved: true,
      emailSent: false,
      error: error instanceof Error ? error.message : 'Email delivery failed.',
    })
  }

  return jsonResponse(200, { success: true, saved: true, emailSent: true })
}

export function onRequest() {
  return jsonResponse(405, { success: false, error: 'Method not allowed.' })
}
