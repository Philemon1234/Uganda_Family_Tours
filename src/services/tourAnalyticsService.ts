import { supabase } from '../lib/supabaseClient'

export type TourAnalyticsEventType = 'view' | 'book_now' | 'inquiry' | 'booking_submitted'

const visitorStorageKey = 'uft_analytics_visitor_id'
const sessionStorageKey = 'uft_analytics_session_id'
const recentPageViews = new Map<string, number>()
const pageViewDedupeMs = 1500

function createUuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (character) =>
    (
      Number(character) ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(character) / 4)))
    ).toString(16),
  )
}

function readStoredUuid(storage: Storage, key: string) {
  const value = storage.getItem(key)
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null
}

function getOrCreateStoredUuid(storage: Storage, key: string) {
  const existingValue = readStoredUuid(storage, key)
  if (existingValue) return existingValue

  const nextValue = createUuid()
  storage.setItem(key, nextValue)
  return nextValue
}

export function getAnalyticsVisitorId() {
  try {
    return getOrCreateStoredUuid(window.localStorage, visitorStorageKey)
  } catch {
    return createUuid()
  }
}

function getAnalyticsSessionId() {
  try {
    return getOrCreateStoredUuid(window.sessionStorage, sessionStorageKey)
  } catch {
    return null
  }
}

export async function trackTourAnalyticsEvent(
  tourId: string | undefined,
  eventType: TourAnalyticsEventType,
) {
  if (!tourId || !supabase) return

  try {
    const { error } = await supabase.rpc('record_tour_analytics_event', {
      p_event_type: eventType,
      p_session_id: getAnalyticsSessionId(),
      p_tour_id: tourId,
      p_visitor_id: getAnalyticsVisitorId(),
    })

    if (error && import.meta.env.DEV) {
      console.warn('Tour analytics event was not recorded:', error.message)
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(
        'Tour analytics event failed:',
        error instanceof Error ? error.message : String(error),
      )
    }
  }
}

export function trackTourAnalyticsEventQuietly(
  tourId: string | undefined,
  eventType: TourAnalyticsEventType,
) {
  void trackTourAnalyticsEvent(tourId, eventType)
}


export function trackTourPageViewQuietly(tourId: string | undefined, pageKey: string) {
  if (!tourId) return

  const trackingKey = `${tourId}:${pageKey}`
  const now = Date.now()
  const lastTrackedAt = recentPageViews.get(trackingKey) ?? 0

  if (now - lastTrackedAt < pageViewDedupeMs) {
    return
  }

  recentPageViews.set(trackingKey, now)
  trackTourAnalyticsEventQuietly(tourId, 'view')
}
