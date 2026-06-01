import { useEffect, useMemo, useState } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import type { Tour } from '../data/tours'
import { TourCard } from '../components/TourCard'
import { TourFilters, type DurationFilter } from '../components/TourFilters'
import { SectionHeader } from '../components/SectionHeader'
import { SafariLoaderOverlay } from '../components/SafariTrailLoader'
import { getPublishedTourPackages } from '../services/publicTourService'
import { packageToTour } from '../utils/tourPackageMapper'
import ctaImage from '../assets/Venture-Uganda-Safari-Uganda-01.jpg'

type ToursPageProps = {
  onInquiry: () => void
}

const defaultPriceBounds = {
  min: 0,
  max: 10000,
}
const toursPerPage = 9

function getDurationDays(tour: Tour) {
  return Number(tour.duration.match(/\d+/)?.[0] ?? 0)
}

function matchesDurationFilter(tour: Tour, duration: DurationFilter) {
  const days = getDurationDays(tour)

  if (duration === 'all') return true
  if (duration === '1-2') return days >= 1 && days <= 2
  if (duration === '3-4') return days >= 3 && days <= 4
  if (duration === '5-7') return days >= 5 && days <= 7
  return days >= 8
}

export function ToursPage({ onInquiry }: ToursPageProps) {
  const { t } = useTranslation()
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [priceRange, setPriceRange] = useState(defaultPriceBounds)
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const resetFilters = () => {
    setPriceRange(defaultPriceBounds)
    setDurationFilter('all')
    setCurrentPage(1)
  }

  const updatePriceRange = (range: { min: number; max: number }) => {
    setPriceRange(range)
    setCurrentPage(1)
  }

  const updateDurationFilter = (duration: DurationFilter) => {
    setDurationFilter(duration)
    setCurrentPage(1)
  }

  const filteredTours = useMemo(() => {
    const hasPriceFilter = priceRange.min !== defaultPriceBounds.min || priceRange.max !== defaultPriceBounds.max

    return tours.filter((tour) => {
      const matchesPrice = !hasPriceFilter || (tour.priceUSD >= priceRange.min && tour.priceUSD <= priceRange.max)

      return matchesPrice && matchesDurationFilter(tour, durationFilter)
    })
  }, [durationFilter, priceRange.max, priceRange.min, tours])

  const totalPages = Math.max(1, Math.ceil(filteredTours.length / toursPerPage))
  const pageStartIndex = (currentPage - 1) * toursPerPage
  const paginatedTours = filteredTours.slice(pageStartIndex, pageStartIndex + toursPerPage)

  const visiblePages = useMemo(() => {
    const start = Math.max(1, currentPage - 1)
    const end = Math.min(totalPages, start + 2)
    const adjustedStart = Math.max(1, end - 2)

    return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index)
  }, [currentPage, totalPages])

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
          setError(message || t('toursPage.errorMessage'))
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
    <main className="bg-white pt-20 md:pt-24">
      <section className="section-padding pt-8 md:pt-10">
        <div className="container-custom">
          <div className="relative">
            {!error && tours.length > 0 ? (
              <div className="mb-5 flex justify-end md:absolute md:right-0 md:top-0 md:z-30 md:mb-0">
                <TourFilters
                  maxPrice={defaultPriceBounds.max}
                  minPrice={defaultPriceBounds.min}
                  selectedDuration={durationFilter}
                  selectedMaxPrice={priceRange.max}
                  selectedMinPrice={priceRange.min}
                  onDurationChange={updateDurationFilter}
                  onPriceChange={updatePriceRange}
                  onReset={resetFilters}
                />
              </div>
            ) : null}

            <SectionHeader
              title={t('toursPage.title')}
              description={t('toursPage.description')}
            />
          </div>

          {error ? (
            <div className="mx-auto mt-12 max-w-3xl rounded-[1.75rem] border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
              <p className="text-lg font-bold">{t('toursPage.errorTitle')}</p>
              <p className="mt-2 text-sm leading-6">{error}</p>
            </div>
          ) : tours.length === 0 ? (
            <div className="mx-auto mt-12 max-w-3xl rounded-[1.75rem] border border-dashed border-[#eadfd3] bg-[#fff8f3] px-6 py-10 text-center">
              <p className="text-xl font-black text-ink">{t('toursPage.emptyTitle')}</p>
              <p className="mt-3 text-muted">{t('toursPage.emptyDescription')}</p>
            </div>
          ) : (
            <div className="mt-12">
              {filteredTours.length === 0 ? (
                <div className="mx-auto mt-10 max-w-3xl rounded-[1.75rem] border border-dashed border-[#eadfd3] bg-[#fff8f3] px-6 py-10 text-center">
                  <p className="text-xl font-black text-ink">No tours match your filters.</p>
                  <p className="mt-3 text-muted">Try adjusting your price or duration.</p>
                  <button className="btn-primary mt-6" type="button" onClick={resetFilters}>
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
                    {paginatedTours.map((tour, index) => (
                      <TourCard key={tour.slug} tour={tour} revealDelay={(index % 3) * 90} />
                    ))}
                  </div>
                  {totalPages > 1 ? (
                    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Tour pagination">
                      <button
                        className="min-h-10 rounded-lg border border-[#eadfd3] bg-white px-4 text-sm font-bold text-ink transition hover:border-primary hover:bg-[#fff4ec] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#eadfd3] disabled:hover:bg-white"
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      >
                        Previous
                      </button>
                      {visiblePages[0] > 1 ? (
                        <>
                          <button
                            className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-[#eadfd3] bg-white px-3 text-sm font-bold text-ink transition hover:border-primary hover:bg-[#fff4ec]"
                            type="button"
                            onClick={() => setCurrentPage(1)}
                          >
                            1
                          </button>
                          <span className="px-1 text-sm font-bold text-slate-400">...</span>
                        </>
                      ) : null}
                      {visiblePages.map((page) => {
                        const isActive = currentPage === page

                        return (
                          <button
                            className={`grid min-h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm font-bold transition ${
                              isActive
                                ? 'border-primary bg-primary text-white shadow-orange'
                                : 'border-[#eadfd3] bg-white text-ink hover:border-primary hover:bg-[#fff4ec]'
                            }`}
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        )
                      })}
                      {visiblePages[visiblePages.length - 1] < totalPages ? (
                        <>
                          <span className="px-1 text-sm font-bold text-slate-400">...</span>
                          <button
                            className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-[#eadfd3] bg-white px-3 text-sm font-bold text-ink transition hover:border-primary hover:bg-[#fff4ec]"
                            type="button"
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </>
                      ) : null}
                      <button
                        className="min-h-10 rounded-lg border border-[#eadfd3] bg-white px-4 text-sm font-bold text-ink transition hover:border-primary hover:bg-[#fff4ec] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#eadfd3] disabled:hover:bg-white"
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      >
                        Next
                      </button>
                    </nav>
                  ) : null}
                </>
              )}
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
