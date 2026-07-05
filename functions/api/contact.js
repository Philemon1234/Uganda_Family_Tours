const DEFAULT_RECIPIENT_EMAILS = ['ntivuguruzwaphilemon0@gmail.com']
const DEFAULT_FROM_EMAIL = 'Uganda Family Tours <onboarding@resend.dev>'

function sendJson(statusCode, payload) {
  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  })
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

function detail(label, value) {
  return `
    <tr>
      <td width="36%" style="padding:13px 18px; border-bottom:1px solid #e5e7eb; color:#f04405; font-size:13px; font-weight:600; letter-spacing:0.14em; line-height:1.35; text-transform:uppercase; vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:13px 18px; border-bottom:1px solid #e5e7eb; color:#111827; font-size:15px; line-height:1.45; vertical-align:top;">${escapeHtml(value) || '&mdash;'}</td>
    </tr>
  `
}

function getRecipientEmails(env) {
  const configured = env.CONTACT_RECIPIENT_EMAILS || env.RECIPIENT_EMAIL || env.RECIPIENT_EMAILS
  const recipients = configured
    ? configured.split(',').map((email) => clean(email)).filter(Boolean)
    : DEFAULT_RECIPIENT_EMAILS

  return recipients.length > 0 ? recipients : DEFAULT_RECIPIENT_EMAILS
}

function toNullable(value) {
  const cleaned = clean(value)
  return cleaned || null
}

function toNullableNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function toNullableUuid(value) {
  const cleaned = clean(value)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleaned)
    ? cleaned
    : null
}

async function saveFormSubmission(env, submission) {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL
  const supabaseKey =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_ANON_KEY

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
    body: JSON.stringify(submission),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    const message = error?.message || 'Submission could not be saved.'

    if (
      message.toLowerCase().includes('form_submissions') ||
      message.toLowerCase().includes('schema cache')
    ) {
      throw new Error(
        'We are finishing a quick update to our inquiry system. Please try again shortly or contact us by WhatsApp.',
      )
    }

    throw new Error(message)
  }
}

export async function onRequestPost({ request, env }) {
  const apiKey = env.RESEND_API_KEY

  if (!apiKey) {
    return sendJson(500, { message: 'Email service is not configured.' })
  }

  let body

  try {
    body = await request.json()
  } catch {
    return sendJson(400, { message: 'Invalid request body.' })
  }

  const formType = clean(body?.formType)

  if (formType === 'inquiry') {
    const fullName = clean(body?.fullName)
    const email = clean(body?.email).toLowerCase()
    const phone = clean(body?.phone)
    const message = clean(body?.message)

    if (!fullName || !email || !phone || !message) {
      return sendJson(400, { message: 'Please complete every required field before sending.' })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return sendJson(400, { message: 'Please enter a valid email address.' })
    }

    const submittedAt = new Date().toLocaleString('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Africa/Nairobi',
    })

    const rows = [
      ['Form type', 'General Inquiry'],
      ['Full name', fullName],
      ['Email address', email],
      ['Phone / WhatsApp', phone],
      ['Submitted', submittedAt],
    ]

    let saveWarning = null

    try {
      await saveFormSubmission(env, {
        type: 'inquiry',
        status: 'new',
        full_name: fullName,
        email,
        phone,
        message,
        raw_payload: body,
      })
    } catch (saveError) {
      saveWarning = saveError instanceof Error ? saveError.message : 'The inquiry could not be saved right now.'
      console.warn('Inquiry email will still be sent, but saving the submission failed:', saveWarning)
    }

    const text = [
      'New Inquiry from Uganda Family Tours Website',
      '',
      ...rows.map(([label, value]) => `${label}: ${value || 'Not provided'}`),
      '',
      'Message:',
      message,
    ].join('\n')

    const html = `
      <div style="margin:0; padding:32px 16px; background:#fff8ef; font-family:Arial, Helvetica, sans-serif; color:#111827;">
        <div style="max-width:760px; margin:0 auto; overflow:hidden; border:1px solid #fed7aa; border-radius:14px; background:#ffffff; box-shadow:0 18px 48px rgba(124, 45, 18, 0.12);">
          <div style="height:118px; padding:36px 44px 0; background:linear-gradient(135deg, #fd5e02 0%, #ff7a00 48%, #f04405 100%); color:#ffffff;">
            <div style="font-size:28px; line-height:1.1; font-weight:800; letter-spacing:0.14em;">UGANDA FAMILY TOURS</div>
          </div>
          <div style="padding:32px 44px 34px;">
            <h1 style="margin:0; color:#111827; font-size:36px; line-height:1.1; font-weight:800;">New website inquiry</h1>
            <p style="margin:12px 0 0; color:#4b5563; font-size:16px; line-height:1.65;">${escapeHtml(fullName)} submitted a general inquiry from the website.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; border:1px solid #fed7aa; border-radius:10px; background:#ffffff; border-collapse:separate; border-spacing:0; overflow:hidden;">
              <tbody>${rows.map(([label, value]) => detail(label, value)).join('')}</tbody>
            </table>
            <div style="margin-top:16px; padding:14px 22px; border:1px solid #fdba74; border-radius:10px; background:#ffffff;">
              <div style="color:#f04405; font-size:13px; font-weight:600; letter-spacing:0.14em; line-height:1.35; text-transform:uppercase;">Message</div>
              <div style="margin-top:8px; color:#111827; font-size:15px; line-height:1.7;">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
            </div>
            <p style="margin:20px 0 0; color:#6b7280; font-size:14px; line-height:1.6;">Reply directly to this email to contact the traveler at <a href="mailto:${escapeHtml(email)}" style="color:#2563eb;">${escapeHtml(email)}</a>.</p>
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
          from: env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
          to: getRecipientEmails(env),
          reply_to: email,
          subject: 'New Inquiry from Uganda Family Tours Website',
          html,
          text,
        }),
      })
    } catch {
      return sendJson(502, {
        message: 'Could not reach the email service. Please check your connection and try again.',
      })
    }

    if (!resendResponse.ok) {
      const error = await resendResponse.json().catch(() => null)
      return sendJson(502, {
        message: error?.message || 'The inquiry could not be sent right now.',
      })
    }

    return sendJson(200, { message: 'Inquiry sent successfully.', saved: !saveWarning })
  }

  const selectedTour = clean(body?.selectedTour)
  const packageId = toNullableUuid(body?.packageId)
  const fullName = clean(body?.fullName)
  const email = clean(body?.email).toLowerCase()
  const phone = clean(body?.phone)
  const country = clean(body?.country)
  const travelDate = clean(body?.travelDate)
  const flexible = clean(body?.flexible)
  const adults = Number(body?.adults ?? 0)
  const children = Number(body?.children ?? 0)
  const childrenAges = clean(body?.childrenAges)
  const accommodation = clean(body?.accommodation)
  const budgetPerPerson = clean(body?.budgetPerPerson)
  const estimatedGroupBudget = clean(body?.estimatedGroupBudget)
  const currency = clean(body?.currency)
  const notes = clean(body?.notes)

  if (!selectedTour || !fullName || !email || !phone || !country || !travelDate || !budgetPerPerson || !estimatedGroupBudget) {
    return sendJson(400, { message: 'Please complete every required field before sending.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendJson(400, { message: 'Please enter a valid email address.' })
  }

  if (!Number.isFinite(adults) || adults < 1 || !Number.isFinite(children) || children < 0) {
    return sendJson(400, { message: 'Please enter a valid group size.' })
  }

  const submittedAt = new Date().toLocaleString('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Nairobi',
  })

  const subject = `New tour booking request from ${fullName}`
  const totalTravelers = adults + children
  const rows = [
    ['Selected tour', selectedTour],
    ['Full name', fullName],
    ['Email', email],
    ['Phone / WhatsApp', phone],
    ['Country', country],
    ['Preferred date', travelDate],
    ['Dates flexible', flexible || 'Not specified'],
    ['Adults', adults],
    ['Children', children],
    ["Children's ages", childrenAges],
    ['Total travelers', totalTravelers],
    ['Accommodation', accommodation],
    ['Budget per person', budgetPerPerson],
    ['Estimated group budget', estimatedGroupBudget],
    ['Currency', currency],
    ['Submitted', submittedAt],
  ]

  let saveWarning = null

  try {
    await saveFormSubmission(env, {
      type: 'booking',
      status: 'new',
      package_id: packageId,
      tour_package_name: selectedTour,
      full_name: fullName,
      email,
      phone,
      country,
      preferred_travel_date: travelDate,
      date_flexible: flexible ? flexible.toLowerCase() === 'yes' : null,
      adults,
      children,
      children_ages: toNullable(childrenAges),
      accommodation_preference: toNullable(accommodation),
      estimated_budget: toNullable(estimatedGroupBudget),
      budget_per_person: toNullable(budgetPerPerson),
      estimated_group_budget: toNullable(estimatedGroupBudget),
      currency: toNullable(currency),
      travelers: toNullableNumber(totalTravelers),
      special_requests: toNullable(notes),
      raw_payload: body,
    })
  } catch (saveError) {
    saveWarning = saveError instanceof Error ? saveError.message : 'The booking request could not be saved right now.'
    console.warn('Booking email will still be sent, but saving the submission failed:', saveWarning)
  }

  const text = [
    'New Uganda Family Tours booking request',
    '',
    ...rows.map(([label, value]) => `${label}: ${value || 'Not provided'}`),
    '',
    'Special Requests / Notes:',
    notes || 'None',
  ].join('\n')

  const html = `
    <div style="margin:0; padding:32px 16px; background:#fff8ef; font-family:Arial, Helvetica, sans-serif; color:#111827;">
      <div style="max-width:900px; margin:0 auto; overflow:hidden; border:1px solid #fed7aa; border-radius:14px; background:#ffffff; box-shadow:0 18px 48px rgba(124, 45, 18, 0.12);">
        <div style="height:128px; padding:38px 50px 0; background:linear-gradient(135deg, #fd5e02 0%, #ff7a00 48%, #f04405 100%); color:#ffffff;">
          <div style="font-size:32px; line-height:1.1; font-weight:800; letter-spacing:0.16em;">UGANDA FAMILY TOURS</div>
        </div>

        <div style="padding:34px 48px 34px;">
          <h1 style="margin:0; color:#111827; font-size:42px; line-height:1.08; font-weight:800;">New tour booking request</h1>
          <p style="margin:14px 0 0; color:#4b5563; font-size:16px; line-height:1.65;">${escapeHtml(fullName)} submitted a booking request for ${escapeHtml(selectedTour)}.</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; border:1px solid #fed7aa; border-radius:10px; background:#ffffff; border-collapse:separate; border-spacing:0; overflow:hidden;">
            <tbody>
              ${rows.map(([label, value]) => detail(label, value)).join('')}
            </tbody>
          </table>

          <div style="margin-top:16px; padding:14px 22px; border:1px solid #fdba74; border-radius:10px; background:#ffffff;">
            <div style="color:#f04405; font-size:13px; font-weight:600; letter-spacing:0.14em; line-height:1.35; text-transform:uppercase;">Special requests / notes</div>
            <div style="margin-top:8px; color:#111827; font-size:15px; line-height:1.7;">${notes ? escapeHtml(notes).replace(/\n/g, '<br>') : 'No additional notes provided.'}</div>
          </div>

          <p style="margin:20px 0 0; color:#6b7280; font-size:14px; line-height:1.6;">Reply directly to this email to contact the traveler at <a href="mailto:${escapeHtml(email)}" style="color:#2563eb;">${escapeHtml(email)}</a>.</p>
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
        from: env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
        to: getRecipientEmails(env),
        reply_to: email,
        subject,
        html,
        text,
      }),
    })
  } catch {
    return sendJson(502, {
      message: 'Could not reach the email service. Please check your connection and try again.',
    })
  }

  if (!resendResponse.ok) {
    const error = await resendResponse.json().catch(() => null)
    return sendJson(502, {
      message: error?.message || 'The booking request could not be sent right now.',
    })
  }

  return sendJson(200, { message: 'Booking request sent successfully.', saved: !saveWarning })
}

export function onRequest() {
  return sendJson(405, { message: 'Method not allowed.' })
}
