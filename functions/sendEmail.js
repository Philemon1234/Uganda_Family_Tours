import nodemailer from 'nodemailer'

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

function getDefaultEnv() {
  return typeof process !== 'undefined' ? process.env : {}
}

function getEnvValue(env, name) {
  return env?.[name] ?? getProcessEnvValue(name)
}

function sendJson(statusCode, payload) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(payload),
  }
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value))
}

function getSmtpConfig(env) {
  const host = getEnvValue(env, 'SMTP_HOST') || DEFAULT_SMTP_HOST
  const port = Number(getEnvValue(env, 'SMTP_PORT') || DEFAULT_SMTP_PORT)
  const user = getEnvValue(env, 'SMTP_USER') || getEnvValue(env, 'SMTP_USERNAME') || DEFAULT_SMTP_USER
  const pass = getEnvValue(env, 'SMTP_PASSWORD') || getEnvValue(env, 'SMTP_PASS')

  if (!host || !Number.isFinite(port) || !user || !pass) {
    throw new Error('SMTP email service is not configured.')
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

export async function sendEmailMessage(payload, env = getDefaultEnv()) {
  const to = clean(payload?.to)
  const subject = clean(payload?.subject)
  const html = clean(payload?.html)
  const text = clean(payload?.text)
  const replyTo = clean(payload?.replyTo)

  if (!to || !subject || !html) {
    return {
      ok: false,
      statusCode: 400,
      message: 'Please provide to, subject, and html.',
    }
  }

  const recipients = to.split(',').map((email) => clean(email)).filter(Boolean)

  if (recipients.length === 0 || recipients.some((email) => !validateEmail(email))) {
    return {
      ok: false,
      statusCode: 400,
      message: 'Please provide a valid recipient email address.',
    }
  }

  if (replyTo && !validateEmail(replyTo)) {
    return {
      ok: false,
      statusCode: 400,
      message: 'Please provide a valid reply-to email address.',
    }
  }

  try {
    const transporter = createTransport(env)

    await transporter.sendMail({
      from: getEnvValue(env, 'SMTP_FROM_EMAIL') || getEnvValue(env, 'FROM_EMAIL') || DEFAULT_FROM_EMAIL,
      to: recipients,
      replyTo: replyTo || undefined,
      subject,
      html,
      text: text || undefined,
    })

    return {
      ok: true,
      statusCode: 200,
      message: 'Email sent successfully.',
    }
  } catch (error) {
    console.error('SMTP email send failed:', {
      message: error instanceof Error ? error.message : String(error),
      recipients,
      smtpHost: getEnvValue(env, 'SMTP_HOST') || DEFAULT_SMTP_HOST,
      smtpPort: getEnvValue(env, 'SMTP_PORT') || String(DEFAULT_SMTP_PORT),
    })

    return {
      ok: false,
      statusCode: 502,
      message: 'SMTP connection failed.',
    }
  }
}

export async function handleSendEmailRequest({ method, body, env }) {
  if (method === 'OPTIONS') {
    return sendJson(200, { success: true, message: 'OK' })
  }

  if (method !== 'POST') {
    return sendJson(405, { success: false, message: 'Method not allowed.' })
  }

  let payload

  try {
    payload = typeof body === 'string' ? JSON.parse(body || '{}') : body
  } catch {
    return sendJson(400, { success: false, message: 'Invalid JSON request body.' })
  }

  const result = await sendEmailMessage(payload, env)

  return sendJson(result.statusCode, {
    success: result.ok,
    message: result.message,
  })
}

export async function handler(event) {
  return handleSendEmailRequest({
    method: event.httpMethod,
    body: event.body || '{}',
    env: getDefaultEnv(),
  })
}

export async function onRequest({ request, env }) {
  return toWebResponse(await handleSendEmailRequest({
    method: request.method,
    body: request.method === 'OPTIONS' ? '{}' : await request.text(),
    env,
  }))
}

function toWebResponse(result) {
  return new Response(result.body, {
    status: result.statusCode,
    headers: result.headers,
  })
}
