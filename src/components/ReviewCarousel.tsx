import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { reviews } from '../data/reviews'
import { ReviewCard } from './ReviewCard'

export function ReviewCarousel() {
  const { t } = useTranslation()
  const translatedReviews = reviews.map((review, index) => ({
    ...review,
    country: t(`reviews.items.${index}.country`, { defaultValue: review.country }),
    text: t(`reviews.items.${index}.text`, { defaultValue: review.text }),
  }))
  const slideCount = reviews.length
  const slides = useMemo(() => [...translatedReviews, ...translatedReviews, ...translatedReviews], [translatedReviews])
  const [index, setIndex] = useState(slideCount)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef(0)
  const resetTimer = useRef<number | null>(null)

  const activeIndex = ((index % slideCount) + slideCount) % slideCount

  const move = (direction: number) => {
    setIsTransitioning(true)
    setIndex((current) => current + direction)
  }

  const goTo = (nextIndex: number) => {
    setIsTransitioning(true)
    setIndex(slideCount + nextIndex)
  }

  useEffect(() => {
    if (isPaused) return

    const timer = window.setInterval(() => {
      move(1)
    }, 3000)

    return () => {
      window.clearInterval(timer)
      if (resetTimer.current) window.clearTimeout(resetTimer.current)
    }
  }, [isPaused])

  const resetLoopPosition = (nextIndex: number) => {
    setIsTransitioning(false)
    setIndex(nextIndex)

    if (resetTimer.current) window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => {
      setIsTransitioning(true)
    }, 50)
  }

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'transform') return

    if (index >= slideCount * 2) {
      resetLoopPosition(index - slideCount)
    }

    if (index < slideCount) {
      resetLoopPosition(index + slideCount)
    }
  }

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = event.clientX
    setDragOffset(0)
    setIsDragging(true)
    setIsPaused(true)
    setIsTransitioning(false)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const drag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setDragOffset(event.clientX - dragStartX.current)
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const viewportWidth = viewportRef.current?.clientWidth ?? 1
    const slidesPerView = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1
    const slideWidth = viewportWidth / slidesPerView
    const dragDistance = event.clientX - dragStartX.current
    const slideDelta = Math.max(-2, Math.min(2, Math.round(-dragDistance / slideWidth)))

    setIsDragging(false)
    setDragOffset(0)
    setIsTransitioning(true)
    if (slideDelta !== 0) {
      setIndex((current) => current + slideDelta)
    }
  }

  return (
    <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div
        ref={viewportRef}
        className={`overflow-hidden rounded-[1.5rem] bg-transparent select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className={`flex [--slides-per-view:1] md:[--slides-per-view:2] lg:[--slides-per-view:3] ${
            isTransitioning ? 'transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]' : ''
          }`}
          style={{
            touchAction: 'pan-y',
            transform: `translateX(calc(-${index} * 100% / var(--slides-per-view) + ${dragOffset}px))`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((review, slideIndex) => (
            <div key={`${review.name}-${slideIndex}`} className="shrink-0 basis-full bg-transparent px-0 md:basis-1/2 md:px-3 lg:basis-1/3">
              <ReviewCard {...review} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-7 flex justify-center gap-2">
        {translatedReviews.map((_, dotIndex) => (
          <button
            key={dotIndex}
            type="button"
            aria-label={`Go to review slide ${dotIndex + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${dotIndex === activeIndex ? 'w-7 bg-primary' : 'w-2.5 bg-gray-300'}`}
            onClick={() => goTo(dotIndex)}
          />
        ))}
      </div>
    </div>
  )
}
