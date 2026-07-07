const ADMIN_EMAIL = 'safaris@ugandafamilytours.com'

type EmailPayload = {
  to: string
  subject: string
  html: string
  text: string
  replyTo: string
}

type InquiryEmailInput = {
  fullName: string
  email: string
  phone: string
  message: string
}

type BookingEmailInput = {
  selectedTour: string
  fullName: string
  email: string
  phone: string
  country: string
  travelDate: string
  flexible: string
  adults: number
  children: number
  childrenAges: string
  accommodation: string
  budgetPerPerson: string
  estimatedGroupBudget: string
  currency: string
  notes: string
}

function clean(value: unknown) {
  return String(value ?? '').trim()
}

function escapeHtml(value: unknown) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function submittedAt() {
  return new Date().toLocaleString('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Nairobi',
  })
}

function detail(label: string, value: unknown) {
  return `
    <tr>
      <td width="36%" style="padding:13px 18px; border-bottom:1px solid #e5e7eb; color:#f04405; font-size:13px; font-weight:600; letter-spacing:0.14em; line-height:1.35; text-transform:uppercase; vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:13px 18px; border-bottom:1px solid #e5e7eb; color:#111827; font-size:15px; line-height:1.45; vertical-align:top;">${escapeHtml(value) || '&mdash;'}</td>
    </tr>
  `
}

function emailShell(title: string, intro: string, rows: Array<[string, unknown]>, messageLabel: string, message: string) {
  return `
    <div style="margin:0; padding:32px 16px; background:#fff8ef; font-family:Arial, Helvetica, sans-serif; color:#111827;">
      <div style="max-width:900px; margin:0 auto; overflow:hidden; border:1px solid #fed7aa; border-radius:14px; background:#ffffff; box-shadow:0 18px 48px rgba(124, 45, 18, 0.12);">
        <div style="height:128px; padding:38px 50px 0; background:linear-gradient(135deg, #fd5e02 0%, #ff7a00 48%, #f04405 100%); color:#ffffff;">
          <div style="font-size:32px; line-height:1.1; font-weight:800; letter-spacing:0.16em;">UGANDA FAMILY TOURS</div>
        </div>
        <div style="padding:34px 48px 34px;">
          <h1 style="margin:0; color:#111827; font-size:42px; line-height:1.08; font-weight:800;">${escapeHtml(title)}</h1>
          <p style="margin:14px 0 0; color:#4b5563; font-size:16px; line-height:1.65;">${escapeHtml(intro)}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; border:1px solid #fed7aa; border-radius:10px; background:#ffffff; border-collapse:separate; border-spacing:0; overflow:hidden;">
            <tbody>${rows.map(([label, value]) => detail(label, value)).join('')}</tbody>
          </table>
          <div style="margin-top:16px; padding:14px 22px; border:1px solid #fdba74; border-radius:10px; background:#ffffff;">
            <div style="color:#f04405; font-size:13px; font-weight:600; letter-spacing:0.14em; line-height:1.35; text-transform:uppercase;">${escapeHtml(messageLabel)}</div>
            <div style="margin-top:8px; color:#111827; font-size:15px; line-height:1.7;">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
          </div>
        </div>
      </div>
    </div>
  `
}

export function buildInquiryEmail(input: InquiryEmailInput): EmailPayload {
  const rows: Array<[string, unknown]> = [
    ['Form type', 'General Inquiry'],
    ['Full name', input.fullName],
    ['Email address', input.email],
    ['Phone / WhatsApp', input.phone],
    ['Submitted', submittedAt()],
  ]

  return {
    to: ADMIN_EMAIL,
    replyTo: input.email,
    subject: 'New Inquiry from Uganda Family Tours Website',
    text: [
      'New Inquiry from Uganda Family Tours Website',
      '',
      ...rows.map(([label, value]) => `${label}: ${value || 'Not provided'}`),
      '',
      'Message:',
      input.message,
    ].join('\n'),
    html: emailShell(
      'New website inquiry',
      `${input.fullName} submitted a general inquiry from the website.`,
      rows,
      'Message',
      input.message,
    ),
  }
}

export function buildBookingEmail(input: BookingEmailInput): EmailPayload {
  const totalTravelers = Number(input.adults) + Number(input.children)
  const rows: Array<[string, unknown]> = [
    ['Selected tour', input.selectedTour],
    ['Full name', input.fullName],
    ['Email', input.email],
    ['Phone / WhatsApp', input.phone],
    ['Country', input.country],
    ['Preferred date', input.travelDate],
    ['Dates flexible', input.flexible || 'Not specified'],
    ['Adults', input.adults],
    ['Children', input.children],
    ["Children's ages", input.childrenAges],
    ['Total travelers', totalTravelers],
    ['Accommodation', input.accommodation],
    ['Budget per person', input.budgetPerPerson],
    ['Estimated group budget', input.estimatedGroupBudget],
    ['Currency', input.currency],
    ['Submitted', submittedAt()],
  ]

  return {
    to: ADMIN_EMAIL,
    replyTo: input.email,
    subject: `New tour booking request from ${input.fullName}`,
    text: [
      'New Uganda Family Tours booking request',
      '',
      ...rows.map(([label, value]) => `${label}: ${value || 'Not provided'}`),
      '',
      'Special Requests / Notes:',
      input.notes || 'None',
    ].join('\n'),
    html: emailShell(
      'New tour booking request',
      `${input.fullName} submitted a booking request for ${input.selectedTour}.`,
      rows,
      'Special requests / notes',
      input.notes || 'No additional notes provided.',
    ),
  }
}
