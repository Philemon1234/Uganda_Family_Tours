import { useCallback, useEffect, useMemo, useState, type TransitionEvent } from 'react'
import { FaTripadvisor } from 'react-icons/fa'
import { FiArrowLeft, FiArrowRight, FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { reviews, type TripAdvisorReview } from '../data/reviews'
import { getPublishedTripAdvisorReviews } from '../services/tripAdvisorReviewService'
import { ReviewCard, ReviewStars } from './ReviewCard'
import { SectionHeader } from './SectionHeader'

const cloneCount = 3
const autoScrollMs = 4000

export function ReviewCarousel({ title, description }: { title?: string; description?: string } = {}) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [selectedReview, setSelectedReview] = useState<TripAdvisorReview | null>(null)
  const [liveReviews, setLiveReviews] = useState<TripAdvisorReview[]>(reviews)
  const loopedReviews = useMemo(
    () => [...liveReviews, ...liveReviews.slice(0, Math.min(cloneCount, liveReviews.length))],
    [liveReviews],
  )

  useEffect(() => {
    let isMounted = true

    async function loadReviews() {
      const importedReviews = await getPublishedTripAdvisorReviews()
      if (isMounted && importedReviews.length > 0) {
        setLiveReviews(importedReviews)
        setActiveIndex(0)
      }
    }

    void loadReviews()

    return () => {
      isMounted = false
    }
  }, [])

  const moveNext = useCallback(() => {
    if (liveReviews.length <= 1) {
      return
    }

    setIsTransitioning(true)
    setActiveIndex((index) => index + 1)
  }, [liveReviews.length])

  const movePrevious = useCallback(() => {
    if (liveReviews.length <= 1) {
      return
    }

    if (activeIndex === 0) {
      setIsTransitioning(false)
      setActiveIndex(liveReviews.length)
      window.setTimeout(() => {
        setIsTransitioning(true)
        setActiveIndex(liveReviews.length - 1)
      }, 20)
      return
    }

    setIsTransitioning(true)
    setActiveIndex((index) => index - 1)
  }, [activeIndex, liveReviews.length])

  useEffect(() => {
    if (selectedReview || liveReviews.length <= 1) {
      return
    }

    const intervalId = window.setInterval(moveNext, autoScrollMs)

    return () => window.clearInterval(intervalId)
  }, [liveReviews.length, moveNext, selectedReview])

  const handleTrackTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || activeIndex < liveReviews.length) {
      return
    }

    setIsTransitioning(false)
    setActiveIndex(0)
  }

  return (
    <section className="tripadvisor-reviews-section bg-white py-16 md:py-20" aria-label={title || t('home.reviewsTitle')}>
      <div className="container-custom">
        <SectionHeader
          title={title || t('home.reviewsTitle')}
          description={description || t('home.reviewsDescription')}
        />

        <div className="relative mt-9 pt-9">
          <button
            className="review-nav-button absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            type="button"
            aria-label="Previous reviews"
            onClick={movePrevious}
          >
            <FiArrowLeft />
          </button>

          <div className="review-carousel-viewport">
            <div
              className={`review-carousel-track ${isTransitioning ? 'review-carousel-track-smooth' : ''}`}
              style={{ transform: `translateX(calc(${activeIndex} * -1 * var(--review-step)))` }}
              onTransitionEnd={handleTrackTransitionEnd}
            >
              {loopedReviews.map((review, index) => (
                <div className="review-carousel-slide" key={`${review.id}-${index}`}>
                  <ReviewCard review={review} onOpen={setSelectedReview} />
                </div>
              ))}
            </div>
          </div>

          <button
            className="review-nav-button absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2"
            type="button"
            aria-label="Next reviews"
            onClick={moveNext}
          >
            <FiArrowRight />
          </button>
        </div>
      </div>

      {selectedReview ? (
        <ReviewModal review={selectedReview} onClose={() => setSelectedReview(null)} />
      ) : null}
    </section>
  )
}

function ReviewModal({ review, onClose }: { review: TripAdvisorReview; onClose: () => void }) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[9999] grid h-dvh w-screen place-items-center overflow-y-auto bg-black/72 px-4 py-5 backdrop-blur-lg sm:px-6 md:py-8" role="dialog" aria-modal="true" aria-labelledby="review-modal-title" onMouseDown={onClose}>
      <article className="relative my-auto max-h-[calc(100dvh-2.5rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 text-left text-ink shadow-[0_30px_90px_rgba(0,0,0,0.35)] md:max-h-[calc(100dvh-4rem)] md:p-8" onMouseDown={(event) => event.stopPropagation()}>
        <button className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-xl text-muted transition hover:bg-primary hover:text-white" type="button" aria-label="Close review" onClick={onClose}>
          <FiX />
        </button>

        <div className="flex items-start gap-4 pr-12">
          <img className="h-14 w-14 rounded-full object-cover" src={review.profileImage} alt={`${review.name} profile`} />
          <div>
            <h3 id="review-modal-title" className="text-xl font-black text-ink">{review.title}</h3>
            <p className="mt-1 text-sm font-bold text-muted">{review.name} · {review.date}</p>
            <div className="mt-3"><ReviewStars rating={review.rating} /></div>
          </div>
        </div>

        <p className="mt-6 text-base leading-8 text-[#1f2933]">{review.text}</p>
        <a className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[#008f5a]" href={review.sourceUrl} target="_blank" rel="noreferrer">
          <FaTripadvisor /> Open original review
        </a>
      </article>
    </div>
    ,
    document.body,
  )
}
