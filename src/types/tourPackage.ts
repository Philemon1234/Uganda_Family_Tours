export type PackageStatus = 'draft' | 'published' | 'archived'
export type TourMapStyle = 'light' | 'green' | 'warm' | 'dark'
export type AccommodationTier = 'standard' | 'budget' | 'mid_range' | 'luxury'

export type TourPackage = {
  id: string
  title: string
  slug: string
  category: string
  duration_days: number
  price_from_usd: number | null
  accommodation_tier: AccommodationTier
  short_description: string
  overview: string
  main_image_url: string | null
  hero_image_url: string | null
  map_style: TourMapStyle
  status: PackageStatus
  display_order: number
  created_at: string
  updated_at: string
}

export type TourHighlight = {
  id: string
  package_id: string
  title: string
  description: string | null
  sort_order: number
  created_at: string
}

export type TourGalleryImage = {
  id: string
  package_id: string
  image_url: string
  alt_text: string | null
  caption: string | null
  sort_order: number
  created_at: string
}

export type TourItineraryDay = {
  id: string
  package_id: string
  day_number: number
  title: string
  overview: string
  accommodation_name: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type TourItineraryActivity = {
  id: string
  itinerary_day_id: string
  title: string
  description: string | null
  sort_order: number
  created_at: string
}

export type TourItineraryImage = {
  id: string
  itinerary_day_id: string
  image_url: string
  alt_text: string | null
  caption: string | null
  sort_order: number
  created_at: string
}

export type TourPackageLocation = {
  id: string
  package_id: string
  location_name: string
  latitude: number
  longitude: number
  notes: string | null
  image_url: string | null
  pin_color: string
  day_order: number
}

export type TourItineraryDayWithDetails = TourItineraryDay & {
  activities: TourItineraryActivity[]
  images: TourItineraryImage[]
}

export type TourPackageDetails = {
  package: TourPackage
  highlights: TourHighlight[]
  galleryImages: TourGalleryImage[]
  itineraryDays: TourItineraryDayWithDetails[]
  locations: TourPackageLocation[]
}
