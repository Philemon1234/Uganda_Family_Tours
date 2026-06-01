import { useEffect, useState } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import type { Tour } from '../data/tours'
import { TourCard } from '../components/TourCard'
import { SectionHeader } from '../components/SectionHeader'
import { SafariLoaderOverlay } from '../components/SafariTrailLoader'
import { getPublishedTourPackages } from '../services/publicTourService'
import { packageToTour } from '../utils/tourPackageMapper'
import ctaImage from '../assets/Venture-Uganda-Safari-Uganda-01.jpg'

type ToursPageProps = {
  onInquiry: () => void
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

  if (isLoading) {
    return <SafariLoaderOverlay />
  }

  return (
    <main className="bg-white pt-28">
      <section className="section-padding pt-10">
        <div className="container-custom">
          <SectionHeader
            title={t('toursPage.title')}
            description={t('toursPage.description')}
          />

          {error ? (
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
          <p className="font-bold text-white/70">{t('toursPage.ctaLabel')}</p>
          <h2 className="mx-auto mt-4 max-w-5xl text-2xl font-black leading-tight md:text-4xl">{t('toursPage.ctaTitle')}</h2>
          <button className="btn-primary mt-9" type="button" onClick={onInquiry}>{t('toursPage.ctaButton')} <FiArrowRight /></button>
        </div>
      </section>
    </main>
  )
}
