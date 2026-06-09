import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaCheck, FaShieldHeart } from 'react-icons/fa6'
import { FiArrowRight, FiCheckCircle, FiChevronLeft, FiChevronRight, FiPhone, FiX } from 'react-icons/fi'
import { SafariLoaderOverlay } from '../components/SafariTrailLoader'
import TourRouteMap from '../components/TourRouteMap'
import { tours, type ItineraryDay, type Tour } from '../data/tours'
import { useLocale } from '../context/LocaleContext'
import { getTourPackageDetailsBySlug } from '../services/publicTourService'
import type { TourPackageDetails, TourItineraryDayWithDetails } from '../types/tourPackage'
import {
  getLocalizedGalleryImage,
  getLocalizedHighlight,
  getLocalizedItineraryDay,
  getLocalizedLocation,
  getLocalizedPackage,
  getTourContentKey,
} from '../utils/localizedTourContent'
import hotelExterior from '../assets/Hotels/hotel.jpg'
import kabiraPool from '../assets/Hotels/Kabira_Country_Club-Kampala-Pool-2-477529.jpg'
import kampalaSerena from '../assets/Hotels/kampala-serena-hotel.jpg'
import proteaHotel from '../assets/Hotels/Protea hotel.webp'
import serenaHotel from '../assets/Hotels/serena hotel.jpg'
import lodgeRoom from '../assets/Hotels/v3Ppqx8Q6OKs.jpg'

type ItineraryPageProps = {
  slug: string
  onBook: (tour?: Tour) => void
}

const fallbackTour = tours[0]
const fallbackDayImages = [hotelExterior, kabiraPool, kampalaSerena, proteaHotel, serenaHotel, lodgeRoom]

export function ItineraryPage({ slug, onBook }: ItineraryPageProps) {
  const { t } = useTranslation()
  const { formatCurrency } = useLocale()
  const tabSentinelRef = useRef<HTMLDivElement>(null)
  const tabNavRef = useRef<HTMLElement>(null)
  const itineraryTimelineRef = useRef<HTMLDivElement>(null)
  const dayMarkerRefs = useRef<(HTMLDivElement | null)[]>([])
  const [details, setDetails] = useState<TourPackageDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isTabStuck, setIsTabStuck] = useState(false)
  const [timelineProgress, setTimelineProgress] = useState(0)
  const [activeTab, setActiveTab] = useState(0)
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadDetails() {
      setIsLoading(true)
      setError('')

      try {
        const nextDetails = await getTourPackageDetailsBySlug(slug)

        if (isMounted) {
          setDetails(nextDetails)
        }
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : String(loadError)

        if (isMounted) {
          setError(message || t('tourDetails.loadDetailsError'))
          setDetails(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDetails()

    return () => {
      isMounted = false
    }
  }, [slug, t])

  const tabs = [
    [t('tourDetails.overview'), '#overview'],
    [t('tourDetails.gallery'), '#gallery'],
    [t('tourDetails.highlights'), '#highlights'],
    [t('tourDetails.itinerary'), '#itinerary'],
  ] as const

  useEffect(() => {
    const updateTabState = () => {
      if (!tabSentinelRef.current) return
      const tabTop = tabSentinelRef.current.getBoundingClientRect().top
      setIsTabStuck(tabTop <= 0)
    }

    updateTabState()
    window.addEventListener('scroll', updateTabState, { passive: true })
    window.addEventListener('resize', updateTabState)

    return () => {
      window.removeEventListener('scroll', updateTabState)
      window.removeEventListener('resize', updateTabState)
    }
  }, [])

  useEffect(() => {
    const updateTimelineProgress = () => {
      const timeline = itineraryTimelineRef.current
      const markers = dayMarkerRefs.current.filter(Boolean) as HTMLDivElement[]
      if (!timeline || markers.length < 2) {
        setTimelineProgress(0)
        return
      }

      const timelineTop = timeline.getBoundingClientRect().top + window.scrollY
      const firstMarker = markers[0]
      const lastMarker = markers[markers.length - 1]
      const firstCenter = firstMarker.getBoundingClientRect().top + window.scrollY + firstMarker.offsetHeight / 2 - timelineTop
      const lastCenter = lastMarker.getBoundingClientRect().top + window.scrollY + lastMarker.offsetHeight / 2 - timelineTop
      const viewportAnchor = window.scrollY + window.innerHeight * 0.42 - timelineTop
      const nextProgress = Math.min(1, Math.max(0, (viewportAnchor - firstCenter) / (lastCenter - firstCenter)))

      setTimelineProgress(nextProgress)
    }

    updateTimelineProgress()
    window.addEventListener('scroll', updateTimelineProgress, { passive: true })
    window.addEventListener('resize', updateTimelineProgress)

    return () => {
      window.removeEventListener('scroll', updateTimelineProgress)
      window.removeEventListener('resize', updateTimelineProgress)
    }
  }, [details?.package.slug])

  if (isLoading) {
    return <SafariLoaderOverlay />
  }

  if (error) {
    return (
      <main className="bg-white pt-28">
        <section className="section-padding">
          <div className="container-custom">
            <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
              <p className="text-2xl font-black">{t('tourDetails.loadErrorTitle')}</p>
              <p className="mt-3 text-sm leading-6">{error}</p>
              <Link className="btn-primary mt-7" to="/tours">{t('tourDetails.backToTours')}</Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (!details) {
    return (
      <main className="bg-white pt-28">
        <section className="section-padding">
          <div className="container-custom">
            <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-[#eadfd3] bg-[#fff8f3] px-6 py-10 text-center">
              <p className="text-2xl font-black text-ink">{t('tourDetails.notFoundTitle')}</p>
              <p className="mt-3 text-muted">{t('tourDetails.notFoundDescription')}</p>
              <Link className="btn-primary mt-7" to="/tours">{t('tourDetails.backToTours')}</Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const contentKey = getTourContentKey(details.package.slug)
  const tourPackage = getLocalizedPackage(t, details.package)
  const highlights = details.highlights.map((highlight, index) => getLocalizedHighlight(t, highlight, contentKey, index))
  const galleryImages = details.galleryImages
    .slice(0, 4)
    .map((image, index) => getLocalizedGalleryImage(t, image, contentKey, index))
  const itineraryDays = details.itineraryDays.map((day, index) => getLocalizedItineraryDay(t, day, contentKey, index))
  const locations = details.locations.map((location, index) => getLocalizedLocation(t, location, contentKey, index))
  const tourTitle = tourPackage.title
  const tourOverview = tourPackage.overview
  const heroImage = tourPackage.hero_image_url || tourPackage.main_image_url || fallbackTour.heroImage
  const bookingTour = packageDetailsToTour({ ...details, package: tourPackage, highlights, galleryImages, itineraryDays, locations })
  const activeGalleryImage = activeGalleryIndex === null ? null : galleryImages[activeGalleryIndex]

  const openGalleryImage = (index: number) => {
    setActiveGalleryIndex(index)
  }

  const closeGalleryImage = () => {
    setActiveGalleryIndex(null)
  }

  const moveGalleryImage = (direction: -1 | 1) => {
    setActiveGalleryIndex((currentIndex) => {
      if (currentIndex === null || galleryImages.length === 0) return currentIndex

      return (currentIndex + direction + galleryImages.length) % galleryImages.length
    })
  }

  const handleGalleryImageKeyDown = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    openGalleryImage(index)
  }

  return (
    <>
      <section className="hero-section min-h-[460px] md:min-h-[520px]" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="absolute inset-0 bg-dark/60" />
        <div className="container-custom relative z-10 flex min-h-[460px] flex-col justify-end pb-20 pt-32 text-white md:min-h-[520px] md:pb-24 md:pt-40">
          <h1 className="text-safe max-w-5xl text-4xl font-semibold leading-[1.08] md:text-5xl lg:text-6xl">{t('tourDetails.bucketList')}: {tourTitle}</h1>
          <div className="mt-5 flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-white/78 md:text-sm">
            <Link to="/" className="transition hover:text-primary">{t('tourDetails.breadcrumbHome')}</Link>
            <FiChevronRight className="text-white/45" />
            <Link to="/tours" className="transition hover:text-primary">{t('tourDetails.breadcrumbTours')}</Link>
            <FiChevronRight className="text-white/45" />
            <span className="text-safe min-w-0">{tourTitle}</span>
          </div>
        </div>
      </section>

      <div ref={tabSentinelRef} className="-mt-8 h-px" aria-hidden="true" />
      <div className={isTabStuck ? 'h-[57px] md:h-[65px]' : ''}>
        <div className={`transition-all duration-300 ease-out ${isTabStuck ? 'fixed left-0 right-0 top-[3.75rem] z-50 w-full md:top-[4.1rem]' : 'relative z-40 container-custom'}`}>
          <nav
            ref={tabNavRef}
            className={`relative grid min-w-0 grid-cols-4 overflow-hidden bg-white transition-all duration-300 ease-out ${
              isTabStuck ? 'rounded-none border-b border-border shadow-[0_8px_24px_rgba(17,24,39,0.07)]' : 'rounded-[1.15rem] border border-border/80 shadow-[0_18px_45px_rgba(17,24,39,0.08)]'
            }`}
            aria-label={t('tourDetails.sectionsAria')}
          >
            <span
              className="absolute bottom-0 left-0 h-0.5 w-1/4 bg-primary transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${activeTab * 100}%)` }}
            />
            {tabs.map(([label, href], index) => (
              <a
                key={label}
                className={`relative flex min-w-0 items-center justify-center px-2 py-3.5 text-center text-sm font-semibold transition hover:bg-primary/5 hover:text-primary md:px-5 md:py-4 md:text-base ${
                  activeTab === index ? 'text-primary' : 'text-ink'
                }`}
                href={href}
                onClick={() => setActiveTab(index)}
              >
                <span className="truncate">{label}</span>
                {index < tabs.length - 1 && <span className="absolute right-0 top-1/2 h-5 w-px -translate-y-1/2 bg-border" />}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <main className="section-padding section-blend-light pt-12 md:pt-14">
        <div className="container-custom grid min-w-0 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-12">
          <div className="min-w-0 space-y-12">
            <section id="overview" className="scroll-mt-28">
              <h2 className="content-title text-safe">{t('tourDetails.overview')}</h2>
              <p className="text-safe mt-4 max-w-5xl text-lg font-normal leading-8 text-muted md:leading-9">{tourOverview}</p>
            </section>

            {galleryImages.length > 0 ? (
              <section id="gallery" className="scroll-mt-28">
                <h2 className="content-title text-safe">{t('tourDetails.gallery')}</h2>
                <div className="mt-6 grid grid-cols-[0.95fr_1fr_0.95fr] grid-rows-[9.5rem_9.5rem] gap-2 sm:grid-rows-[12rem_12rem] sm:gap-4 md:grid-rows-[240px_240px] md:gap-5">
                  {galleryImages.map((image, index) => {
                    const classes = [
                      'row-span-2 h-full',
                      'col-span-2 h-full',
                      'h-full',
                      'h-full',
                    ]
                    const imagePositions = ['object-center', 'object-center', 'object-[50%_55%]', 'object-[50%_58%]']

                    return (
                      <div
                        key={image.id}
                        role="button"
                        tabIndex={0}
                        className={`group max-w-full cursor-pointer overflow-hidden rounded-[1.15rem] shadow-[0_18px_45px_rgba(17,24,39,0.08)] transition duration-300 hover:shadow-[0_22px_55px_rgba(17,24,39,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 sm:rounded-[1.5rem] md:rounded-[2rem] ${classes[index] ?? 'h-full'}`}
                        onClick={() => openGalleryImage(index)}
                        onKeyDown={(event) => handleGalleryImageKeyDown(event, index)}
                        aria-label={t('tourDetails.openGalleryImage', { title: tourTitle, number: index + 1 })}
                      >
                        <img
                          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${imagePositions[index] ?? 'object-center'}`}
                          src={image.image_url}
                          alt={image.alt_text || image.caption || t('tourDetails.galleryImageAlt', { title: tourTitle, number: index + 1 })}
                        />
                      </div>
                    )
                  })}
                </div>
              </section>
            ) : null}

            {highlights.length > 0 ? (
              <section id="highlights" className="scroll-mt-28">
                <h2 className="content-title text-safe">{t('tourDetails.tourHighlights')}</h2>
                <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-2">
                  {highlights.map((highlight) => (
                    <div key={highlight.id} className="flex min-w-0 items-start gap-3 rounded-2xl border border-border/75 bg-white px-4 py-4 text-muted shadow-[0_14px_34px_rgba(17,24,39,0.04)]">
                      <FiCheckCircle className="mt-1 shrink-0 text-primary/90" />
                      <div className="min-w-0">
                        <p className="text-safe font-medium text-ink">{highlight.title}</p>
                        {highlight.description ? (
                          <p className="text-safe mt-1 text-sm leading-6 text-muted">{highlight.description}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {itineraryDays.length > 0 ? (
              <section id="itinerary" className="scroll-mt-28">
                <h2 className="content-title text-safe">{t('tourDetails.dayByDay')}</h2>
                <div ref={itineraryTimelineRef} className="relative mt-7 max-w-full space-y-12 overflow-hidden">
                  <span className="absolute bottom-6 left-6 top-6 w-px bg-border" aria-hidden="true" />
                  <span
                    className="absolute left-6 top-6 w-px origin-top bg-primary/80 shadow-[0_0_16px_rgba(251,119,13,0.24)]"
                    style={{ height: `calc((100% - 3rem) * ${timelineProgress})` }}
                    aria-hidden="true"
                  />
                  {itineraryDays.map((day, index) => (
                    <ItineraryDayArticle
                      key={day.id}
                      day={day}
                      index={index}
                      tourTitle={tourTitle}
                      markerRef={(element) => {
                        dayMarkerRefs.current[index] = element
                      }}
                    />
                  ))}
                </div>
              </section>
            ) : null}

          </div>

          <aside className="tour-booking-sticky self-start lg:sticky lg:top-[150px]">
            <div className="card min-w-0 border-border/80 p-7 text-center shadow-[0_22px_55px_rgba(17,24,39,0.08)] md:p-8">
              <p className="text-safe text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">{t('tourDetails.price')}</p>
              <h2 className="mt-3 flex max-w-full flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-2xl font-semibold text-primary">
                <span>{t('common.from')}</span>
                <span className="currency-value max-w-full overflow-hidden text-ellipsis">{formatCurrency(tourPackage.price_from_usd)}</span>
              </h2>
              <p className="text-safe mt-2 text-sm leading-6 text-muted">{t('tourDetails.quote')}</p>
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                <FaCheck /> {t('tourDetails.instant')}
              </div>
              <div className="mt-7 grid min-w-0 grid-cols-2 gap-3 text-sm leading-5 text-muted">
                <span className="text-safe flex items-center justify-center gap-2"><FaShieldHeart className="shrink-0 text-primary" /> {t('tourDetails.secure')}</span>
                <span className="text-safe flex items-center justify-center gap-2"><FaCheck className="shrink-0 text-primary" /> {t('tourDetails.fees')}</span>
              </div>
              <button className="btn-primary mt-7 w-full justify-center" type="button" onClick={() => onBook(bookingTour)}>{t('tourDetails.bookThisTour')} <FiArrowRight /></button>
              <div className="mt-8 text-sm">
                <p className="text-safe text-muted">{t('tourDetails.needHelp')}</p>
                <a className="text-safe mt-2 flex items-center justify-center gap-2 font-semibold text-primary transition hover:text-primary/80" href="tel:+256703543027">
                  <FiPhone /> +256 703 543027
                </a>
              </div>
            </div>
          </aside>
        </div>
        <div className="container-custom mt-12">
          <TourRouteMap locations={locations} mapStyle={tourPackage.map_style} />
        </div>
      </main>

      {activeGalleryImage && (
        <div className="fixed inset-0 z-[120] flex h-screen w-screen items-center justify-center bg-black/78 px-4 pb-28 pt-24 md:grid md:place-items-center md:px-8 md:pb-8 md:pt-28" onClick={closeGalleryImage}>
          <button
            type="button"
            className="fixed right-4 top-24 z-[130] grid h-12 w-12 place-items-center rounded-full bg-white text-2xl text-ink shadow-[0_16px_38px_rgba(0,0,0,0.28)] transition hover:bg-primary hover:text-white md:right-7 md:top-24"
            aria-label={t('tourDetails.closeGalleryImage')}
            onClick={closeGalleryImage}
          >
            <FiX />
          </button>
          {galleryImages.length > 1 ? (
            <>
              <button
                type="button"
                className="fixed left-7 top-1/2 z-[130] hidden h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-white text-2xl text-ink shadow-[0_16px_38px_rgba(0,0,0,0.28)] transition hover:bg-primary hover:text-white md:grid"
                aria-label={t('gallery.previous')}
                onClick={(event) => {
                  event.stopPropagation()
                  moveGalleryImage(-1)
                }}
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                className="fixed right-7 top-1/2 z-[130] hidden h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-white text-2xl text-ink shadow-[0_16px_38px_rgba(0,0,0,0.28)] transition hover:bg-primary hover:text-white md:grid"
                aria-label={t('gallery.next')}
                onClick={(event) => {
                  event.stopPropagation()
                  moveGalleryImage(1)
                }}
              >
                <FiChevronRight />
              </button>
            </>
          ) : null}
          <div className="flex max-w-full flex-col items-center gap-4" onClick={(event) => event.stopPropagation()}>
            <img
              className="max-h-[calc(100vh-18rem)] max-w-[calc(100vw-2rem)] rounded-[1.25rem] object-contain shadow-none md:max-h-[calc(100vh-8.5rem)] md:max-w-[calc(100vw-4rem)]"
              src={activeGalleryImage.image_url}
              alt={activeGalleryImage.alt_text || activeGalleryImage.caption || t('tourDetails.galleryImageAlt', { title: tourTitle, number: (activeGalleryIndex ?? 0) + 1 })}
            />
            {galleryImages.length > 1 ? (
              <div className="flex items-center justify-center gap-5 md:hidden">
                <button
                  type="button"
                  className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl text-ink shadow-[0_16px_38px_rgba(0,0,0,0.28)] transition hover:bg-primary hover:text-white"
                  aria-label={t('gallery.previous')}
                  onClick={() => moveGalleryImage(-1)}
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl text-ink shadow-[0_16px_38px_rgba(0,0,0,0.28)] transition hover:bg-primary hover:text-white"
                  aria-label={t('gallery.next')}
                  onClick={() => moveGalleryImage(1)}
                >
                  <FiChevronRight />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  )
}

type ItineraryDayArticleProps = {
  day: TourItineraryDayWithDetails
  index: number
  tourTitle: string
  markerRef: (element: HTMLDivElement | null) => void
}

function ItineraryDayArticle({ day, index, tourTitle, markerRef }: ItineraryDayArticleProps) {
  const { t } = useTranslation()
  const dayImages = day.images.slice(0, 2).map((image) => image.image_url)
  const fallbackImages = [
    fallbackDayImages[index % fallbackDayImages.length],
    fallbackDayImages[(index + 1) % fallbackDayImages.length],
  ]
  const sliderImages = dayImages.length > 0 ? dayImages : fallbackImages

  return (
    <article className="relative grid min-w-0 max-w-full grid-cols-[48px_minmax(0,1fr)] gap-4 sm:grid-cols-[56px_minmax(0,1fr)] sm:gap-5">
      <div
        ref={markerRef}
        className="relative z-10 grid h-12 w-12 place-items-center rounded-full border-[0.32rem] border-white bg-primary text-base font-semibold text-ink shadow-[0_12px_26px_rgba(251,119,13,0.22)]"
      >
        {day.day_number}
      </div>
      <div className="min-w-0 max-w-full pb-1">
        <h3 className="text-safe text-lg font-semibold leading-7 text-ink md:text-xl">{t('tourDetails.day')} {day.day_number}: {day.title}</h3>
        {day.overview ? <p className="text-safe mt-3 max-w-5xl text-base font-normal leading-7 text-muted md:leading-8">{day.overview}</p> : null}
        {day.activities.length > 0 ? (
          <>
            <p className="text-safe mt-4 text-sm font-medium text-ink">{t('tourDetails.activities')}:</p>
            <ul className="mt-3 grid max-w-full gap-x-12 gap-y-3 text-sm text-ink md:grid-flow-col md:grid-rows-3 md:auto-cols-fr md:text-[0.95rem]">
              {day.activities.map((activity) => (
                <li key={activity.id} className="text-safe flex min-w-0 items-start gap-3">
                  <FiCheckCircle className="mt-0.5 shrink-0 text-primary/90" />
                  <span className="font-medium leading-6 text-ink">{activity.title}</span>
                  {activity.description ? <span className="text-safe leading-6 text-muted">: {activity.description}</span> : null}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {day.accommodation_name ? (
          <p className="text-safe mt-4 text-sm leading-6 text-muted">{t('tourDetails.accommodation')}: {day.accommodation_name}</p>
        ) : null}
        {sliderImages.length > 0 ? <DayImageSlider images={sliderImages} title={t('tourDetails.dayImageTitle', { title: tourTitle, number: day.day_number })} /> : null}
      </div>
    </article>
  )
}

type DayImageSliderProps = {
  images: string[]
  title: string
}

function DayImageSlider({ images, title }: DayImageSliderProps) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [visibleSlides, setVisibleSlides] = useState(2)
  const safeImages = images.length >= 2 ? images : [...images, ...images]
  const sliderImages = [...safeImages, ...safeImages.slice(0, visibleSlides)]

  useEffect(() => {
    const updateVisibleSlides = () => {
      setVisibleSlides(window.matchMedia('(min-width: 640px)').matches ? 2 : 1)
    }

    updateVisibleSlides()
    window.addEventListener('resize', updateVisibleSlides)

    return () => window.removeEventListener('resize', updateVisibleSlides)
  }, [])

  useEffect(() => {
    if (safeImages.length <= visibleSlides) return

    const timer = window.setInterval(() => {
      setIsTransitioning(true)
      setActiveIndex((current) => current + 1)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [safeImages.length, visibleSlides])

  useEffect(() => {
    setIsTransitioning(false)
    setActiveIndex(0)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setIsTransitioning(true))
    })
  }, [visibleSlides])

  const handleTransitionEnd = () => {
    if (activeIndex < safeImages.length) return

    setIsTransitioning(false)
    setActiveIndex(0)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setIsTransitioning(true))
    })
  }

  return (
    <div className="mt-5 max-w-full overflow-hidden rounded-[1.2rem]" aria-label={t('tourDetails.dayImagesAria', { title })}>
      <div
        className={`flex ${isTransitioning ? 'transition-transform duration-700 ease-out' : ''}`}
        style={{ transform: `translateX(-${activeIndex * (100 / visibleSlides)}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {sliderImages.map((image, index) => (
          <div key={`${image}-${index}`} className="shrink-0 basis-full px-1.5 sm:basis-1/2">
            <img
              className="h-48 w-full rounded-[1rem] object-cover shadow-[0_12px_30px_rgba(17,24,39,0.08)] sm:h-44 md:h-52"
              src={image}
              alt={t('tourDetails.dayImageAlt', { title, number: index + 1 })}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function packageDetailsToTour(details: TourPackageDetails): Tour {
  const tourPackage = details.package
  const galleryImages = details.galleryImages.map((image) => image.image_url)
  const heroImage = tourPackage.hero_image_url || tourPackage.main_image_url || fallbackTour.heroImage
  const cardImage = tourPackage.main_image_url || tourPackage.hero_image_url || fallbackTour.image

  return {
    id: 1,
    title: tourPackage.title,
    slug: tourPackage.slug,
    price: `${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(tourPackage.price_from_usd)}`,
    priceUSD: tourPackage.price_from_usd,
    duration: String(tourPackage.duration_days),
    destination: tourPackage.category,
    tripLevel: fallbackTour.tripLevel,
    bestSeason: fallbackTour.bestSeason,
    rating: fallbackTour.rating,
    reviewCount: fallbackTour.reviewCount,
    shortDescription: tourPackage.short_description,
    overview: tourPackage.overview,
    image: cardImage,
    heroImage,
    galleryImages: galleryImages.length > 0 ? galleryImages : [cardImage, heroImage],
    highlights: details.highlights.map((highlight) => highlight.title),
    itineraryDays: details.itineraryDays.map<ItineraryDay>((day) => ({
      day: String(day.day_number),
      title: day.title,
      description: day.overview,
      activities: day.activities.map((activity) => activity.title),
      details: day.accommodation_name ?? '',
    })),
  }
}
