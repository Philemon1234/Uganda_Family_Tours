import { useCallback, useEffect, useMemo, useRef, useState, type TransitionEvent } from 'react'
import { createPortal } from 'react-dom'
import { FaTripadvisor } from 'react-icons/fa'
import { FiArrowUpRight, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import { reviews, tripAdvisorUrl, type TripAdvisorReview } from '../data/reviews'
import { ReviewCard, ReviewStars } from './ReviewCard'

const AUTOSLIDE_INTERVAL_MS = 5000

function getSlidesPerView(width: number) {
  if (width >= 1024) return 4
  if (width >= 768) return 3
  if (width >= 640) return 2
  return 1
}

function getReviewParagraphs(text: string) {
  return text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
}

export function ReviewCarousel() {
  const [carouselIndex, setCarouselIndex] = useState(reviews.length)
  const [slidesPerView, setSlidesPerView] = useState(() => (typeof window === 'undefined' ? 4 : getSlidesPerView(window.innerWidth)))
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [selectedReviewIndex, setSelectedReviewIndex] = useState<number | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const resetTimerRef = useRef<number | null>(null)
  const slides = useMemo(() => [...reviews, ...reviews, ...reviews], [])
  const activeIndex = ((carouselIndex % reviews.length) + reviews.length) % reviews.length
  const selectedReview = selectedReviewIndex === null ? null : reviews[selectedReviewIndex]
  const averageRating = useMemo(() => {
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    return reviews.length ? (total / reviews.length).toFixed(1) : '0.0'
  }, [])

  const goTo = useCallback((nextIndex: number) => {
    setIsTransitioning(true)
    setCarouselIndex(reviews.length + nextIndex)
  }, [])

  const move = useCallback((direction: number) => {
    setIsTransitioning(true)
    setCarouselIndex((current) => current + direction)
  }, [])

  const openReview = useCallback((review: TripAdvisorReview) => {
    const nextIndex = reviews.findIndex((item) => item.id === review.id)
    setSelectedReviewIndex(nextIndex >= 0 ? nextIndex : 0)
  }, [])

  const moveModal = useCallback((direction: number) => {
    setSelectedReviewIndex((current) => {
      const index = current ?? 0
      return (index + direction + reviews.length) % reviews.length
    })
  }, [])

  const resetLoopPosition = (nextIndex: number) => {
    setIsTransitioning(false)
    setCarouselIndex(nextIndex)

    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current)
    resetTimerRef.current = window.setTimeout(() => {
      setIsTransitioning(true)
    }, 40)
  }

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'transform') return

    if (carouselIndex >= reviews.length * 2) {
      resetLoopPosition(carouselIndex - reviews.length)
    }

    if (carouselIndex < reviews.length) {
      resetLoopPosition(carouselIndex + reviews.length)
    }
  }

  useEffect(() => {
    function handleResize() {
      const nextSlidesPerView = getSlidesPerView(window.innerWidth)
      setSlidesPerView(nextSlidesPerView)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (selectedReviewIndex !== null) return

    const timer = window.setInterval(() => move(1), AUTOSLIDE_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [move, selectedReviewIndex])

  useEffect(() => {
    if (selectedReviewIndex === null) return

    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => closeButtonRef.current?.focus(), 40)

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedReviewIndex(null)
      if (event.key === 'ArrowLeft') moveModal(-1)
      if (event.key === 'ArrowRight') moveModal(1)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousBodyOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [moveModal, selectedReviewIndex])

  const reviewModal = selectedReview ? (
    <div
      className="fixed inset-0 z-[9999] grid h-screen w-screen place-items-center bg-black/78 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      onMouseDown={() => setSelectedReviewIndex(null)}
    >
      <div
        className="relative w-full max-w-3xl overflow-visible"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute left-0 top-1/2 z-20 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#e7ded3] bg-white text-xl text-[#008f5a] shadow-[0_10px_26px_rgba(0,0,0,0.18)] transition hover:bg-[#008f5a] hover:text-white max-sm:left-3 max-sm:translate-x-0"
          aria-label="Previous review"
          onClick={() => moveModal(-1)}
        >
          <FiChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          className="absolute right-0 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full border border-[#e7ded3] bg-white text-xl text-[#008f5a] shadow-[0_10px_26px_rgba(0,0,0,0.18)] transition hover:bg-[#008f5a] hover:text-white max-sm:right-3 max-sm:translate-x-0"
          aria-label="Next review"
          onClick={() => moveModal(1)}
        >
          <FiChevronRight aria-hidden="true" />
        </button>
        <div className="max-h-[88vh] overflow-hidden rounded-card bg-white text-ink shadow-[0_28px_90px_rgba(0,0,0,0.26)] transition duration-200">
          <div className="flex items-start justify-between gap-4 border-b border-border p-5 md:p-7">
            <div className="flex min-w-0 items-start gap-4">
              <img
                className="h-14 w-14 shrink-0 rounded-full object-cover"
                src={selectedReview.profileImage}
                alt={`${selectedReview.name} profile`}
              />
              <div className="min-w-0">
                <a
                  id="review-modal-title"
                  className="text-lg font-black leading-tight text-ink transition hover:text-[#008f5a] focus-visible:text-[#008f5a]"
                  href={selectedReview.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {selectedReview.name}
                </a>
                <p className="mt-1 text-sm font-bold text-muted">{selectedReview.date}</p>
                <div className="mt-3">
                  <ReviewStars rating={selectedReview.rating} label={`${selectedReview.rating} out of 5 TripAdvisor stars`} />
                </div>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f2f6f3] text-xl text-ink transition hover:bg-[#008f5a] hover:text-white"
              aria-label="Close review modal"
              onClick={() => setSelectedReviewIndex(null)}
            >
              <FiX aria-hidden="true" />
            </button>
          </div>
          <div className="max-h-[58vh] space-y-4 overflow-y-auto p-5 text-base leading-8 text-[#334155] md:p-7">
            <p className="text-lg font-black leading-7 text-ink">{selectedReview.title}</p>
            {getReviewParagraphs(selectedReview.text).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <section className="relative overflow-hidden bg-white py-16 md:py-20" aria-labelledby="tripadvisor-reviews-title">
        <div className="container-custom bg-white">
          <div className="text-center">
            <h2 id="tripadvisor-reviews-title" className="text-2xl font-black leading-tight text-ink md:text-4xl">
              What our customers say
            </h2>
            <span className="mx-auto mt-4 block h-1 w-16 rounded-full bg-[#008f5a]" aria-hidden="true" />
          </div>

        <div className="mt-10 p-0 md:flex md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex items-center gap-2 text-ink">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#00aa6c] text-xl text-white">
                <FaTripadvisor aria-hidden="true" />
              </span>
              <span className="text-lg font-black">Tripadvisor</span>
              <span className="hidden text-lg font-black sm:inline">Reviews</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-ink">{averageRating}</span>
              <ReviewStars rating={Math.round(Number(averageRating))} label={`${averageRating} average TripAdvisor rating`} />
              <span className="text-sm font-bold text-muted">({reviews.length})</span>
            </div>
          </div>

          <a
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-[0.45rem] bg-[#008f5a] px-5 py-3 text-sm font-medium text-white shadow-none transition hover:-translate-y-0.5 hover:bg-[#007a4e] md:mt-0"
            href={tripAdvisorUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Review Uganda Family Tours on TripAdvisor"
          >
            Review us on TripAdvisor
            <FiArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <div className="relative mt-5 bg-white md:mt-7">
          <button
            type="button"
            className="absolute left-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-xl text-[#008f5a] shadow-[0_14px_34px_rgba(17,24,39,0.14)] transition hover:bg-[#008f5a] hover:text-white md:left-0 md:h-12 md:w-12 md:-translate-x-1/2"
            aria-label="Previous TripAdvisor reviews"
            onClick={() => move(-1)}
          >
            <FiChevronLeft aria-hidden="true" />
          </button>

          <div className="overflow-hidden bg-white px-0.5 py-0">
            <div
              className={`flex bg-white ${isTransitioning ? 'transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]' : ''}`}
              style={{
                transform: `translateX(-${carouselIndex * (100 / slidesPerView)}%)`,
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {slides.map((review, slideIndex) => (
                <div
                  key={`${review.id}-${slideIndex}`}
                  className="shrink-0 bg-white px-2 md:px-3"
                  style={{ flexBasis: `${100 / slidesPerView}%` }}
                >
                  <ReviewCard review={review} onOpen={openReview} />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="absolute right-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-xl text-[#008f5a] shadow-[0_14px_34px_rgba(17,24,39,0.14)] transition hover:bg-[#008f5a] hover:text-white md:right-0 md:h-12 md:w-12 md:translate-x-1/2"
            aria-label="Next TripAdvisor reviews"
            onClick={() => move(1)}
          >
            <FiChevronRight aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 bg-white" aria-label="TripAdvisor review carousel slides">
          {reviews.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to TripAdvisor review slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-7 bg-[#008f5a]' : 'w-2.5 bg-[#d8ddd9]'}`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
        </div>
      </section>
      {reviewModal && createPortal(reviewModal, document.body)}
    </>
  )
}
