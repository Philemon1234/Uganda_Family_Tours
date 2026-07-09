import nodemailer from 'nodemailer'

const ADMIN_EMAIL = 'safaris@ugandafamilytours.com'
const DEFAULT_FROM_EMAIL = 'Uganda Family Tours <safaris@ugandafamilytours.com>'
const DEFAULT_SMTP_HOST = 'mail.ugandafamilytours.com'
const DEFAULT_SMTP_PORT = 587
const DEFAULT_SMTP_USER = 'safaris@ugandafamilytours.com'

const corsHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

function clean(value) {
  return String(value ?? '').trim()
}

function getProcessEnvValue(name) {
  return typeof process !== 'undefined' ? process.env?.[name] : undefined
}

function getEnvValue(env, name) {
  return env?.[name] ?? getProcessEnvValue(name)
}

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders,
  })
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value))
}

function getSmtpConfig(env) {
  const host = getEnvValue(env, 'SMTP_HOST') || DEFAULT_SMTP_HOST
  const port = Number(getEnvValue(env, 'SMTP_PORT') || DEFAULT_SMTP_PORT)
  const user = getEnvValue(env, 'SMTP_USER') || getEnvValue(env, 'SMTP_USERNAME') || DEFAULT_SMTP_USER
  const pass = getEnvValue(env, 'SMTP_PASSWORD') || getEnvValue(env, 'SMTP_PASS')

  if (!host || !Number.isFinite(port) || !user || !pass) {
    throw new Error('SMTP credentials are not configured.')
  }

  return { host, port, user, pass }
}

function createTransport(env) {
  const smtp = getSmtpConfig(env)

  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    requireTLS: smtp.port === 587,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  })
}

function normalizePayload(payload) {
  const to = clean(payload?.to) || ADMIN_EMAIL
  const subject = clean(payload?.subject)
  const html = clean(payload?.html)

  if (subject && html) {
    return {
      to: ADMIN_EMAIL,
      subject,
      html,
      text: clean(payload?.text),
      replyTo: clean(payload?.replyTo),
    }
  }

  const name = clean(payload?.name)
  const email = clean(payload?.email)
  const message = clean(payload?.message)

  if (!name || !email || !message) {
    throw new Error('Please provide name, email, and message.')
  }

  if (!isValidEmail(email)) {
    throw new Error('Please provide a valid email address.')
  }

  return {
    to,
    subject: `New website message from ${name}`,
    replyTo: email,
    text: [
      'New website message',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      'Message:',
      message,
    ].join('\n'),
    html: `
      <div style="font-family:Arial, Helvetica, sans-serif; color:#111827; line-height:1.6;">
        <h1 style="margin:0 0 16px; color:#25424C;">New website message</h1>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <div style="white-space:pre-line;">${escapeHtml(message)}</div>
      </div>
    `,
  }
}

export async function onRequestOptions() {
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
    mail = normalizePayload(payload)
  } catch (error) {
    return jsonResponse(400, {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid email payload.',
    })
  }

  const recipients = ADMIN_EMAIL.split(',').map((email) => clean(email)).filter(Boolean)

  if (recipients.length === 0 || recipients.some((email) => !isValidEmail(email))) {
    return jsonResponse(400, { success: false, error: 'Please provide a valid recipient email address.' })
  }

  if (mail.replyTo && !isValidEmail(mail.replyTo)) {
    return jsonResponse(400, { success: false, error: 'Please provide a valid reply-to email address.' })
  }

  try {
    const transporter = createTransport(env)

    await transporter.sendMail({
      from: getEnvValue(env, 'SMTP_FROM_EMAIL') || getEnvValue(env, 'FROM_EMAIL') || DEFAULT_FROM_EMAIL,
      to: recipients,
      replyTo: mail.replyTo || undefined,
      subject: mail.subject,
      html: mail.html,
      text: mail.text || undefined,
    })

    return jsonResponse(200, { success: true })
  } catch (error) {
    console.error('Cloudflare Pages SMTP send failed:', {
      error: error instanceof Error ? error.message : String(error),
      recipients,
      smtpHost: getEnvValue(env, 'SMTP_HOST') || DEFAULT_SMTP_HOST,
      smtpPort: getEnvValue(env, 'SMTP_PORT') || String(DEFAULT_SMTP_PORT),
    })

    return jsonResponse(502, {
      success: false,
      error: error instanceof Error ? error.message : 'SMTP connection failed.',
    })
  }
}

export function onRequest() {
  return jsonResponse(405, { success: false, error: 'Method not allowed.' })
}
