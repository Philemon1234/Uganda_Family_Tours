import { supabase } from '../lib/supabaseClient'
import { normalizeHeroSlider } from '../utils/heroSlider'

export async function getPublishedHeroSlider() {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('get_published_hero_slider')
  if (error) throw new Error('Unable to load the hero slider.')
  return data ? normalizeHeroSlider(data) : null
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
