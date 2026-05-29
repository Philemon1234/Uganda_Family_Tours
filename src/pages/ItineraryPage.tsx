import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { FaCheck, FaShieldHeart } from 'react-icons/fa6'
import { FiArrowRight, FiCheckCircle, FiPhone, FiX } from 'react-icons/fi'
import { tours } from '../data/tours'

type ItineraryPageProps = {
  onBook: () => void
}

export function ItineraryPage({ onBook }: ItineraryPageProps) {
  const { tourId } = useParams()
  const tabSentinelRef = useRef<HTMLDivElement>(null)
  const tabNavRef = useRef<HTMLElement>(null)
  const [isTabStuck, setIsTabStuck] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [activeGalleryImage, setActiveGalleryImage] = useState<string | null>(null)
  const tour = tours.find((item) => item.slug === tourId) ?? tours.find((item) => `${item.slug}-2` === tourId)

  const tabs = [
    ['Overview', '#overview'],
    ['Gallery', '#gallery'],
    ['Highlights', '#highlights'],
    ['Itinerary', '#itinerary'],
  ] as const

  useEffect(() => {
    const updateTabState = () => {
      if (!tabSentinelRef.current) return
      const tabTop = tabSentinelRef.current.getBoundingClientRect().top
      const nextTabStuck = tabTop <= 0
      setIsTabStuck(nextTabStuck)
    }

    updateTabState()
    window.addEventListener('scroll', updateTabState, { passive: true })
    window.addEventListener('resize', updateTabState)

    return () => {
      window.removeEventListener('scroll', updateTabState)
      window.removeEventListener('resize', updateTabState)
    }
  }, [])

  if (!tour) return <Navigate to="/tours" replace />

  const galleryMosaic = Array.from({ length: 4 }, (_, index) => tour.galleryImages[index % tour.galleryImages.length])

  const openGalleryImage = (image: string) => {
    setActiveGalleryImage(image)
  }

  return (
    <>
      <section className="hero-section min-h-[500px]" style={{ backgroundImage: `url(${tour.heroImage})` }}>
        <div className="absolute inset-0 bg-black/62" />
        <div className="container-custom relative z-10 flex min-h-[500px] flex-col justify-end pb-24 pt-36 text-white md:pb-28 md:pt-40">
          <h1 className="max-w-5xl text-4xl font-bold leading-tight md:text-6xl">Bucket list: {tour.title}</h1>
          <div className="mt-6 text-sm font-semibold text-white/80 md:text-base">
            <Link to="/" className="hover:text-primary">Home</Link> <span className="mx-2">&gt;</span>
            <Link to="/tours" className="hover:text-primary">Tours</Link> <span className="mx-2">&gt;</span>
            <span>{tour.title}</span>
          </div>
        </div>
      </section>

      <div ref={tabSentinelRef} className="-mt-8 h-px" aria-hidden="true" />
      <div className={isTabStuck ? 'h-[57px] md:h-[65px]' : ''}>
        <div className={`transition-all duration-300 ease-out ${isTabStuck ? 'fixed left-0 right-0 top-0 z-50 w-full' : 'relative z-40 container-custom'}`}>
          <nav
            ref={tabNavRef}
            className={`relative grid grid-cols-4 overflow-hidden bg-white transition-all duration-300 ease-out ${
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
                className={`relative flex items-center justify-center px-2 py-4 text-sm font-medium transition hover:text-primary md:px-5 md:py-5 md:text-base ${
                  activeTab === index ? 'text-primary' : 'text-ink'
                }`}
                href={href}
                onClick={() => setActiveTab(index)}
              >
                {label}
                {index < tabs.length - 1 && <span className="absolute right-0 top-1/2 h-5 w-px -translate-y-1/2 bg-primary/45" />}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <main className="section-padding bg-white pt-14">
        <div className="container-custom grid gap-12 lg:grid-cols-[1fr_400px]">
          <div className="space-y-10">
            <section id="overview" className="scroll-mt-28">
              <h2 className="content-title">Overview</h2>
              <p className="mt-4 max-w-5xl text-lg leading-8 text-muted">{tour.overview}</p>
            </section>

            <section id="gallery" className="scroll-mt-28">
              <h2 className="content-title">Gallery</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-[0.95fr_1fr_0.95fr] md:grid-rows-[240px_240px]">
                {galleryMosaic.map((image, index) => {
                  const classes = [
                    'h-80 md:row-span-2 md:h-full',
                    'h-64 md:col-span-2 md:h-full',
                    'h-64 md:h-full',
                    'h-64 md:h-full',
                  ]

                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`group overflow-hidden rounded-2xl ${classes[index]}`}
                      onClick={() => openGalleryImage(image)}
                      aria-label={`Open ${tour.title} gallery image ${index + 1}`}
                    >
                      <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={image} alt={`${tour.title} gallery ${index + 1}`} />
                    </button>
                  )
                })}
              </div>
            </section>

            <section id="highlights" className="scroll-mt-28">
              <h2 className="content-title">Tour Highlights</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {tour.highlights.map((highlight) => (
                  <div key={highlight} className="flex items-center gap-3 text-muted">
                    <FiCheckCircle className="shrink-0 text-primary" /> {highlight}
                  </div>
                ))}
              </div>
            </section>

            <section id="itinerary" className="scroll-mt-28">
              <h2 className="content-title">Day-by-Day Itinerary</h2>
              <div className="mt-6 space-y-10">
                {tour.itineraryDays.map((day) => (
                  <article key={day.title} className="grid gap-5 md:grid-cols-[56px_1fr]">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-white shadow-orange">
                      <FaCheck />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-ink">{day.day}: {day.title}</h3>
                      <p className="mt-3 max-w-5xl text-base leading-7 text-muted">{day.description}</p>
                      <p className="mt-3 text-sm font-black text-ink">Activities:</p>
                      <ul className="mt-2 space-y-1 text-sm text-muted">
                        {day.activities.map((activity) => <li key={activity} className="orange-bullet">{activity}</li>)}
                      </ul>
                      <p className="mt-3 text-sm text-muted">{day.details}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="md:sticky md:top-24 md:self-start">
            <div
              className="card p-8 text-center"
            >
              <p className="text-xs font-black uppercase tracking-wide text-ink">Price</p>
              <h2 className="mt-3 text-2xl font-black text-primary">Available on Request</h2>
              <p className="mt-2 text-sm text-muted">Contact us for a personalized quote</p>
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                <FaCheck /> Instant Confirmation
              </div>
              <div className="mt-7 grid grid-cols-2 gap-4 text-sm text-muted">
                <span className="flex items-center justify-center gap-2"><FaShieldHeart className="text-primary" /> Secure booking</span>
                <span className="flex items-center justify-center gap-2"><FaCheck className="text-primary" /> No booking fees</span>
              </div>
              <button className="btn-primary mt-7 w-full justify-center" type="button" onClick={onBook}>Book This Tour <FiArrowRight /></button>
              <div className="mt-8 text-sm">
                <p className="text-muted">Need assistance with your booking?</p>
                <a className="mt-2 flex items-center justify-center gap-2 font-black text-primary" href="tel:+256703543027">
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
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white text-2xl text-ink transition hover:bg-primary hover:text-white"
            aria-label="Close gallery image"
            onClick={() => setActiveGalleryImage(null)}
          >
            <FiX />
          </button>
          <img
            className="max-h-[86vh] w-full max-w-6xl rounded-3xl object-contain shadow-2xl"
            src={activeGalleryImage}
            alt={`${tour.title} enlarged gallery`}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
