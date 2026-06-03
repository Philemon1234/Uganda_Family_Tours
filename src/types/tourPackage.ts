export type PackageStatus = 'draft' | 'published' | 'archived'

export type TourPackage = {
  id: string
  title: string
  slug: string
  category: string
  duration_days: number
  price_from_usd: number
  short_description: string
  overview: string
  main_image_url: string | null
  hero_image_url: string | null
  status: PackageStatus
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
