import { supabase } from '../lib/supabaseClient'
import type {
  TourGalleryImage,
  TourHighlight,
  TourItineraryActivity,
  TourItineraryDay,
  TourItineraryImage,
  TourPackage,
  TourPackageDetails,
  TourPackageLocation,
} from '../types/tourPackage'

const TOUR_PACKAGE_SELECT =
  'id,title,slug,category,duration_days,price_from_usd,accommodation_tier,short_description,overview,main_image_url,hero_image_url,map_style,status,display_order,created_at,updated_at'
const TOUR_PACKAGE_SELECT_FALLBACK =
  'id,title,slug,category,duration_days,price_from_usd,short_description,overview,main_image_url,hero_image_url,status,created_at,updated_at'

function withDefaultPackageFields(
  packages: Array<Omit<TourPackage, 'map_style' | 'accommodation_tier'> & Partial<Pick<TourPackage, 'map_style' | 'accommodation_tier'>>>,
): TourPackage[] {
  return packages.map((tourPackage) => ({
    ...tourPackage,
    accommodation_tier: tourPackage.accommodation_tier ?? 'standard',
    map_style: tourPackage.map_style ?? 'light',
  }))
}

function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.',
    )
  }

  return supabase
}

type PublishedTourPackageOptions = {
  limit?: number
}

function isMissingOptionalTourPackageColumn(message: string) {
  return message.includes('map_style') || message.includes('display_order') || message.includes('accommodation_tier')
}

export async function getPublishedTourPackages(
  options: PublishedTourPackageOptions = {},
): Promise<TourPackage[]> {
  let query = getSupabaseClient()
    .from('tour_packages')
    .select(TOUR_PACKAGE_SELECT)
    .eq('status', 'published')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    if (isMissingOptionalTourPackageColumn(error.message)) {
      let fallbackQuery = getSupabaseClient()
        .from('tour_packages')
        .select(TOUR_PACKAGE_SELECT_FALLBACK)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (options.limit) {
        fallbackQuery = fallbackQuery.limit(options.limit)
      }

      const fallbackResult = await fallbackQuery

      if (fallbackResult.error) {
        throw new Error(fallbackResult.error.message)
      }

      return withDefaultPackageFields(
        ((fallbackResult.data ?? []) as Omit<TourPackage, 'map_style' | 'display_order'>[]).map(
          (tourPackage, index) => ({
            ...tourPackage,
            display_order: index + 1,
          }),
        ),
      )
    }

    throw new Error(error.message)
  }

  return data ?? []
}

export function subscribeToTourPackageChanges(onChange: () => void) {
  const client = supabase

  if (!client) {
    return () => {}
  }

  const channel = client
    .channel(`public-tour-packages-${crypto.randomUUID()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tour_packages' },
      onChange,
    )
    .subscribe()

  return () => {
    void client.removeChannel(channel)
  }
}

export async function getPublishedTourPackageBySlug(
  slug: string,
): Promise<TourPackage | null> {
  const { data, error } = await getSupabaseClient()
    .from('tour_packages')
    .select(TOUR_PACKAGE_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    if (isMissingOptionalTourPackageColumn(error.message)) {
      const fallbackResult = await getSupabaseClient()
        .from('tour_packages')
        .select(TOUR_PACKAGE_SELECT_FALLBACK)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()

      if (fallbackResult.error) {
        throw new Error(fallbackResult.error.message)
      }

      return fallbackResult.data
        ? withDefaultPackageFields([{
            ...(fallbackResult.data as Omit<TourPackage, 'map_style' | 'display_order' | 'accommodation_tier'>),
            display_order: 0,
          }])[0]
        : null
    }

    throw new Error(error.message)
  }

  return data
}

export async function getTourPackageBySlug(slug: string) {
  return getPublishedTourPackageBySlug(slug)
}

export async function getTourPackageDetailsBySlug(
  slug: string,
): Promise<TourPackageDetails | null> {
  const tourPackage = await getPublishedTourPackageBySlug(slug)

  if (!tourPackage) {
    return null
  }

  const client = getSupabaseClient()
  const [highlightsResult, galleryResult, daysResult] = await Promise.all([
    client
      .from('tour_highlights')
      .select('id,package_id,title,description,sort_order,created_at')
      .eq('package_id', tourPackage.id)
      .order('sort_order', { ascending: true }),
    client
      .from('tour_gallery_images')
      .select('id,package_id,image_url,alt_text,caption,sort_order,created_at')
      .eq('package_id', tourPackage.id)
      .order('sort_order', { ascending: true })
      .limit(4),
    client
      .from('tour_itinerary_days')
      .select('id,package_id,day_number,title,overview,accommodation_name,sort_order,created_at,updated_at')
      .eq('package_id', tourPackage.id)
      .order('sort_order', { ascending: true })
      .order('day_number', { ascending: true }),
  ])

  if (highlightsResult.error) throw new Error(highlightsResult.error.message)
  if (galleryResult.error) throw new Error(galleryResult.error.message)
  if (daysResult.error) throw new Error(daysResult.error.message)

  let locations: TourPackageLocation[] = []
  const locationsResult = await client
    .from('package_locations')
    .select('id,package_id,location_name,latitude,longitude,notes,image_url,pin_color,day_order')
    .eq('package_id', tourPackage.id)
    .order('day_order', { ascending: true })

  if (locationsResult.error) {
    const isMissingOptionalMapColumn = locationsResult.error.message.includes('image_url') || locationsResult.error.message.includes('pin_color')

    if (!isMissingOptionalMapColumn) {
      throw new Error(locationsResult.error.message)
    }

    const fallbackLocationsResult = await client
      .from('package_locations')
      .select('id,package_id,location_name,latitude,longitude,notes,day_order')
      .eq('package_id', tourPackage.id)
      .order('day_order', { ascending: true })

    if (fallbackLocationsResult.error) {
      throw new Error(fallbackLocationsResult.error.message)
    }

    locations = ((fallbackLocationsResult.data ?? []) as Omit<TourPackageLocation, 'image_url' | 'pin_color'>[]).map((location) => ({
      ...location,
      image_url: null,
      pin_color: '#FB770D',
    }))
  } else {
    locations = (locationsResult.data ?? []) as TourPackageLocation[]
  }

  const itineraryDays = (daysResult.data ?? []) as TourItineraryDay[]
  const dayIds = itineraryDays.map((day) => day.id)

  let activities: TourItineraryActivity[] = []
  let images: TourItineraryImage[] = []

  if (dayIds.length > 0) {
    const [activitiesResult, imagesResult] = await Promise.all([
      client
        .from('tour_itinerary_activities')
        .select('id,itinerary_day_id,title,description,sort_order,created_at')
        .in('itinerary_day_id', dayIds)
        .order('sort_order', { ascending: true }),
      client
        .from('tour_itinerary_images')
        .select('id,itinerary_day_id,image_url,alt_text,caption,sort_order,created_at')
        .in('itinerary_day_id', dayIds)
        .order('sort_order', { ascending: true }),
    ])

    if (activitiesResult.error) throw new Error(activitiesResult.error.message)
    if (imagesResult.error) throw new Error(imagesResult.error.message)

    activities = activitiesResult.data ?? []
    images = imagesResult.data ?? []
  }

  return {
    package: tourPackage,
    highlights: (highlightsResult.data ?? []) as TourHighlight[],
    galleryImages: ((galleryResult.data ?? []) as TourGalleryImage[]).slice(0, 4),
    locations,
    itineraryDays: itineraryDays.map((day) => ({
      ...day,
      activities: activities
        .filter((activity) => activity.itinerary_day_id === day.id)
        .sort((first, second) => first.sort_order - second.sort_order),
      images: images
        .filter((image) => image.itinerary_day_id === day.id)
        .sort((first, second) => first.sort_order - second.sort_order)
        .slice(0, 2),
    })),
  }
}
