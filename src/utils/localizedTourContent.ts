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

export function getLocalizedTourTitle(t: TFunction, tour: Pick<Tour, 'slug' | 'title'>) {
  return t(`tourContent.${getTourContentKey(tour.slug, tour.title)}.title`, { defaultValue: tour.title })
}

export function getLocalizedTourShortDescription(t: TFunction, tour: Pick<Tour, 'slug' | 'shortDescription'>) {
  return t(`tourContent.${getTourContentKey(tour.slug, tour.shortDescription)}.shortDescription`, {
    defaultValue: tour.shortDescription,
  })
}

export function getLocalizedPackage(t: TFunction, tourPackage: TourPackage): TourPackage {
  const contentKey = getTourContentKey(tourPackage.slug, `${tourPackage.title} ${tourPackage.short_description} ${tourPackage.overview}`)

  return {
    ...tourPackage,
    title: t(`tourContent.${contentKey}.title`, { defaultValue: tourPackage.title }),
    category: t(`tourContent.${contentKey}.category`, { defaultValue: tourPackage.category }),
    short_description: t(`tourContent.${contentKey}.shortDescription`, {
      defaultValue: tourPackage.short_description,
    }),
    overview: t(`tourContent.${contentKey}.overview`, { defaultValue: tourPackage.overview }),
  }
}

export function getLocalizedHighlight(
  t: TFunction,
  highlight: TourHighlight,
  contentKey: string,
  index: number,
): TourHighlight {
  return {
    ...highlight,
    title: t(`tourContent.${contentKey}.highlights.${index}.title`, {
      defaultValue: t(`tourContent.${contentKey}.highlights.${index}`, { defaultValue: highlight.title }),
    }),
    description: highlight.description
      ? t(`tourContent.${contentKey}.highlights.${index}.description`, { defaultValue: highlight.description })
      : highlight.description,
  }
}

export function getLocalizedGalleryImage(
  t: TFunction,
  image: TourGalleryImage,
  contentKey: string,
  index: number,
): TourGalleryImage {
  return {
    ...image,
    alt_text: image.alt_text
      ? t(`tourContent.${contentKey}.galleryImages.${index}.altText`, { defaultValue: image.alt_text })
      : image.alt_text,
    caption: image.caption
      ? t(`tourContent.${contentKey}.galleryImages.${index}.caption`, { defaultValue: image.caption })
      : image.caption,
  }
}

export function getLocalizedItineraryDay(
  t: TFunction,
  day: TourItineraryDayWithDetails,
  contentKey: string,
  index: number,
): TourItineraryDayWithDetails {
  return {
    ...day,
    title: t(`tourContent.${contentKey}.itineraryDays.${index}.title`, { defaultValue: day.title }),
    overview: t(`tourContent.${contentKey}.itineraryDays.${index}.description`, { defaultValue: day.overview }),
    accommodation_name: day.accommodation_name
      ? t(`tourContent.${contentKey}.itineraryDays.${index}.accommodation`, { defaultValue: day.accommodation_name })
      : day.accommodation_name,
    activities: day.activities.map((activity, activityIndex) => getLocalizedItineraryActivity(t, activity, contentKey, index, activityIndex)),
  }
}

function getLocalizedItineraryActivity(
  t: TFunction,
  activity: TourItineraryActivity,
  contentKey: string,
  dayIndex: number,
  activityIndex: number,
): TourItineraryActivity {
  return {
    ...activity,
    title: t(`tourContent.${contentKey}.itineraryDays.${dayIndex}.activities.${activityIndex}.title`, {
      defaultValue: t(`tourContent.${contentKey}.itineraryDays.${dayIndex}.activities.${activityIndex}`, {
        defaultValue: activity.title,
      }),
    }),
    description: activity.description
      ? t(`tourContent.${contentKey}.itineraryDays.${dayIndex}.activities.${activityIndex}.description`, {
        defaultValue: activity.description,
      })
      : activity.description,
  }
}

export function getLocalizedLocation(
  t: TFunction,
  location: TourPackageLocation,
  contentKey: string,
  index: number,
): TourPackageLocation {
  return {
    ...location,
    location_name: t(`tourContent.${contentKey}.locations.${index}.name`, { defaultValue: location.location_name }),
    notes: location.notes
      ? t(`tourContent.${contentKey}.locations.${index}.notes`, { defaultValue: location.notes })
      : location.notes,
  }
}
