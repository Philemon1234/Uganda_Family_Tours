import { allTours, type Tour } from '../data/tours'
import type { TourPackage } from '../types/tourPackage'

const fallbackTour = allTours[0]

function formatUsd(value: number | null) {
  if (value === null) return 'Contact us'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function packageToTour(tourPackage: TourPackage, index: number): Tour {
  const fallbackImage = fallbackTour.image
  const heroImage = tourPackage.hero_image_url || tourPackage.main_image_url || fallbackTour.heroImage

  return {
    id: index + 1,
    packageId: tourPackage.id,
    title: tourPackage.title,
    slug: tourPackage.slug,
    price: tourPackage.price_from_usd === null ? 'Contact us' : `From ${formatUsd(tourPackage.price_from_usd)}`,
    priceUSD: tourPackage.price_from_usd,
    accommodationTier: tourPackage.accommodation_tier ?? 'standard',
    duration: `${tourPackage.duration_days} Days`,
    destination: tourPackage.category,
    tripLevel: fallbackTour.tripLevel,
    bestSeason: fallbackTour.bestSeason,
    rating: fallbackTour.rating,
    reviewCount: fallbackTour.reviewCount,
    shortDescription:
      tourPackage.short_description || 'Explore this Uganda Family Tours experience.',
    overview: tourPackage.overview,
    image: tourPackage.main_image_url || fallbackImage,
    heroImage,
    galleryImages: [tourPackage.main_image_url, tourPackage.hero_image_url].filter(
      (imageUrl): imageUrl is string => Boolean(imageUrl),
    ),
    highlights: [],
    itineraryDays: [],
  }
}
