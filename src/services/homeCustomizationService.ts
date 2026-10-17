import { supabase } from '../lib/supabaseClient'
import { mergeHomeCustomization } from './homeCustomizationDefaults'
import type { HomeCustomizationContent } from '../types/homeCustomization'

const PAGE_KEY = 'home'

export async function getPublishedHomepageCustomization(): Promise<HomeCustomizationContent> {
  if (!supabase) return mergeHomeCustomization(null)

  const { data, error } = await supabase
    .from('homepage_customizations')
    .select('published_content')
    .eq('page_key', PAGE_KEY)
    .maybeSingle()

  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') {
      return mergeHomeCustomization(null)
    }
    throw new Error(error.message)
  }

  return mergeHomeCustomization(data?.published_content as Partial<HomeCustomizationContent> | null)
}

export function subscribeToHomepageCustomizationChanges(onChange: () => void) {
  const client = supabase
  if (!client) return () => {}

  const channel = client
    .channel(`homepage-customization-${crypto.randomUUID()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'homepage_customizations', filter: `page_key=eq.${PAGE_KEY}` },
      onChange,
    )
    .subscribe()

  // Refresh only this configuration when Realtime is unavailable or a tab was
  // asleep. This also covers existing databases without this table published
  // through Realtime; it requires no schema or global cache changes.
  const refresh = () => { if (!document.hidden) onChange() }
  const interval = window.setInterval(refresh, 5000)
  window.addEventListener('focus', refresh)
  window.addEventListener('pageshow', refresh)
  document.addEventListener('visibilitychange', refresh)

  return () => {
    void client.removeChannel(channel)
    window.clearInterval(interval)
    window.removeEventListener('focus', refresh)
    window.removeEventListener('pageshow', refresh)
    document.removeEventListener('visibilitychange', refresh)
  }
}
