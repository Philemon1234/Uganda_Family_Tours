import { useEffect, useMemo, useRef, useState } from 'react'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { galleryImages } from '../data/gallery'

export function GalleryCarousel() {
  const slideCount = galleryImages.length
  const slides = useMemo(() => [...galleryImages, ...galleryImages, ...galleryImages], [])
  const [index, setIndex] = useState(slideCount)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
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

  return (
    <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="overflow-hidden rounded-[1.75rem] bg-transparent">
        <div
          className={`flex [--slides-per-view:1] md:[--slides-per-view:2] lg:[--slides-per-view:3] ${
            isTransitioning ? 'transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]' : ''
          }`}
          style={{ transform: `translateX(calc(-${index} * 100% / var(--slides-per-view)))` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((image, slideIndex) => (
            <div key={`${image.alt}-${slideIndex}`} className="shrink-0 basis-full bg-transparent px-0 md:basis-1/2 md:px-2.5 lg:basis-1/3">
              <img className="h-80 w-full rounded-[1.75rem] object-cover" src={image.src} alt={image.alt} />
            </div>
          ))}
        </div>
      </div>
      <button className="carousel-button left-3" type="button" aria-label="Previous gallery image" onClick={() => move(-1)}>
        <FiArrowLeft />
      </button>
      <button className="carousel-button right-3" type="button" aria-label="Next gallery image" onClick={() => move(1)}>
        <FiArrowRight />
      </button>
      <div className="mt-6 flex justify-center gap-2">
        {galleryImages.map((_, dotIndex) => (
          <button
            key={dotIndex}
            type="button"
            aria-label={`Go to gallery slide ${dotIndex + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${dotIndex === activeIndex ? 'w-7 bg-primary' : 'w-2.5 bg-gray-300'}`}
            onClick={() => goTo(dotIndex)}
          />
        ))}
      </div>
    </div>
  )
}
