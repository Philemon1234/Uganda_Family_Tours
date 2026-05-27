const RECIPIENT_EMAIL = 'ntivuguruzwaphilemon0@gmail.com'
const DEFAULT_FROM_EMAIL = 'Uganda Family Tours <onboarding@resend.dev>'

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(payload))
}

function clean(value) {
  return String(value ?? '').trim()
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function readBody(request) {
  if (request.body && typeof request.body === 'object') return request.body
  if (typeof request.body === 'string') return JSON.parse(request.body)

  const chunks = []
  for await (const chunk of request) {
    chunks.push(chunk)
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

function detail(label, value) {
  return `
    <tr>
      <td style="padding:12px 14px; border-bottom:1px solid #fed7aa; color:#9a3412; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">${escapeHtml(label)}</td>
      <td style="padding:12px 14px; border-bottom:1px solid #fed7aa; color:#1f2937; font-size:15px;">${escapeHtml(value) || '&mdash;'}</td>
    </tr>
  `
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { message: 'Method not allowed.' })
  }

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    return sendJson(response, 500, { message: 'Email service is not configured.' })
  }

  let body

  try {
    body = await readBody(request)
  } catch {
    return sendJson(response, 400, { message: 'Invalid request body.' })
  }

  const selectedTour = clean(body?.selectedTour)
  const fullName = clean(body?.fullName)
  const email = clean(body?.email).toLowerCase()
  const phone = clean(body?.phone)
  const country = clean(body?.country)
  const travelDate = clean(body?.travelDate)
  const flexible = clean(body?.flexible)
  const adults = Number(body?.adults ?? 0)
  const children = Number(body?.children ?? 0)
  const childrenAges = clean(body?.childrenAges)
  const duration = clean(body?.duration)
  const accommodation = clean(body?.accommodation)
  const budget = clean(body?.budget)
  const notes = clean(body?.notes)

  if (!selectedTour || !fullName || !email || !phone || !country || !travelDate || !duration || !budget) {
    return sendJson(response, 400, { message: 'Please complete every required field before sending.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendJson(response, 400, { message: 'Please enter a valid email address.' })
  }

  if (!Number.isFinite(adults) || adults < 1 || !Number.isFinite(children) || children < 0) {
    return sendJson(response, 400, { message: 'Please enter a valid group size.' })
  }

  const submittedAt = new Date().toLocaleString('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Nairobi',
  })

  const subject = `New tour booking request from ${fullName}`
  const totalTravelers = adults + children
  const rows = [
    ['Selected Tour', selectedTour],
    ['Full Name', fullName],
    ['Email', email],
    ['Phone / WhatsApp', phone],
    ['Country', country],
    ['Preferred Date', travelDate],
    ['Dates Flexible', flexible || 'Not specified'],
    ['Adults', adults],
    ['Children', children],
    ["Children's Ages", childrenAges],
    ['Total Travelers', totalTravelers],
    ['Duration', duration],
    ['Accommodation', accommodation],
    ['Budget Per Person', budget],
    ['Submitted', submittedAt],
  ]

  const text = [
    'New Uganda Family Tours booking request',
    '',
    ...rows.map(([label, value]) => `${label}: ${value || 'Not provided'}`),
    '',
    'Special Requests / Notes:',
    notes || 'None',
  ].join('\n')

  const html = `
    <div style="margin:0; padding:32px 16px; background:#fff7ed; font-family:Arial, Helvetica, sans-serif; color:#111827;">
      <div style="max-width:720px; margin:0 auto; overflow:hidden; border:1px solid #fed7aa; border-radius:22px; background:#ffffff; box-shadow:0 18px 45px rgba(154, 52, 18, 0.10);">
        <div style="padding:30px; background:linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fdba74 100%); border-bottom:1px solid #fed7aa;">
          <div style="margin-bottom:12px; color:#c2410c; font-size:11px; font-weight:800; letter-spacing:0.16em; text-transform:uppercase;">Uganda Family Tours</div>
          <h1 style="margin:0; color:#111827; font-size:29px; line-height:1.2;">New tour booking request</h1>
          <p style="margin:12px 0 0; color:#7c2d12; font-size:15px; line-height:1.65;">${escapeHtml(fullName)} submitted a booking request for ${escapeHtml(selectedTour)}.</p>
        </div>

        <div style="padding:28px 30px 32px;">
          <table role="presentation" style="width:100%; border-collapse:collapse; overflow:hidden; border:1px solid #fed7aa; border-radius:16px; background:#fffaf5;">
            <tbody>
              ${rows.map(([label, value]) => detail(label, value)).join('')}
            </tbody>
          </table>

          <div style="margin-top:24px;">
            <div style="margin-bottom:8px; color:#9a3412; font-size:12px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase;">Special Requests / Notes</div>
            <div style="padding:18px 20px; border:1px solid #fed7aa; border-radius:18px; background:#fff7ed; color:#1f2937; font-size:15px; line-height:1.75;">
              ${notes ? escapeHtml(notes).replace(/\n/g, '<br>') : 'No additional notes provided.'}
            </div>
          </div>

          <p style="margin:22px 0 0; color:#6b7280; font-size:13px; line-height:1.6;">Reply directly to this email to contact the traveler at ${escapeHtml(email)}.</p>
        </div>
      </div>
    </div>
  `

  let resendResponse

  try {
    resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
        to: [RECIPIENT_EMAIL],
        reply_to: email,
        subject,
        html,
        text,
      }),
    })
  } catch {
    return sendJson(response, 502, {
      message: 'Could not reach the email service. Please check your connection and try again.',
    })
  }

  if (!resendResponse.ok) {
    const error = await resendResponse.json().catch(() => null)
    return sendJson(response, 502, {
      message: error?.message || 'The booking request could not be sent right now.',
    })
  }

  return sendJson(response, 200, { message: 'Booking request sent successfully.' })
}
