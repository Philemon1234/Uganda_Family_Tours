import heroOnloadImage from '../assets/on load.png'
import storyThumbnail from '../assets/Thumbnail.png'
import journeyImage from '../assets/Venture-Uganda-Safari-Uganda-01.jpg'
import logoImage from '../assets/UFT-Logo-PNG.png'
import homeIconOne from '../assets/UFT-Homepage-icons-01.png'
import homeIconTwo from '../assets/UFT-Homepage-icons-02.png'
import homeIconThree from '../assets/UFT-Homepage-icons-03.png'
import homeIconFour from '../assets/UFT-Favicon.png'
import galleryOne from '../assets/cover_1669-Tree-Climbing-Lions.jpg'
import galleryTwo from '../assets/gorilla-7708328_1280.jpg'
import footerBandImage from '../assets/footer/UFT Website Work-03.jpg'
import type { HomeCustomizationContent } from '../types/homeCustomization'

const localAssetUrls: Record<string, string> = {
  '/src/assets/UFT-Logo-PNG.png': logoImage,
  '/src/assets/on load.png': heroOnloadImage,
  '/src/assets/Thumbnail.png': storyThumbnail,
  '/src/assets/Venture-Uganda-Safari-Uganda-01.jpg': journeyImage,
  '/src/assets/UFT-Homepage-icons-01.png': homeIconOne,
  '/src/assets/UFT-Homepage-icons-02.png': homeIconTwo,
  '/src/assets/UFT-Homepage-icons-03.png': homeIconThree,
  '/src/assets/UFT-Favicon.png': homeIconFour,
  '/src/assets/cover_1669-Tree-Climbing-Lions.jpg': galleryOne,
  '/src/assets/gorilla-7708328_1280.jpg': galleryTwo,
  '/src/assets/footer/UFT Website Work-03.jpg': footerBandImage,
}

export const defaultHomeCustomization: HomeCustomizationContent = {
  nav: {
    logo: {
      src: logoImage,
      alt: 'Uganda Family Tours',
    },
    links: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'tours', label: 'Tours', href: '/tours' },
      { id: 'about', label: 'About Us', href: '/about' },
    ],
    inquiryButton: { text: 'Talk to a Travel Specialist', href: '#inquiry', color: '#FB770D', icon: 'arrow' },
  },
  hero: {
    kicker: 'Explore the Pearl of Africa',
    title: 'A Safari Journey Made Personal',
    subtitle: 'Nobody knows Uganda better than us',
    cta: { text: 'Explore Our Tours', href: '/tours', color: '#FB770D', icon: 'arrow' },
    background: { src: heroOnloadImage, alt: 'Uganda safari landscape' },
  },
  story: {
    label: 'Crafted for you',
    title: 'Uganda Family Tours & Safari Co.',
    paragraphs: [
      'Uganda is not just a destination. It is a feeling - the sound of the forest, the silence of the savannah, the warmth of its people, and the thrill of seeing wildlife in its natural home.',
      'Uganda Family Tours & Safari Co. creates authentic, smooth, and memorable journeys across Uganda and East Africa for travelers who want comfort, care, and a deeper connection to place.',
    ],
    badges: [
      { src: homeIconOne, alt: 'Service', href: 'https://ugandafamilytours.com' },
      { src: homeIconTwo, alt: 'Planning', href: 'https://ugandafamilytours.com/tours' },
      { src: homeIconThree, alt: 'Support', href: 'https://wa.me/256703543027' },
      { src: homeIconFour, alt: 'Brand', href: 'https://ugandafamilytours.com' },
    ],
  },
  signature: {
    title: 'Signature Experiences',
    description: 'From gorilla forests to open savannahs, every journey is shaped around what travelers want to feel, see, and remember.',
    image: { src: storyThumbnail, alt: 'Jackson Otwikende' },
    founderName: 'Jackson Otwikende',
    founderRole: 'CEO & Founder',
    items: [
      { id: 'gorilla', title: 'Gorilla Trekking', text: 'Quest forests while looking for African mountain wildlife encounters.', icon: { src: '', alt: 'Gorilla trekking icon' } },
      { id: 'wildlife', title: 'Wildlife Safaris', text: 'Game drives, boat cruises, and wild landscapes guided by local knowledge.', icon: { src: '', alt: 'Wildlife safaris icon' } },
      { id: 'chimps', title: 'Chimpanzee Tracking', text: 'Follow forest calls through Kibale and other primate-rich habitats.', icon: { src: '', alt: 'Chimpanzee tracking icon' } },
      { id: 'culture', title: 'Cultural Experiences', text: 'Meet communities, makers, storytellers, and local hosts with respect.', icon: { src: '', alt: 'Cultural experiences icon' } },
      { id: 'lake', title: 'Lake & Nature Escapes', text: 'Slow down beside crater lakes, highlands, rivers, and peaceful retreats.', icon: { src: '', alt: 'Lake and nature escapes icon' } },
      { id: 'family', title: 'Family Adventures', text: 'Easy pacing, thoughtful safaris planned for every generation.', icon: { src: '', alt: 'Family adventures icon' } },
    ],
  },
  featuredTours: {
    label: 'Crafted for you',
    title: 'Handpicked Safari Experiences',
    description: 'A focused selection of journeys from your published safari collection, kept concise so the homepage feels like an invitation rather than a catalogue.',
  },
  journey: {
    label: 'Designed with you',
    title: 'Around Your Journey',
    description: 'Every itinerary is shaped around your pace, interests, comfort, and travel style - whether you are visiting Uganda for gorillas, wildlife, culture, or a once-in-a-lifetime family adventure.',
    cta: { text: 'Talk to a Travel Specialist', href: '#inquiry', color: '#FB770D', icon: 'arrow' },
    image: { src: journeyImage, alt: 'Safari vehicle in Uganda' },
    thumbnail: { src: storyThumbnail, alt: 'Travel specialist' },
  },
  why: {
    label: 'Planning with attention',
    title: 'Why Travel With Uganda Family Tours?',
    description: 'Quiet planning, trusted local guidance, responsible travel values, and steady support from the first idea to the final day of your safari.',
    cards: [
      { id: 'tailor', title: 'Tailor-Made Itineraries', text: 'Journeys shaped around your pace, interests, and comfort.', icon: { src: '', alt: 'Tailor-made itineraries icon' } },
      { id: 'local', title: 'Trusted Local Expertise', text: 'Local guides, thoughtful routing, and insider knowledge.', icon: { src: '', alt: 'Trusted local expertise icon' } },
      { id: 'responsible', title: 'Responsible Travel', text: 'Safari planning that respects wildlife, nature, and communities.', icon: { src: '', alt: 'Responsible travel icon' } },
      { id: 'peace', title: 'Peace of Mind', text: 'Secure booking, clear communication, and travel support.', icon: { src: '', alt: 'Peace of mind icon' } },
    ],
  },
  gallery: {
    label: 'From day to day',
    title: 'Moments From Our Journeys',
    description: 'A glimpse of the landscapes, wildlife, lodges, and human moments that make each itinerary feel alive.',
    images: [
      { src: galleryOne, alt: 'Lions in Uganda' },
      { src: galleryTwo, alt: 'Gorilla in forest' },
      { src: journeyImage, alt: 'Safari landscape' },
    ],
  },
  reviews: {
    title: 'What Our Clients Say',
    description: 'Hear the highlights of their unforgettable experiences with us.',
  },
  footerBand: { src: footerBandImage, alt: 'Uganda Family Tours team' },
  footer: {
    about: 'We are a local family-owned travel company specializing in tailor-made eco safari experiences in Uganda and East Africa.',
    phone: '+256 703 543027',
    email: 'safaris@ugandafamilytours.com',
    location: 'Kampala, Uganda',
    quickLinks: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'tours', label: 'Tours', href: '/tours' },
      { id: 'about', label: 'About Us', href: '/about' },
    ],
    socials: [
      { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/ugandafamilytours' },
      { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@ugandafamilytours/shorts' },
      { id: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/256703543027' },
    ],
  },
  sectionOrder: ['hero', 'story', 'signature', 'featuredTours', 'journey', 'why', 'gallery', 'reviews', 'footerBand', 'footer'],
  hiddenSections: [],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function resolveLocalAssetReference(value: string) {
  return localAssetUrls[value] ?? value
}

function normalizeLocalAssetReferences<T>(value: T): T {
  if (typeof value === 'string') return resolveLocalAssetReference(value) as T
  if (Array.isArray(value)) return value.map((item) => normalizeLocalAssetReferences(item)) as T
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, normalizeLocalAssetReferences(entryValue)]),
    ) as T
  }

  return value
}

export function mergeHomeCustomization(content?: Partial<HomeCustomizationContent> | null): HomeCustomizationContent {
  if (!content) return defaultHomeCustomization
  const normalizedContent = normalizeLocalAssetReferences(content)

  const merge = (base: unknown, override: unknown): unknown => {
    if (Array.isArray(base)) return Array.isArray(override) ? override : base
    if (isRecord(base)) {
      const overrideRecord = isRecord(override) ? override : {}
      const next: Record<string, unknown> = { ...base }
      Object.entries(base).forEach(([key, value]) => {
        next[key] = merge(value, overrideRecord[key])
      })
      return next
    }
    return override === undefined || override === null ? base : override
  }

  return merge(defaultHomeCustomization, normalizedContent) as HomeCustomizationContent
}
