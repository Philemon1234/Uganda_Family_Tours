import { useEffect, useState } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { allTours, type Tour } from '../data/tours'
import { TourCard } from '../components/TourCard'
import { SectionHeader } from '../components/SectionHeader'
import { getPublishedTourPackages } from '../services/publicTourService'
import type { TourPackage } from '../types/tourPackage'
import ctaImage from '../assets/Venture-Uganda-Safari-Uganda-01.jpg'

type ToursPageProps = {
  onInquiry: () => void
}

const fallbackTour = allTours[0]

function packageToTour(tourPackage: TourPackage, index: number): Tour {
  const fallbackImage = fallbackTour.image
  const heroImage = tourPackage.hero_image_url || tourPackage.main_image_url || fallbackTour.heroImage

  return {
    id: index + 1,
    title: tourPackage.title,
    slug: tourPackage.slug,
    price: `From ${formatUsd(tourPackage.price_from_usd)}`,
    priceUSD: Number(tourPackage.price_from_usd),
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

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function ToursPage({ onInquiry }: ToursPageProps) {
  const { t } = useTranslation()
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadTours() {
      setIsLoading(true)
      setError('')

      try {
        const packages = await getPublishedTourPackages()

        if (isMounted) {
          setTours(packages.map(packageToTour))
        }
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : String(loadError)

        if (isMounted) {
          setError(message || 'Unable to load tours right now. Please try again later.')
          setTours([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadTours()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="bg-white pt-28">
      <section className="section-padding pt-10">
        <div className="container-custom">
          <SectionHeader
            title={t('toursPage.title')}
            description={t('toursPage.description')}
          />

          {isLoading ? (
            <div className="mt-12 grid items-stretch gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-[520px] animate-pulse rounded-[1.75rem] border border-[#eadfd3] bg-slate-100"
                />
              ))}
            </div>
          ) : error ? (
            <div className="mx-auto mt-12 max-w-3xl rounded-[1.75rem] border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
              <p className="text-lg font-bold">Unable to load tours</p>
              <p className="mt-2 text-sm leading-6">{error}</p>
            </div>
          ) : tours.length === 0 ? (
            <div className="mx-auto mt-12 max-w-3xl rounded-[1.75rem] border border-dashed border-[#eadfd3] bg-[#fff8f3] px-6 py-10 text-center">
              <p className="text-xl font-black text-ink">No published tours available yet.</p>
              <p className="mt-3 text-muted">Please check back soon or send us an inquiry for a custom Uganda safari.</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour, index) => (
                <TourCard key={tour.slug} tour={tour} revealDelay={(index % 3) * 90} />
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="relative overflow-hidden bg-cover bg-center py-28 text-center text-white" style={{ backgroundImage: `url(${ctaImage})` }}>
        <div className="absolute inset-0 bg-black/70" />
        <div className="container-custom relative z-10">
          <p className="font-bold text-[#FD5E02]">{t('toursPage.ctaLabel')}</p>
          <h2 className="mx-auto mt-6 max-w-6xl text-4xl font-black leading-tight md:text-7xl">{t('toursPage.ctaTitle')}</h2>
          <button className="btn-primary mt-9" type="button" onClick={onInquiry}>{t('toursPage.ctaButton')} <FiArrowRight /></button>
        </div>
      </section>
    </main>
  )
}
