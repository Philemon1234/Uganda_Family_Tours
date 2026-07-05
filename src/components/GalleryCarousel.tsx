import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { galleryImages } from '../data/gallery'
import type { EditableImage } from '../types/homeCustomization'

export function GalleryCarousel({ images }: { images?: EditableImage[] }) {
  const { t } = useTranslation()
  const baseImages = images && images.length > 0
    ? images.map((image) => ({ src: image.src, alt: image.alt }))
    : galleryImages.map((image) => ({ src: image.src, alt: t(image.altKey) }))
  const slideCount = baseImages.length
  const slides = useMemo(() => [...baseImages, ...baseImages, ...baseImages], [baseImages])
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
    if (event.button !== 0) return
    event.preventDefault()
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
    const dragThreshold = slideWidth * 0.14
    const slideDelta = Math.abs(dragDistance) > dragThreshold
      ? Math.max(-3, Math.min(3, Math.sign(-dragDistance) * Math.max(1, Math.round(Math.abs(dragDistance) / slideWidth))))
      : 0

    setIsDragging(false)
    setDragOffset(0)
    setIsTransitioning(true)
    event.currentTarget.releasePointerCapture(event.pointerId)
    if (slideDelta !== 0) {
      setIndex((current) => current + slideDelta)
    }
  }

  return (
    <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div
        ref={viewportRef}
        className={`overflow-hidden rounded-[1.75rem] bg-transparent select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
          {slides.map((image, slideIndex) => (
            <div key={`${image.alt}-${slideIndex}`} className="shrink-0 basis-full bg-transparent px-0 md:basis-1/2 md:px-2.5 lg:basis-1/3">
              <img className="h-80 w-full rounded-[1.75rem] object-cover pointer-events-none" src={image.src} alt={image.alt} draggable="false" />
            </div>
          ))}
        </div>
      </div>
      <button className="carousel-button left-3" type="button" aria-label={t('gallery.previous')} onClick={() => move(-1)}>
        <FiArrowLeft />
      </button>
      <button className="carousel-button right-3" type="button" aria-label={t('gallery.next')} onClick={() => move(1)}>
        <FiArrowRight />
      </button>
      <div className="mt-6 flex justify-center gap-2">
        {baseImages.map((_, dotIndex) => (
          <button
            key={dotIndex}
            type="button"
            aria-label={t('gallery.goToSlide', { number: dotIndex + 1 })}
            className={`h-2.5 rounded-full transition-all duration-300 ${dotIndex === activeIndex ? 'w-7 bg-primary' : 'w-2.5 bg-gray-300'}`}
            onClick={() => goTo(dotIndex)}
          />
        ))}
      </div>
    </div>
  )
}
