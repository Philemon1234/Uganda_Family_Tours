import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import type { HeroSliderContent } from '../types/heroSlider'
import { getCachedPublishedHeroSlider, getPublishedHeroSlider, subscribeToHeroSliderChanges } from '../services/heroSliderService'
import { isSafeHeroLink, heroPositionStyle } from '../utils/heroSlider'

export function HeroCarousel() {
  const { t } = useTranslation()
  const [configuration, setConfiguration] = useState<HeroSliderContent | null>(getCachedPublishedHeroSlider)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [index, setIndex] = useState(0)
  const [failedImages, setFailedImages] = useState<string[]>([])
  const [focused, setFocused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    let mounted = true
    let request = 0
    const load = async () => {
      const currentRequest = ++request
      try {
        const next = await getPublishedHeroSlider()
        if (mounted && currentRequest === request) {
          setConfiguration(next)
          setStatus('ready')
        }
      } catch {
        if (mounted && currentRequest === request) {
          console.warn('Unable to load published hero configuration.')
          setConfiguration(null)
          setStatus('error')
        }
      }
    }
    const onVisible = () => { setPageHidden(document.hidden); if (!document.hidden) void load() }
    void load()
    const unsubscribe = subscribeToHeroSliderChanges(() => void load())
    const refresh = window.setInterval(() => { if (!document.hidden) void load() }, 60000)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', load)
    return () => { mounted = false; unsubscribe(); window.clearInterval(refresh); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('focus', load) }
  }, [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(preference.matches)
    update(); preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  const slides = configuration?.slides.filter(slide => slide.is_active && !failedImages.includes(slide.image_url)) ?? []
  const activeIndex = slides.length ? index % slides.length : 0
  const active = slides[activeIndex]
  const autoplay = configuration?.autoplay ?? true
  const duration = configuration?.duration_seconds ?? 5
  const playing = autoplay && !focused && !reducedMotion && !pageHidden
  const hasFailedPublishedImages = configuration?.slides.some(slide => slide.is_active && failedImages.includes(slide.image_url))

  useEffect(() => {
    if (!playing || slides.length < 2) return
    const timer = window.setTimeout(() => setIndex(current => (current + 1) % slides.length), duration * 1000)
    return () => window.clearTimeout(timer)
  }, [playing, duration, slides.length, active?.id, index])

  if (!active) return (
    <section className="hero-section home-hero-section home-solid-section relative min-h-[92svh] bg-dark" aria-label="Featured safari experiences" aria-busy={status === 'loading'}>
      <div className="home-hero-content flex min-h-[92svh] items-center justify-center px-6 pb-32 pt-32 text-center text-sm text-white/60" role="status">
        {status === 'loading'
          ? <span className="sr-only">{t('home.hero.loading')}</span>
          : t(status === 'error' || hasFailedPublishedImages ? 'home.hero.unavailable' : 'home.hero.empty')}
      </div>
    </section>
  )

  const move = (direction: number) => setIndex(current => (current + direction + slides.length) % slides.length)
  const contentStyle = heroPositionStyle(active.text_position)

  return <section className="hero-section home-hero-section home-solid-section relative min-h-[92svh] overflow-hidden bg-dark" aria-label="Featured safari experiences" aria-roledescription="carousel"
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}
    onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) } if (event.key === 'ArrowRight') { event.preventDefault(); move(1) } }} tabIndex={0}
    onTouchStart={event => { const touch = event.touches[0]; touchStart.current = { x: touch.clientX, y: touch.clientY } }}
    onTouchEnd={event => { const start = touchStart.current; touchStart.current = null; if (!start) return; const touch = event.changedTouches[0]; const dx = touch.clientX - start.x; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(touch.clientY - start.y) * 1.5) move(dx > 0 ? -1 : 1) }}>
    {slides.map((slide, slideIndex) => <img key={`${slide.id}-${slide.image_url}`} src={slide.image_url} alt="" aria-hidden="true" loading={slideIndex === activeIndex ? 'eager' : 'lazy'} fetchPriority={slideIndex === activeIndex ? 'high' : 'auto'}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-in-out motion-reduce:transition-none ${slideIndex === activeIndex ? 'opacity-100' : 'opacity-0'}`}
      onError={() => setFailedImages(current => current.includes(slide.image_url) ? current : [...current, slide.image_url])} />)}
    <div className="absolute inset-0 bg-dark/30" />
    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-[#171719]/70 to-[#171719]" />
    <div className="home-hero-content relative z-10 flex min-h-[92svh] w-full flex-col px-6 pb-32 pt-32 text-white md:px-10 lg:px-16 lg:pb-28 lg:pt-44" style={contentStyle}>
      <div className="w-full max-w-3xl break-words [overflow-wrap:anywhere]" role="group" aria-roledescription="slide" aria-label={`Slide ${activeIndex + 1} of ${slides.length}`}>
        {active.pre_title && <p key={`${active.id}-kicker`} className="hero-kicker luxury-script text-3xl leading-none text-white/95 md:text-4xl">{active.pre_title}</p>}
        <h1 key={`${active.id}-title`} className="hero-title mt-2 text-[clamp(1.75rem,7vw,4.5rem)] font-normal leading-tight">{active.title}</h1>
        {active.subtitle && <p key={`${active.id}-subtitle`} className="hero-copy mt-5 text-base leading-7 text-white/90 md:text-lg md:leading-8">{active.subtitle}</p>}
        {active.button_text && isSafeHeroLink(active.button_url) && <a key={`${active.id}-action`} className="hero-action btn-primary mt-8 max-w-full whitespace-normal px-5 py-3 text-center text-[0.7rem] md:px-6 md:py-3.5 md:text-[0.76rem]" href={active.button_url} style={{ backgroundColor: '#FB770D' }}>{active.button_text} <FiArrowRight className="shrink-0" /></a>}
      </div>
    </div>
    {slides.length > 1 && <div className="absolute bottom-[calc(6rem+env(safe-area-inset-bottom))] left-6 z-20 hidden gap-3 md:left-10 lg:bottom-10 lg:left-16 lg:flex">
      <button type="button" className="grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-black/25 text-2xl text-white backdrop-blur-sm hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" onClick={() => move(-1)} aria-label="Previous slide"><FiChevronLeft /></button>
      <button type="button" className="grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-black/25 text-2xl text-white backdrop-blur-sm hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" onClick={() => move(1)} aria-label="Next slide"><FiChevronRight /></button>
    </div>}
  </section>
}
