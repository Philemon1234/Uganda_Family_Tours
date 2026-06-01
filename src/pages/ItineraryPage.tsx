import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaCheck, FaShieldHeart } from 'react-icons/fa6'
import { FiArrowRight, FiCheckCircle, FiChevronRight, FiPhone, FiX } from 'react-icons/fi'
import { SafariLoaderOverlay } from '../components/SafariTrailLoader'
import { tours, type ItineraryDay, type Tour } from '../data/tours'
import { useLocale } from '../context/LocaleContext'
import { getTourPackageDetailsBySlug } from '../services/publicTourService'
import type { TourPackageDetails, TourItineraryDayWithDetails } from '../types/tourPackage'
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
  const [activeGalleryImage, setActiveGalleryImage] = useState<string | null>(null)

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
          setError(message || 'Unable to load tour package details.')
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
  }, [slug])

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
              <p className="text-2xl font-black">Unable to load tour package</p>
              <p className="mt-3 text-sm leading-6">{error}</p>
              <Link className="btn-primary mt-7" to="/tours">Back to tours</Link>
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
              <p className="text-2xl font-black text-ink">Tour package not found.</p>
              <p className="mt-3 text-muted">This package may no longer be available.</p>
              <Link className="btn-primary mt-7" to="/tours">Back to tours</Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const tourPackage = details.package
  const tourTitle = tourPackage.title
  const tourOverview = tourPackage.overview
  const heroImage = tourPackage.hero_image_url || tourPackage.main_image_url || fallbackTour.heroImage
  const galleryImages = details.galleryImages.slice(0, 4)
  const bookingTour = packageDetailsToTour(details)

  const openGalleryImage = (image: string) => {
    setActiveGalleryImage(image)
  }

  return (
    <>
      <section className="hero-section min-h-[500px]" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="absolute inset-0 bg-black/62" />
        <div className="container-custom relative z-10 flex min-h-[500px] flex-col justify-end pb-24 pt-36 text-white md:pb-28 md:pt-40">
          <h1 className="text-safe max-w-5xl text-4xl font-bold leading-tight md:text-6xl">{t('tourDetails.bucketList')}: {tourTitle}</h1>
          <div className="mt-6 flex min-w-0 flex-wrap items-center gap-2 text-sm font-semibold text-white/80 md:text-base">
            <Link to="/" className="hover:text-primary">{t('tourDetails.breadcrumbHome')}</Link>
            <FiChevronRight className="text-white/55" />
            <Link to="/tours" className="hover:text-primary">{t('tourDetails.breadcrumbTours')}</Link>
            <FiChevronRight className="text-white/55" />
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
              isTabStuck ? 'rounded-none border-b border-border shadow-[0_8px_24px_rgba(17,24,39,0.08)]' : 'rounded-card shadow-soft'
            }`}
            aria-label="Tour sections"
          >
            <span
              className="absolute bottom-0 left-0 h-0.5 w-1/4 bg-primary transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${activeTab * 100}%)` }}
            />
            {tabs.map(([label, href], index) => (
              <a
                key={label}
                className={`relative flex min-w-0 items-center justify-center px-2 py-4 text-center text-sm font-medium transition hover:text-primary md:px-5 md:py-5 md:text-base ${
                  activeTab === index ? 'text-primary' : 'text-ink'
                }`}
                href={href}
                onClick={() => setActiveTab(index)}
              >
                <span className="truncate">{label}</span>
                {index < tabs.length - 1 && <span className="absolute right-0 top-1/2 h-5 w-px -translate-y-1/2 bg-primary/45" />}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <main className="section-padding section-blend-light pt-14">
        <div className="container-custom grid min-w-0 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-10">
            <section id="overview" className="scroll-mt-28">
              <h2 className="content-title text-safe">{t('tourDetails.overview')}</h2>
              <p className="text-safe mt-4 max-w-5xl text-lg leading-8 text-muted">{tourOverview}</p>
            </section>

            {galleryImages.length > 0 ? (
              <section id="gallery" className="scroll-mt-28">
                <h2 className="content-title text-safe">{t('tourDetails.gallery')}</h2>
                <div className="mt-5 grid gap-5 md:grid-cols-[0.95fr_1fr_0.95fr] md:grid-rows-[240px_240px]">
                  {galleryImages.map((image, index) => {
                    const classes = [
                      'h-80 md:row-span-2 md:h-full',
                      'h-64 md:col-span-2 md:h-full',
                      'h-64 md:h-full',
                      'h-64 md:h-full',
                    ]

                    return (
                      <button
                        key={image.id}
                        type="button"
                        className={`group max-w-full overflow-hidden rounded-2xl ${classes[index] ?? 'h-64 md:h-full'}`}
                        onClick={() => openGalleryImage(image.image_url)}
                        aria-label={`Open ${tourTitle} gallery image ${index + 1}`}
                      >
                        <img
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          src={image.image_url}
                          alt={image.alt_text || image.caption || `${tourTitle} gallery ${index + 1}`}
                        />
                      </button>
                    )
                  })}
                </div>
              </section>
            ) : null}

            {details.highlights.length > 0 ? (
              <section id="highlights" className="scroll-mt-28">
                <h2 className="content-title text-safe">{t('tourDetails.tourHighlights')}</h2>
                <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
                  {details.highlights.map((highlight) => (
                    <div key={highlight.id} className="flex min-w-0 items-start gap-3 text-muted">
                      <FiCheckCircle className="mt-1 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="text-safe font-bold text-ink">{highlight.title}</p>
                        {highlight.description ? (
                          <p className="text-safe mt-1 text-sm leading-6 text-muted">{highlight.description}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {details.itineraryDays.length > 0 ? (
              <section id="itinerary" className="scroll-mt-28">
                <h2 className="content-title text-safe">{t('tourDetails.dayByDay')}</h2>
                <div ref={itineraryTimelineRef} className="relative mt-6 max-w-full space-y-10 overflow-hidden">
                  <span className="absolute bottom-6 left-6 top-6 w-0.5 bg-gray-200" aria-hidden="true" />
                  <span
                    className="absolute left-6 top-6 w-0.5 origin-top bg-primary shadow-[0_0_18px_rgba(233,121,45,0.28)]"
                    style={{ height: `calc((100% - 3rem) * ${timelineProgress})` }}
                    aria-hidden="true"
                  />
                  {details.itineraryDays.map((day, index) => (
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

          <aside className="tour-booking-sticky self-start">
            <div className="card min-w-0 p-8 text-center">
              <p className="text-safe text-xs font-black uppercase tracking-wide text-ink">{t('tourDetails.price')}</p>
              <h2 className="text-safe mt-3 text-2xl font-black text-primary">{t('common.from')} {formatCurrency(tourPackage.price_from_usd)}</h2>
              <p className="text-safe mt-2 text-sm text-muted">{t('tourDetails.quote')}</p>
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                <FaCheck /> {t('tourDetails.instant')}
              </div>
              <div className="mt-7 grid min-w-0 grid-cols-2 gap-4 text-sm text-muted">
                <span className="text-safe flex items-center justify-center gap-2"><FaShieldHeart className="shrink-0 text-primary" /> {t('tourDetails.secure')}</span>
                <span className="text-safe flex items-center justify-center gap-2"><FaCheck className="shrink-0 text-primary" /> {t('tourDetails.fees')}</span>
              </div>
              <button className="btn-primary mt-7 w-full justify-center" type="button" onClick={() => onBook(bookingTour)}>{t('tourDetails.bookThisTour')} <FiArrowRight /></button>
              <div className="mt-8 text-sm">
                <p className="text-safe text-muted">{t('tourDetails.needHelp')}</p>
                <a className="text-safe mt-2 flex items-center justify-center gap-2 font-black text-primary" href="tel:+256703543027">
                  <FiPhone /> +256 703 543027
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {activeGalleryImage && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setActiveGalleryImage(null)}>
          <button
            type="button"
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white text-2xl text-ink transition hover:bg-primary hover:text-ink"
            aria-label="Close gallery image"
            onClick={() => setActiveGalleryImage(null)}
          >
            <FiX />
          </button>
          <img
            className="max-h-[86vh] w-full max-w-6xl rounded-3xl object-contain shadow-2xl"
            src={activeGalleryImage}
            alt={`${tourTitle} enlarged gallery`}
            onClick={(event) => event.stopPropagation()}
          />
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
        className="relative z-10 grid h-12 w-12 place-items-center rounded-full border-4 border-white bg-primary text-base font-black text-ink shadow-orange"
      >
        {day.day_number}
      </div>
      <div className="min-w-0 max-w-full">
        <h3 className="text-safe text-lg font-black text-ink">{t('tourDetails.day')} {day.day_number}: {day.title}</h3>
        {day.overview ? <p className="text-safe mt-3 max-w-5xl text-base leading-7 text-muted">{day.overview}</p> : null}
        {day.activities.length > 0 ? (
          <>
            <p className="text-safe mt-3 text-sm font-black text-ink">{t('tourDetails.activities')}:</p>
            <ul className="mt-4 grid max-w-full gap-x-14 gap-y-4 text-sm text-ink md:grid-flow-col md:grid-rows-3 md:auto-cols-fr md:text-base">
              {day.activities.map((activity) => (
                <li key={activity.id} className="text-safe flex min-w-0 items-start gap-3">
                  <FiCheckCircle className="mt-0.5 shrink-0 text-primary" />
                  <span className="font-semibold leading-6 text-ink">{activity.title}</span>
                  {activity.description ? <span className="text-safe">: {activity.description}</span> : null}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {day.accommodation_name ? (
          <p className="text-safe mt-3 text-sm text-muted">Accommodation: {day.accommodation_name}</p>
        ) : null}
        {sliderImages.length > 0 ? <DayImageSlider images={sliderImages} title={`${tourTitle} Day ${day.day_number}`} /> : null}
      </div>
    </article>
  )
}

type DayImageSliderProps = {
  images: string[]
  title: string
}

function DayImageSlider({ images, title }: DayImageSliderProps) {
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
    <div className="mt-5 max-w-full overflow-hidden rounded-2xl" aria-label={`${title} images`}>
      <div
        className={`flex ${isTransitioning ? 'transition-transform duration-700 ease-out' : ''}`}
        style={{ transform: `translateX(-${activeIndex * (100 / visibleSlides)}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {sliderImages.map((image, index) => (
          <div key={`${image}-${index}`} className="shrink-0 basis-full px-1.5 sm:basis-1/2">
            <img
              className="h-48 w-full rounded-xl object-cover shadow-sm sm:h-44 md:h-52"
              src={image}
              alt={`${title} image ${index + 1}`}
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
    price: `From ${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(tourPackage.price_from_usd)}`,
    priceUSD: tourPackage.price_from_usd,
    duration: `${tourPackage.duration_days} Days`,
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
      day: `Day ${day.day_number}`,
      title: day.title,
      description: day.overview,
      activities: day.activities.map((activity) => activity.title),
      details: day.accommodation_name ? `Accommodation: ${day.accommodation_name}` : '',
    })),
  }
}
