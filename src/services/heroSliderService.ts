import { supabase } from '../lib/supabaseClient'
import { normalizeHeroSlider } from '../utils/heroSlider'

const publishedCacheKey = 'uft:published-hero:v1'
const cacheLifetime = 30 * 60 * 1000
let latestRequest = 0

// Session storage survives refreshes but never contains drafts or demo slides.
export function getCachedPublishedHeroSlider() {
  if (typeof window === 'undefined') return null
  try {
    const cached = JSON.parse(window.sessionStorage.getItem(publishedCacheKey) || 'null')
    if (!cached || typeof cached.savedAt !== 'number' || Date.now() - cached.savedAt > cacheLifetime || cached.savedAt > Date.now()) return null
    return normalizeHeroSlider(cached.content)
  } catch { return null }
}

export async function getPublishedHeroSlider() {
  if (!supabase) return null
  const request = ++latestRequest
  const { data, error } = await supabase.rpc('get_published_hero_slider')
  if (error) throw new Error('Unable to load the hero slider.')
  const content = data ? normalizeHeroSlider(data) : null
  if (request !== latestRequest) return content
  try {
    if (content?.slides.some(slide => slide.is_active)) {
      window.sessionStorage.setItem(publishedCacheKey, JSON.stringify({ savedAt: Date.now(), content }))
    } else {
      window.sessionStorage.removeItem(publishedCacheKey)
    }
  } catch { /* Storage can be disabled; the published request still succeeds. */ }
  return content
}

export function subscribeToHeroSliderChanges(onChange: () => void) {
  if (!supabase) return () => {}
  const client = supabase
  // Settings are updated on every publish, including deletions and reorders.
  const channel = client.channel(`hero-slider-${crypto.randomUUID()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_settings', filter: 'stage=eq.published' }, onChange)
    .subscribe()
  return () => { void client.removeChannel(channel) }
}
