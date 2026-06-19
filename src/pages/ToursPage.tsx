import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Tour } from '../data/tours'
import { TourCard } from '../components/TourCard'
import { TourFilters, type DurationFilter, type RegionFilter } from '../components/TourFilters'
import { SectionHeader } from '../components/SectionHeader'
import { SafariLoaderOverlay } from '../components/SafariTrailLoader'
import { FooterImageBand } from '../components/FooterImageBand'
import { getPublishedTourPackages } from '../services/publicTourService'
import { packageToTour } from '../utils/tourPackageMapper'
import toursFooterImage from '../assets/footer/UFT Website Work-01.jpg'

const defaultPriceBounds = {
  min: 0,
  max: 10000,
}
const toursPerPage = 9
const eastAfricaTerms = [
  'east africa',
  'uganda',
  'kenya',
  'tanzania',
  'rwanda',
  'burundi',
  'south sudan',
  'bwindi',
  'murchison',
  'queen elizabeth',
  'bunyonyi',
  'kibale',
]

function getDurationDays(tour: Tour) {
  return Number(tour.duration.match(/\d+/)?.[0] ?? 0)
}

function matchesDurationFilter(tour: Tour, duration: DurationFilter) {
  const days = getDurationDays(tour)

  if (duration === 'all') return true
  if (duration === '2-5') return days >= 2 && days <= 5
  if (duration === '6-8') return days >= 6 && days <= 8
  if (duration === '9-12') return days >= 9 && days <= 12
  if (duration === '13-20') return days >= 13 && days <= 20
  return days > 20
}

function matchesRegionFilter(tour: Tour, region: RegionFilter) {
  if (region === 'all') return true

  const searchableText = [tour.destination, tour.title, tour.shortDescription, tour.overview].join(' ').toLowerCase()
  return eastAfricaTerms.some((term) => searchableText.includes(term))
}

export function ToursPage() {
  const { t } = useTranslation()
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [priceRange, setPriceRange] = useState(defaultPriceBounds)
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all')
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const resetFilters = () => {
    setPriceRange(defaultPriceBounds)
    setDurationFilter('all')
    setRegionFilter('all')
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

  const updateRegionFilter = (region: RegionFilter) => {
    setRegionFilter(region)
    setCurrentPage(1)
  }

  const filteredTours = useMemo(() => {
    const hasPriceFilter = priceRange.min !== defaultPriceBounds.min || priceRange.max !== defaultPriceBounds.max

    return tours.filter((tour) => {
      const matchesPrice = !hasPriceFilter || (tour.priceUSD >= priceRange.min && tour.priceUSD <= priceRange.max)

      return matchesPrice && matchesDurationFilter(tour, durationFilter) && matchesRegionFilter(tour, regionFilter)
    })
  }, [durationFilter, priceRange.max, priceRange.min, regionFilter, tours])

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
    <main className="bg-white pt-16 md:pt-24">
      <section className="pb-14 pt-5 md:pb-20 md:pt-10">
        <div className="container-custom">
          <SectionHeader
            title={t('toursPage.title')}
            description={t('toursPage.description')}
          />

          {!error && tours.length > 0 ? (
            <div className="mt-9 w-full">
              <TourFilters
                maxPrice={defaultPriceBounds.max}
                minPrice={defaultPriceBounds.min}
                selectedDuration={durationFilter}
                selectedMaxPrice={priceRange.max}
                selectedMinPrice={priceRange.min}
                selectedRegion={regionFilter}
                onDurationChange={updateDurationFilter}
                onPriceChange={updatePriceRange}
                onRegionChange={updateRegionFilter}
                onReset={resetFilters}
              />
            </div>
          ) : null}

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
            <div className="mt-10">
              {filteredTours.length === 0 ? (
                <div className="mx-auto mt-10 max-w-3xl rounded-[1.75rem] border border-dashed border-[#eadfd3] bg-[#fff8f3] px-6 py-10 text-center">
                  <p className="text-xl font-black text-ink">{t('toursPage.noFilterResultsTitle')}</p>
                  <p className="mt-3 text-muted">{t('toursPage.noFilterResultsDescription')}</p>
                  <button className="btn-primary mt-6" type="button" onClick={resetFilters}>
                    {t('toursPage.resetFilters')}
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
                    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label={t('toursPage.paginationAria')}>
                      <button
                        className="min-h-10 rounded-lg border border-[#eadfd3] bg-white px-4 text-sm font-bold text-ink transition hover:border-primary hover:bg-[#fff4ec] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#eadfd3] disabled:hover:bg-white"
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      >
                        {t('toursPage.previousPage')}
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
                        {t('toursPage.nextPage')}
                      </button>
                    </nav>
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>
      </section>
      <FooterImageBand src={toursFooterImage} alt={t('toursPage.ctaTitle')} />
    </main>
  )
}
