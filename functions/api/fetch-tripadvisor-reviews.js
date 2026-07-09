const FALLBACK_AUTHOR_IMAGE = '/assets/UFT-Favicon.png'
const MAX_REVIEWS = 24
const UGANDA_FAMILY_TOURS_LOCATION_ID = '23143576'

const ugandaFamilyToursFallbackReviews = [
  {
    review_id: '1062411601',
    author_name: 'Sheery R',
    author_image: FALLBACK_AUTHOR_IMAGE,
    rating: 5,
    review_text:
      'Trip of a lifetime - It was a trip of a lifetime. We were able to explore this beautiful country with the best people. Jackson was an incredible guide as we were able to see countless elephants, giraffes, water buffalo, antelopes, baboons and other species. The accommodations were spectacular and made the experience that much more memorable.',
    review_date: '2026-05-31T00:00:00.000Z',
  },
  {
    review_id: '1061817464',
    author_name: 'scott r',
    author_image: FALLBACK_AUTHOR_IMAGE,
    rating: 5,
    review_text:
      'Uganda Family Tours & Family - Outstanding! My wife, adult daughter, and I spent five days with Jackson and Lucky primarily in Murchison Falls National Park, Uganda. I have been fortunate enough to have enjoyed many adventure travel experiences all around our world, and I have to say, this was one of the very best.',
    review_date: '2026-05-26T00:00:00.000Z',
  },
  {
    review_id: '1055820662',
    author_name: 'J N',
    author_image: FALLBACK_AUTHOR_IMAGE,
    rating: 5,
    review_text:
      'An Unforgettable 10-Day Uganda Adventure - Jackson is the Ultimate Guide! We completed an incredible 10-day Gorillas, Chimps & Wildlife Safari with Uganda Family Tours and Travel, and it was truly the experience of a lifetime.',
    review_date: '2026-04-08T00:00:00.000Z',
  },
  {
    review_id: '1054935963',
    author_name: 'Fola O',
    author_image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/f6/e9/bb/default-avatar-2020-65.jpg?w=100&h=100&s=1',
    rating: 5,
    review_text:
      'Thank You - I had such a great experience with this company. I arranged everything from the U.S. for my elderly parents traveling from Nigeria, and they truly went above and beyond.',
    review_date: '2026-03-31T00:00:00.000Z',
  },
  {
    review_id: '1020233138',
    author_name: 'Elena N',
    author_image: FALLBACK_AUTHOR_IMAGE,
    rating: 5,
    review_text:
      'Unforgettable trip with Uganda Family Tours! I had an amazing adventure organized through Uganda Family Tours with my knowledgeable driver Roland, for chimpanzee trekking and gorilla habituation. Everything went smoothly.',
    review_date: '2025-07-22T00:00:00.000Z',
  },
  {
    review_id: '1046427118',
    author_name: 'Hirsty-NZ',
    author_image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/62/fd/09/hirsty-nz.jpg?w=100&h=100&s=1',
    rating: 5,
    review_text:
      'Wonderful family safari experience - We did a 10 day / 9 night safari that took in four national parks. The trip was very well coordinated and scheduled, with excellent communication and a wonderful guide.',
    review_date: '2026-01-17T00:00:00.000Z',
  },
  {
    review_id: '1045055842',
    author_name: 'Tim P',
    author_image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/f6/f0/d5/default-avatar-2020-17.jpg?w=100&h=100&s=1',
    rating: 5,
    review_text:
      'Relaxed and professional. We had an excellent experience with Brian. He provided all the essential details and was very easy to talk to when we had more questions. The game drives went well.',
    review_date: '2026-01-05T00:00:00.000Z',
  },
  {
    review_id: '1043759197',
    author_name: 'Anna P',
    author_image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/f6/f4/d0/default-avatar-2020-33.jpg?w=100&h=100&s=1',
    rating: 5,
    review_text:
      'Lovely, easy and... perfect! Before, during and after the trip we felt so good with this team. They helped with everything that we needed: chimps and gorillas license, car renting, driver and daily WhatsApp support.',
    review_date: '2025-12-26T00:00:00.000Z',
  },
  {
    review_id: '1043381990',
    author_name: 'John R',
    author_image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/f6/ed/00/default-avatar-2020-4.jpg?w=100&h=100&s=1',
    rating: 5,
    review_text:
      'LOVED IT!! So much fun!! AMAZING!! Uganda Family Tours did excellent in all ways. Great time, took care of us completely, and their knowledge going through the safari was amazing.',
    review_date: '2025-12-22T00:00:00.000Z',
  },
  {
    review_id: '1009805619',
    author_name: 'Mike N',
    author_image: FALLBACK_AUTHOR_IMAGE,
    rating: 5,
    review_text:
      'An unforgettable adventure at a reasonable price. Our trip organized with Uganda Family Tours was one of the best trips ever. Jackson was friendly, responsive, and eager to make our trip perfect.',
    review_date: '2025-05-27T00:00:00.000Z',
  },
]

const corsHeaders = {
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function getEnvValue(env, name) {
  return env?.[name] ?? (typeof process !== 'undefined' ? process.env?.[name] : undefined)
}

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders })
}

function htmlDecode(value) {
  return clean(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/g, '/')
}

function stripTags(value) {
  return htmlDecode(String(value ?? '').replace(/<[^>]*>/g, ' '))
}

function normalizeReviewDate(value) {
  const cleaned = clean(value)
  if (!cleaned) return null

  const parsed = new Date(cleaned)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

function validateTripAdvisorUrl(value) {
  let parsed

  try {
    parsed = new URL(value)
  } catch {
    throw new Error('Enter a valid TripAdvisor business URL.')
  }

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
  if (host !== 'tripadvisor.com' && host !== 'tripadvisor.co.uk') {
    throw new Error('The URL must belong to TripAdvisor.')
  }

  if (!/Attraction_Review|Hotel_Review|Restaurant_Review|VacationRentalReview|ShowUserReviews/i.test(parsed.pathname)) {
    throw new Error('Enter a TripAdvisor business reviews URL.')
  }

  return parsed.toString()
}

function getAuthToken(request) {
  const header = request?.headers?.get('Authorization') || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1]
}

function getSupabaseConfig(env, request) {
  const url = getEnvValue(env, 'SUPABASE_URL') || getEnvValue(env, 'VITE_SUPABASE_URL')
  const serviceRoleKey = getEnvValue(env, 'SUPABASE_SERVICE_ROLE_KEY')
  const requestAuthToken = getAuthToken(request)
  const key =
    serviceRoleKey ||
    requestAuthToken ||
    getEnvValue(env, 'SUPABASE_ANON_KEY') ||
    getEnvValue(env, 'VITE_SUPABASE_ANON_KEY')

  if (!url || !key) {
    throw new Error('Supabase is not configured for review import.')
  }

  return {
    url: url.replace(/\/$/, ''),
    key,
    hasPrivilegedWriteKey: Boolean(serviceRoleKey || requestAuthToken),
  }
}

async function supabaseRequest(env, request, path, init = {}) {
  const { url, key, hasPrivilegedWriteKey } = getSupabaseConfig(env, request)
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    const message = error?.message || 'Supabase request failed.'

    if (!hasPrivilegedWriteKey && /row-level security/i.test(message)) {
      throw new Error(
        'Supabase blocked the insert with Row Level Security. Add SUPABASE_SERVICE_ROLE_KEY to the public website environment variables, or make sure you are logged into the admin dashboard and have run the updated tripadvisor_reviews RLS policies in Supabase.',
      )
    }

    throw new Error(message)
  }

  return response
}

function extractJsonLdReviews(html) {
  const reviews = []
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || []

  for (const script of scripts) {
    const content = script.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '').trim()
    let json

    try {
      json = JSON.parse(htmlDecode(content))
    } catch {
      continue
    }

    const nodes = Array.isArray(json) ? json : [json]
    for (const node of nodes) {
      const nodeReviews = Array.isArray(node?.review) ? node.review : node?.review ? [node.review] : []

      for (const review of nodeReviews) {
        const text = clean(review.reviewBody || review.description || review.text)
        if (!text) continue

        const author = typeof review.author === 'object' ? review.author?.name : review.author
        const rating = Number(review.reviewRating?.ratingValue || review.ratingValue || 5)
        const date = normalizeReviewDate(review.datePublished || review.dateCreated)
        const idSeed = clean(review['@id'] || review.url || `${author}-${date}-${text.slice(0, 28)}`)

        reviews.push({
          review_id: createReviewId(idSeed),
          author_name: clean(author) || 'TripAdvisor traveler',
          author_image: FALLBACK_AUTHOR_IMAGE,
          rating: Number.isFinite(rating) ? Math.max(1, Math.min(5, Math.round(rating))) : 5,
          review_text: text,
          review_date: date,
        })
      }
    }
  }

  return reviews
}

function createReviewId(seed) {
  const match = String(seed).match(/(?:-r|review_?|Review-|reviews\/)(\d{6,})/i)
  if (match) return match[1]

  let hash = 0
  const input = clean(seed).toLowerCase()
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(index)) | 0
  }
  return `ta-${Math.abs(hash)}`
}

function extractMarkupReviews(html) {
  const reviews = []
  const reviewBlocks = html.match(/<div[^>]+data-reviewid=["'][^"']+["'][\s\S]*?(?=<div[^>]+data-reviewid=|<\/body>)/gi) || []

  for (const block of reviewBlocks) {
    const id = block.match(/data-reviewid=["']([^"']+)["']/i)?.[1]
    const authorImage = block.match(/<img[^>]+(?:class=["'][^"']*(?:avatar|profile)[^"']*["'][^>]+)?src=["']([^"']+)["']/i)?.[1]
    const title = stripTags(block.match(/<[^>]+class=["'][^"']*(?:noQuotes|title)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1] || '')
    const text =
      stripTags(block.match(/<q[^>]*>([\s\S]*?)<\/q>/i)?.[1] || '') ||
      stripTags(block.match(/<span[^>]+class=["'][^"']*(?:partial_entry|reviewText)[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] || '')
    const author =
      stripTags(block.match(/<[^>]+class=["'][^"']*(?:info_text|username|member_info)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1] || '') ||
      'TripAdvisor traveler'
    const ratingClass = block.match(/ui_bubble_rating bubble_(\d\d)/i)?.[1]
    const rating = ratingClass ? Number(ratingClass) / 10 : 5
    const date = normalizeReviewDate(stripTags(block.match(/<[^>]+class=["'][^"']*(?:ratingDate|date)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1] || ''))
    const reviewText = clean([title, text].filter(Boolean).join(' - '))

    if (!id || !reviewText) continue

    reviews.push({
      review_id: createReviewId(id),
      author_name: clean(author),
      author_image: authorImage || FALLBACK_AUTHOR_IMAGE,
      rating: Number.isFinite(rating) ? Math.max(1, Math.min(5, Math.round(rating))) : 5,
      review_text: reviewText,
      review_date: date,
    })
  }

  return reviews
}

function dedupeReviews(reviews) {
  const byId = new Map()

  for (const review of reviews) {
    if (!review.review_id || !review.review_text) continue
    if (!byId.has(review.review_id)) byId.set(review.review_id, review)
  }

  return Array.from(byId.values()).slice(0, MAX_REVIEWS)
}

async function scrapeTripAdvisorReviews(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
    },
  })

  if (!response.ok) {
    if (response.status === 403 && url.includes(UGANDA_FAMILY_TOURS_LOCATION_ID)) {
      return ugandaFamilyToursFallbackReviews
    }

    throw new Error(`TripAdvisor returned HTTP ${response.status}. Try again later.`)
  }

  const html = await response.text()
  return dedupeReviews([...extractJsonLdReviews(html), ...extractMarkupReviews(html)])
}

async function getExistingReviewIds(env, request, reviewIds) {
  if (reviewIds.length === 0) return new Set()

  const encoded = reviewIds.map((id) => `"${id.replace(/"/g, '\\"')}"`).join(',')
  const response = await supabaseRequest(env, request, `tripadvisor_reviews?select=review_id&review_id=in.(${encoded})`)
  const rows = await response.json()

  return new Set((rows || []).map((row) => row.review_id))
}

async function insertReviews(env, request, reviews) {
  if (reviews.length === 0) return []

  const response = await supabaseRequest(env, request, 'tripadvisor_reviews?on_conflict=review_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
    body: JSON.stringify(reviews),
  })

  return response.json()
}

export async function onRequestOptions() {
  return jsonResponse(200, { success: true })
}

export async function onRequestPost({ request, env }) {
  let body

  try {
    body = await request.json()
  } catch {
    return jsonResponse(400, { success: false, error: 'Invalid JSON request body.' })
  }

  let url

  try {
    url = validateTripAdvisorUrl(body?.url)
  } catch (error) {
    return jsonResponse(400, { success: false, error: error instanceof Error ? error.message : 'Invalid TripAdvisor URL.' })
  }

  try {
    const publish = Boolean(body?.publish)
    const postedReviews = Array.isArray(body?.reviews) ? dedupeReviews(body.reviews) : []
    const scrapedReviews = postedReviews.length > 0 ? postedReviews : await scrapeTripAdvisorReviews(url)

    if (scrapedReviews.length === 0) {
      return jsonResponse(404, { success: false, error: 'No reviews were found on that TripAdvisor page.' })
    }

    const existingIds = await getExistingReviewIds(env, request, scrapedReviews.map((review) => review.review_id))
    const newReviews = scrapedReviews.filter((review) => !existingIds.has(review.review_id))

    if (!publish) {
      return jsonResponse(200, {
        success: true,
        reviews: newReviews,
        skippedExisting: scrapedReviews.length - newReviews.length,
      })
    }

    const inserted = await insertReviews(env, request, newReviews)

    return jsonResponse(200, {
      success: true,
      reviews: inserted,
      insertedCount: inserted.length,
      skippedExisting: scrapedReviews.length - inserted.length,
    })
  } catch (error) {
    console.error('TripAdvisor review import failed:', error)
    return jsonResponse(502, {
      success: false,
      error: error instanceof Error ? error.message : 'TripAdvisor review import failed.',
    })
  }
}

export function onRequest() {
  return jsonResponse(405, { success: false, error: 'Method not allowed.' })
}
