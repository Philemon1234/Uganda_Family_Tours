import gorillaHero from '../assets/gorilla-7708328_1920.jpg'
import gorillaCard from '../assets/2023-04-12.webp'
import forestWalk from '../assets/2D3A1324-scaled.webp'
import safariTruck from '../assets/Venture-Uganda-Safari-Uganda-01.jpg'
import lions from '../assets/cover_1669-Tree-Climbing-Lions.jpg'
import lake from '../assets/3.jpeg'
import culture from '../assets/4.jpeg'
import waterfall from '../assets/gorilla-7708352_1280.jpg'
import forest from '../assets/gorilla-7708328_1280.jpg'

export type ItineraryDay = {
  day: string
  title: string
  description: string
  activities: string[]
  details: string
}

export type Tour = {
  id: number
  packageId?: string
  title: string
  slug: string
  price: string
  priceUSD: number | null
  accommodationTier?: 'standard' | 'budget' | 'mid_range' | 'luxury'
  duration: string
  destination: string
  tripLevel: string
  bestSeason: string
  rating: number
  reviewCount: number
  shortDescription: string
  overview: string
  image: string
  heroImage: string
  galleryImages: string[]
  highlights: string[]
  itineraryDays: ItineraryDay[]
}

const defaultOverview =
  'Journey into the heart of untamed beauty. This itinerary blends iconic wildlife encounters, rich culture, scenic landscapes, and thoughtful local hosting for a memorable Uganda safari experience.'

const defaultDays: ItineraryDay[] = [
  {
    day: 'Day 1',
    title: 'Arrival and Settling In',
    description:
      'Arrive at the designated airport or meeting point, where your safari guide welcomes you and briefs you on the adventure ahead.',
    activities: ['Airport pickup and transfer', 'Scenic drive to your lodge', 'Lodge check-in and orientation'],
    details: 'Accommodation: lodge  Meals: dinner  Distance: 120km',
  },
  {
    day: 'Day 2',
    title: 'Gorilla Trekking & Transfer to Queen Elizabeth',
    description:
      'Head into the rainforest for a guided trek, then continue through rolling hills and village landscapes toward Queen Elizabeth National Park.',
    activities: ['Guided wildlife tracking', 'Packed lunch in nature', 'Evening transfer and lodge check-in'],
    details: 'Accommodation: lodge  Meals: breakfast, lunch, dinner  Distance: 160km',
  },
  {
    day: 'Day 3',
    title: 'Queen Elizabeth Exploration',
    description:
      'Spend the day exploring savannah plains, crater lakes, and waterways known for elephant, buffalo, antelope, and birdlife.',
    activities: ['Morning game drive', 'Boat cruise or nature walk', 'Sunset photography stop'],
    details: 'Accommodation: lodge  Meals: breakfast, lunch, dinner  Distance: 80km',
  },
  {
    day: 'Day 4',
    title: 'Departure and Cultural Reflection',
    description:
      'Enjoy a relaxed breakfast before your return transfer, with time for local crafts, community visits, or scenic stops along the way.',
    activities: ['Cultural visit', 'Souvenir stop', 'Transfer to Kampala or Entebbe'],
    details: 'Accommodation: none  Meals: breakfast  Distance: 280km',
  },
]

export const tours: Tour[] = [
  {
    id: 1,
    title: 'Gorilla Tracking in Bwindi',
    slug: 'gorilla-tracking-in-bwindi',
    price: 'From $1,970',
    priceUSD: 1970,
    duration: '4 Days',
    destination: 'Bwindi',
    tripLevel: 'Moderate',
    bestSeason: 'Year Round',
    rating: 4.9,
    reviewCount: 214,
    shortDescription: 'Trek through lush rainforest with expert guides to encounter mountain gorillas in their natural habitat and learn about conservation.',
    overview:
      'Journey into the heart of untamed beauty. Bwindi Impenetrable National Park is home to nearly half of the world’s remaining mountain gorillas. This 4-day journey offers an unforgettable trekking experience through lush rainforest, vibrant culture, and meaningful conservation - a true bucket list adventure.',
    image: gorillaCard,
    heroImage: gorillaHero,
    galleryImages: [gorillaHero, gorillaCard, forestWalk, forest],
    highlights: [
      'Mountain gorilla tracking',
      'Golden monkey encounters',
      'Lake Kivu relaxation',
      'Cultural immersion',
      'Scenic rainforest landscapes',
    ],
    itineraryDays: defaultDays,
  },
  {
    id: 2,
    title: 'Murchison Falls Safari',
    slug: 'murchison-falls-safari',
    price: 'From $1,600',
    priceUSD: 1600,
    duration: '3 Days',
    destination: 'Murchison Falls',
    tripLevel: 'Easy',
    bestSeason: 'Year Round',
    rating: 4.8,
    reviewCount: 186,
    shortDescription: 'Experience powerful waterfalls, thrilling game drives, and a scenic boat cruise along the Nile with rich wildlife viewing.',
    overview: defaultOverview,
    image: waterfall,
    heroImage: waterfall,
    galleryImages: [waterfall, safariTruck, lake],
    highlights: ['Nile boat cruise', 'Top of the falls visit', 'Big game viewing', 'Birding hotspots', 'Sunrise game drive'],
    itineraryDays: defaultDays.slice(0, 3),
  },
  {
    id: 3,
    title: 'Queen Elizabeth Wildlife Safari',
    slug: 'queen-elizabeth-wildlife-safari',
    price: 'From $1,490',
    priceUSD: 1490,
    duration: '3 Days',
    destination: 'Queen Elizabeth',
    tripLevel: 'Easy',
    bestSeason: 'Year Round',
    rating: 4.7,
    reviewCount: 153,
    shortDescription: 'Explore diverse wildlife, tree-climbing lions, crater lake views, and open savannah landscapes with your local safari guide.',
    overview: defaultOverview,
    image: lions,
    heroImage: lions,
    galleryImages: [lions, safariTruck, lake],
    highlights: ['Tree-climbing lions', 'Kazinga Channel cruise', 'Crater lake scenery', 'Elephant sightings', 'Local village visit'],
    itineraryDays: defaultDays.slice(0, 3),
  },
  {
    id: 4,
    title: 'Lake Bunyonyi Escape',
    slug: 'lake-bunyonyi-escape',
    price: 'From $1,130',
    priceUSD: 1130,
    duration: '2 Days',
    destination: 'Lake Bunyonyi',
    tripLevel: 'Easy',
    bestSeason: 'Year Round',
    rating: 4.8,
    reviewCount: 121,
    shortDescription: 'Relax beside the serene lake, enjoy island hopping, canoe rides, and breathtaking highland scenery at an easy pace.',
    overview: defaultOverview,
    image: lake,
    heroImage: lake,
    galleryImages: [lake, forestWalk, safariTruck],
    highlights: ['Island canoe tour', 'Highland viewpoints', 'Community visit', 'Lake relaxation', 'Bird watching'],
    itineraryDays: defaultDays.slice(0, 2),
  },
  {
    id: 5,
    title: 'Chimpanzee Trekking',
    slug: 'chimpanzee-trekking',
    price: 'From $1,300',
    priceUSD: 1300,
    duration: '3 Days',
    destination: 'Kibale Forest',
    tripLevel: 'Moderate',
    bestSeason: 'Year Round',
    rating: 4.7,
    reviewCount: 109,
    shortDescription: 'Track chimpanzees in Kibale Forest, listen for primates in the canopy, and enjoy beautiful Bigodi wetland walks.',
    overview: defaultOverview,
    image: forestWalk,
    heroImage: forestWalk,
    galleryImages: [forestWalk, forest, gorillaCard],
    highlights: ['Chimpanzee tracking', 'Bigodi wetland walk', 'Primate viewing', 'Forest birding', 'Local guide stories'],
    itineraryDays: defaultDays.slice(0, 3),
  },
  {
    id: 6,
    title: 'Cultural Uganda Experience',
    slug: 'cultural-uganda-experience',
    price: 'From $1,090',
    priceUSD: 1090,
    duration: '2 Days',
    destination: 'Uganda',
    tripLevel: 'Easy',
    bestSeason: 'Year Round',
    rating: 4.6,
    reviewCount: 98,
    shortDescription: 'Immerse in local culture, traditional food, music, storytelling, craft markets, and meaningful community experiences.',
    overview: defaultOverview,
    image: culture,
    heroImage: culture,
    galleryImages: [culture, safariTruck, lake],
    highlights: ['Cultural performances', 'Local food experience', 'Craft markets', 'Community walk', 'Storytelling with hosts'],
    itineraryDays: defaultDays.slice(0, 2),
  },
]

export const allTours: Tour[] = [
  ...tours,
  ...tours.map((tour, index) => ({
    ...tour,
    id: tour.id + 6,
    slug: `${tour.slug}-${index + 2}`,
  })),
]
