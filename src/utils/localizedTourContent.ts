import type { TFunction } from 'i18next'
import type {
  TourGalleryImage,
  TourHighlight,
  TourItineraryActivity,
  TourItineraryDayWithDetails,
  TourPackage,
  TourPackageLocation,
} from '../types/tourPackage'
import type { Tour } from '../data/tours'

const tourContentKeyAliases = [
  {
    key: 'chimpanzee-trekking',
    patterns: ['chimpanzee', 'chimps', 'kibale'],
  },
  {
    key: 'queen-elizabeth-wildlife-safari',
    patterns: ['queen-elizabeth', 'queen elizabeth', 'kazinga'],
  },
  {
    key: 'gorilla-tracking-in-bwindi',
    patterns: ['gorilla', 'bwindi'],
  },
  {
    key: 'murchison-falls-safari',
    patterns: ['murchison', 'falls', 'nile'],
  },
  {
    key: 'lake-bunyonyi-escape',
    patterns: ['bunyonyi', 'lake'],
  },
  {
    key: 'cultural-uganda-experience',
    patterns: ['cultural', 'culture'],
  },
]

function normalizeContentSource(value: string) {
  return value
    .toLowerCase()
    .replace(/duplicate(?:-\d+)?/g, '')
    .replace(/new-package/g, 'queen-elizabeth-wildlife-safari')
    .replace(/-\d+$/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getTourContentKey(slug: string, fallbackText = '') {
  const normalizedSource = normalizeContentSource([slug, fallbackText].filter(Boolean).join(' '))
  const exactKey = normalizedSource
    .replace(/-experience$/g, '')
    .replace(/-safari-experience$/g, '-safari')

  for (const alias of tourContentKeyAliases) {
    if (exactKey === alias.key || alias.patterns.some((pattern) => normalizedSource.includes(pattern))) {
      return alias.key
    }
  }

  return exactKey
}

export function getLocalizedTourTitle(_t: TFunction, tour: Pick<Tour, 'slug' | 'title'>) {
  return tour.title
}

export function getLocalizedTourShortDescription(_t: TFunction, tour: Pick<Tour, 'slug' | 'shortDescription'>) {
  return tour.shortDescription
}

export function getLocalizedPackage(_t: TFunction, tourPackage: TourPackage): TourPackage {
  return {
    ...tourPackage,
    title: tourPackage.title,
    category: tourPackage.category,
    short_description: tourPackage.short_description,
    overview: tourPackage.overview,
  }
}

export function getLocalizedHighlight(
  _t: TFunction,
  highlight: TourHighlight,
  _contentKey: string,
  _index: number,
): TourHighlight {
  return {
    ...highlight,
    title: highlight.title,
    description: highlight.description,
  }
}

export function getLocalizedGalleryImage(
  _t: TFunction,
  image: TourGalleryImage,
  _contentKey: string,
  _index: number,
): TourGalleryImage {
  return {
    ...image,
    alt_text: image.alt_text,
    caption: image.caption,
  }
}

export function getLocalizedItineraryDay(
  _t: TFunction,
  day: TourItineraryDayWithDetails,
  _contentKey: string,
  _index: number,
): TourItineraryDayWithDetails {
  return {
    ...day,
    title: day.title,
    overview: day.overview,
    accommodation_name: day.accommodation_name,
    activities: day.activities.map((activity) => getLocalizedItineraryActivity(activity)),
  }
}

function getLocalizedItineraryActivity(
  activity: TourItineraryActivity,
): TourItineraryActivity {
  return {
    ...activity,
    title: activity.title,
    description: activity.description,
  }
}

export function getLocalizedLocation(
  _t: TFunction,
  location: TourPackageLocation,
  _contentKey: string,
  _index: number,
): TourPackageLocation {
  return {
    ...location,
    location_name: location.location_name,
    notes: location.notes,
  }
}
