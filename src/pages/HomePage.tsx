import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaHandHoldingHeart, FaPeopleGroup, FaShieldHeart, FaSliders } from 'react-icons/fa6'
import { FiArrowRight, FiCamera, FiCompass, FiHeart, FiMap, FiMapPin, FiPlay, FiUsers, FiX } from 'react-icons/fi'
import type { Tour } from '../data/tours'
import { TourCard } from '../components/TourCard'
import { SectionHeader } from '../components/SectionHeader'
import { WhyTravelCard } from '../components/WhyTravelCard'
import { GalleryCarousel } from '../components/GalleryCarousel'
import { ReviewCarousel } from '../components/ReviewCarousel'
import { MotionReveal } from '../components/MotionReveal'
import { FooterImageBand } from '../components/FooterImageBand'
import { getPublishedTourPackages, subscribeToTourPackageChanges } from '../services/publicTourService'
import { packageToTour } from '../utils/tourPackageMapper'
import type { HomeCustomizationContent } from '../types/homeCustomization'
import heroOnloadImage from '../assets/on load.png'
// import heroImage from '../assets/gorilla-7708328_1920.jpg'
// import gorillaForestImage from '../assets/Africa-Gorilla-GettyImages-986556120.jpg'
// import elephantImage from '../assets/elephant-4736008_1280.jpg'
import storyThumbnail from '../assets/Thumbnail.png'
import homeIconOne from '../assets/UFT-Homepage-icons-01.png'
import homeIconTwo from '../assets/UFT-Homepage-icons-02.png'
import homeIconThree from '../assets/UFT-Homepage-icons-03.png'
import homeIconFour from '../assets/UFT-Favicon.png'
import journeyImage from '../assets/Africa-Gorilla-GettyImages-986556120.jpg'
import homeFooterImage from '../assets/footer/UFT Website Work-03.jpg'

type HomePageProps = {
  customization: HomeCustomizationContent
  onInquiry: () => void
}

const FEATURED_TOURS_LIMIT = 6
const mediaOrigin = 'https://yufat.org'
const heroVideoDesktop = `${mediaOrigin}/wp-content/uploads/2026/06/Uganda-Family-tours-banner.mp4`
const heroVideoMobile = `${mediaOrigin}/wp-content/uploads/2026/06/Uganda-Family-tours-banner-mobile.mp4`
const aboutVideo = `${mediaOrigin}/wp-content/uploads/2026/06/About-Uganda-Family-Tours.mp4`

const signatureExperienceIcons = [FiMapPin, FiCamera, FiCompass, FiUsers, FiMap, FiHeart]
// const heroSlides = [heroImage, gorillaForestImage, elephantImage, lionImage]

export function HomePage({ customization, onInquiry }: HomePageProps) {
  const { t } = useTranslation()
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([])
  const [isLoadingFeaturedTours, setIsLoadingFeaturedTours] = useState(true)
  const [featuredToursError, setFeaturedToursError] = useState('')
  const [isHeroVideoReady, setIsHeroVideoReady] = useState(false)
  const [isSignatureVideoOpen, setIsSignatureVideoOpen] = useState(false)
  const signatureVideoRef = useRef<HTMLVideoElement | null>(null)
  const signatureExperiences = signatureExperienceIcons.map((Icon, index) => ({
    Icon,
    icon: customization.signature.items[index]?.icon,
    title: customization.signature.items[index]?.title ?? t(`home.signature.items.${index}.title`),
    text: customization.signature.items[index]?.text ?? t(`home.signature.items.${index}.text`),
  }))

  useEffect(() => {
    let isMounted = true

    async function loadFeaturedTours() {
      setIsLoadingFeaturedTours(true)
      setFeaturedToursError('')

      try {
        const packages = await getPublishedTourPackages({ limit: FEATURED_TOURS_LIMIT })

        if (isMounted) {
          setFeaturedTours(packages.map(packageToTour))
        }
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : String(loadError)

        if (isMounted) {
          setFeaturedTours([])
          setFeaturedToursError(message || t('home.featured.errorMessage'))
        }
      } finally {
        if (isMounted) {
          setIsLoadingFeaturedTours(false)
        }
      }
    }

    void loadFeaturedTours()
    const unsubscribe = subscribeToTourPackageChanges(() => {
      void loadFeaturedTours()
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const headLinks: HTMLLinkElement[] = []

    function addHeadLink(rel: string, href: string, attributes: Record<string, string> = {}) {
      const selector = `link[rel="${rel}"][href="${href}"]`
      const existingLink = document.head.querySelector(selector)

      if (existingLink) return

      const link = document.createElement('link')
      link.rel = rel
      link.href = href
      Object.entries(attributes).forEach(([name, value]) => link.setAttribute(name, value))
      document.head.appendChild(link)
      headLinks.push(link)
    }

    addHeadLink('dns-prefetch', '//yufat.org')
    addHeadLink('preconnect', mediaOrigin, { crossorigin: '' })
    addHeadLink('preload', heroVideoMobile, {
      as: 'video',
      type: 'video/mp4',
      media: '(max-width: 767px)',
    })
    addHeadLink('preload', heroVideoDesktop, {
      as: 'video',
      type: 'video/mp4',
      media: '(min-width: 768px)',
    })

    return () => {
      headLinks.forEach((link) => link.remove())
    }
  }, [])

  useEffect(() => {
    if (!isSignatureVideoOpen) return

    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSignatureVideoOpen(false)
        signatureVideoRef.current?.pause()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousBodyOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSignatureVideoOpen])

  // useEffect(() => {
  //   const timer = window.setInterval(() => {
  //     setActiveHeroSlide((currentSlide) => (currentSlide + 1) % heroSlides.length)
  //   }, 5000)
  //
  //   return () => window.clearInterval(timer)
  // }, [])

  return (
    <>
      <section className="hero-section home-hero-section min-h-[92vh] bg-dark">
        <picture
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ease-out ${
            isHeroVideoReady ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <img
            className="h-full w-full object-cover"
            src={heroOnloadImage}
            alt=""
            aria-hidden="true"
            loading="eager"
          />
        </picture>
        <video
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out ${
            isHeroVideoReady ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={heroOnloadImage}
          aria-hidden="true"
          onLoadedData={() => setIsHeroVideoReady(true)}
        >
          <source src={heroVideoMobile} type="video/mp4" media="(max-width: 767px)" />
          <source src={heroVideoDesktop} type="video/mp4" />
        </video>
        {/*
        {heroSlides.map((image, index) => (
          <img
            key={image}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-in-out ${
              activeHeroSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
            src={image}
            alt=""
            aria-hidden="true"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        ))}
        */}
        <div className="absolute inset-0 bg-dark/20" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-[#171719]/70 to-[#171719] md:h-40" />
        <div className="container-custom home-hero-content relative z-10 flex min-h-[92vh] flex-col items-center justify-center px-4 pb-20 pt-40 text-center text-white lg:pb-24 lg:pt-44">
          <div className="w-full">
            <p className="hero-kicker luxury-script text-3xl leading-none text-white/95 md:text-4xl">{customization.hero.kicker || t('home.hero.kicker')}</p>
            <h1 className="hero-title mx-auto mt-1 max-w-5xl text-4xl font-bold leading-tight md:text-7xl">{customization.hero.title || t('home.hero.title')}</h1>
            <p className="hero-copy mx-auto mt-5 max-w-2xl text-base leading-8 text-white/82 md:text-lg">
              {customization.hero.subtitle || t('home.hero.subtitle')}
            </p>
            <Link className="hero-action btn-primary btn-on-dark mt-8" to={customization.hero.cta.href || '/tours'} style={{ backgroundColor: customization.hero.cta.color }}>{customization.hero.cta.text || t('home.hero.primaryCta')} <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      <section className="bg-[#171719] pb-20 pt-8 md:pb-28 md:pt-12">
        <div className="container-custom">
          <MotionReveal>
            <div className="mx-auto mb-14 flex w-full max-w-xl items-center justify-center gap-5 px-4 md:mb-16 md:gap-7">
              {[
                customization.story.badges[0] ?? { src: homeIconOne, alt: t('home.hero.badgeAlt.service') },
                customization.story.badges[1] ?? { src: homeIconTwo, alt: t('home.hero.badgeAlt.planning') },
                customization.story.badges[2] ?? { src: homeIconThree, alt: t('home.hero.badgeAlt.support') },
                customization.story.badges[3] ?? { src: homeIconFour, alt: t('home.hero.badgeAlt.brand') },
              ].map((item) => (
                <a
                  key={item.alt}
                  className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-[0_14px_34px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.28)] md:h-16 md:w-16"
                  href={item.href || '#'}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img className="max-h-10 w-auto object-contain md:max-h-11" src={item.src} alt={item.alt} />
                </a>
              ))}
            </div>
          </MotionReveal>
          <MotionReveal>
            <div className="mx-auto max-w-5xl text-center">
              <p className="luxury-script text-2xl leading-none text-white md:text-3xl">{customization.story.label || t('home.story.label')}</p>
              <h2 className="mx-auto mt-1 max-w-4xl text-xl font-black leading-tight text-white md:text-3xl">
                {customization.story.title || t('home.story.title')}
              </h2>
              <div className="mx-auto mt-8 max-w-4xl space-y-6 text-base leading-7 text-white md:text-lg md:leading-7">
                {(customization.story.paragraphs.length > 0 ? customization.story.paragraphs : [t('home.story.p1'), t('home.story.p2')]).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-padding bg-[#faf7f2]">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.25fr] lg:items-stretch">
            <MotionReveal className="h-full">
              <div className="relative h-full min-h-[24rem] overflow-hidden rounded-[1.75rem] bg-transparent shadow-[0_22px_55px_rgba(37,66,76,0.14)] lg:min-h-full">
                <button
                  className="group relative block h-full w-full overflow-hidden !rounded-[1.75rem] bg-transparent p-0 text-left"
                  type="button"
                  aria-label={t('home.signature.videoAria')}
                  onClick={() => {
                    setIsSignatureVideoOpen(true)
                    const video = signatureVideoRef.current

                    if (video) {
                      void video.play().catch(() => {
                        video.controls = true
                      })
                    }
                  }}
                >
                  <img
                    className="block h-full min-h-[24rem] w-full rounded-[inherit] object-cover transition duration-700 group-hover:scale-[1.035] lg:min-h-full"
                    src={customization.signature.image.src || storyThumbnail}
                    alt={customization.signature.image.alt || ''}
                    aria-hidden="true"
                    loading="lazy"
                  />
                  <span className="absolute bottom-6 right-6 hidden text-right text-white sm:block">
                    <span className="block text-2xl font-black leading-tight md:text-4xl">{customization.signature.founderName}</span>
                    <span className="block text-lg font-light leading-tight md:text-2xl">{customization.signature.founderRole}</span>
                  </span>
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-white bg-transparent text-2xl text-white shadow-none transition duration-300 group-hover:scale-110 group-hover:bg-white/10 md:h-20 md:w-20 md:text-3xl">
                      <FiPlay className="ml-1 fill-none stroke-[1.8]" />
                    </span>
                  </span>
                </button>
              </div>
            </MotionReveal>
            <MotionReveal className="h-full" delay={80}>
              <div className="flex h-full flex-col">
                <div className="max-w-4xl">
                  <p className="luxury-script text-2xl leading-none text-ink md:text-3xl">{customization.signature.title || t('home.signature.title')}</p>
                  <p className="mt-5 max-w-3xl text-base leading-7 text-muted">{customization.signature.description || t('home.signature.description')}</p>
                </div>
                <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-3">
                  {signatureExperiences.map(({ Icon, icon, title, text }) => (
                    <div key={title} className="group border-t border-[#ded2c4] px-1 py-4 transition hover:border-primary sm:py-5">
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-base text-white shadow-[0_12px_28px_rgba(251,119,13,0.22)] sm:h-11 sm:w-11 sm:text-lg">
                          {icon?.src ? <img src={icon.src} alt={icon.alt} className="h-5 w-5 object-contain" /> : <Icon />}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-safe text-sm font-black leading-snug text-ink sm:text-base">{title}</h3>
                          <p className="text-safe mt-2 text-xs leading-5 text-muted sm:text-sm sm:leading-6">{text}</p>
                        </div>
                      </div>
                      <span className="mt-4 block h-px w-10 bg-primary/40 transition group-hover:w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </MotionReveal>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <SectionHeader
            label={customization.featuredTours.label || t('home.featured.label')}
            title={customization.featuredTours.title || t('home.featured.title')}
            description={customization.featuredTours.description || t('home.featured.description')}
          />
          {isLoadingFeaturedTours ? (
            <div className="mt-12 grid items-stretch gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3" aria-label={t('common.loading')}>
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[520px] animate-pulse rounded-[1.75rem] border border-[#eadfd3] bg-slate-100"
                />
              ))}
            </div>
          ) : featuredToursError ? (
            <div className="mx-auto mt-12 max-w-3xl rounded-[1.75rem] border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
              <p className="text-lg font-bold">{t('home.featured.errorTitle')}</p>
              <p className="mt-2 text-sm leading-6">{featuredToursError}</p>
            </div>
          ) : featuredTours.length === 0 ? (
            <div className="mx-auto mt-12 max-w-3xl rounded-[1.75rem] border border-dashed border-[#eadfd3] bg-[#fff8f3] px-6 py-10 text-center">
              <p className="text-xl font-black text-ink">{t('home.featured.emptyTitle')}</p>
              <p className="mt-3 text-muted">{t('home.featured.emptyDescription')}</p>
            </div>
          ) : (
            <>
              <div className="mt-12 grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                {featuredTours.map((tour, index) => <TourCard key={tour.slug} tour={tour} revealDelay={(index % 3) * 90} />)}
              </div>
              <div className="mt-10 text-center">
                <Link className="btn-outline" to="/tours">{t('home.featured.viewAll')} <FiArrowRight /></Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section-padding bg-[#fffaf5]">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <MotionReveal>
              <div className="relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-soft">
                  <img className="h-full w-full object-cover" src={customization.journey.image.src || journeyImage} alt={customization.journey.image.alt || t('home.journey.imageAlt')} />
                </div>
                <div className="absolute -bottom-5 right-4 hidden w-44 overflow-hidden rounded-2xl border-4 border-[#fffaf5] shadow-[0_20px_45px_rgba(37,66,76,0.18)] sm:block">
                  <img className="h-32 w-full object-cover" src={customization.journey.thumbnail.src || storyThumbnail} alt={customization.journey.thumbnail.alt || t('home.journey.thumbnailAlt')} />
                </div>
              </div>
            </MotionReveal>
            <MotionReveal delay={100}>
              <div className="mx-auto max-w-xl lg:mx-0">
                <p className="luxury-script text-2xl leading-none text-ink md:text-3xl">{customization.journey.label || t('home.journey.label')}</p>
                <h2 className="mt-1 text-2xl font-black leading-tight text-ink md:text-3xl">{customization.journey.title || t('home.journey.title')}</h2>
                <p className="mt-5 text-base leading-8 text-muted md:text-lg">{customization.journey.description || t('home.journey.description')}</p>
                <button className="btn-outline mt-8" type="button" onClick={onInquiry} style={{ borderColor: customization.journey.cta.color, color: customization.journey.cta.color }}>{customization.journey.cta.text || t('home.journey.cta')} <FiArrowRight /></button>
              </div>
            </MotionReveal>
          </div>
        </div>
      </section>

      <section className="section-padding bg-dark">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl text-center">
            <p className="luxury-script text-2xl leading-none text-white md:text-3xl">{customization.why.label || t('home.why.label')}</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-white md:text-3xl">{customization.why.title || t('home.why.title')}</h2>
            <p className="mx-auto mt-5 max-w-4xl text-lg leading-8 text-white/72">
              {customization.why.description || t('home.why.description')}
            </p>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-5 md:gap-6 lg:grid-cols-4">
            <WhyTravelCard revealDelay={0} variant="dark" icon={FaSliders} iconImage={customization.why.cards[0]?.icon} title={customization.why.cards[0]?.title ?? t('home.why.tailorTitle')} text={customization.why.cards[0]?.text ?? t('home.why.tailorText')} />
            <WhyTravelCard revealDelay={80} variant="dark" icon={FaPeopleGroup} iconImage={customization.why.cards[1]?.icon} title={customization.why.cards[1]?.title ?? t('home.why.localTitle')} text={customization.why.cards[1]?.text ?? t('home.why.localText')} />
            <WhyTravelCard revealDelay={160} variant="dark" icon={FaHandHoldingHeart} iconImage={customization.why.cards[2]?.icon} title={customization.why.cards[2]?.title ?? t('home.why.responsibleTitle')} text={customization.why.cards[2]?.text ?? t('home.why.responsibleText')} />
            <WhyTravelCard revealDelay={240} variant="dark" icon={FaShieldHeart} iconImage={customization.why.cards[3]?.icon} title={customization.why.cards[3]?.title ?? t('home.why.peaceTitle')} text={customization.why.cards[3]?.text ?? t('home.why.peaceText')} />
          </div>
        </div>
      </section>

      <section className="section-padding section-blend-warm">
        <div className="container-custom">
          <SectionHeader label={customization.gallery.label || t('home.galleryLabel')} title={customization.gallery.title || t('home.galleryTitle')} description={customization.gallery.description || t('home.galleryDescription')} />
          <MotionReveal delay={80}>
            <div className="mt-9"><GalleryCarousel images={customization.gallery.images} /></div>
          </MotionReveal>
        </div>
      </section>

      <MotionReveal>
      <ReviewCarousel title={customization.reviews.title} description={customization.reviews.description} />
      </MotionReveal>

      <FooterImageBand src={customization.footerBand.src || homeFooterImage} alt={customization.footerBand.alt || t('home.finalCta.title')} />

      <div
        className={`fixed inset-0 z-[110] grid place-items-center bg-black/55 px-3 py-6 backdrop-blur-md transition-opacity duration-200 sm:px-6 ${
          isSignatureVideoOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isSignatureVideoOpen}
        aria-label={t('home.signature.videoAria')}
        onMouseDown={() => {
          setIsSignatureVideoOpen(false)
          signatureVideoRef.current?.pause()
        }}
      >
        <div className="relative w-full max-w-6xl" onMouseDown={(event) => event.stopPropagation()}>
          <button
            className="absolute -top-14 right-0 grid h-11 w-11 place-items-center rounded-full bg-white text-xl text-ink shadow-[0_14px_35px_rgba(0,0,0,0.22)] transition hover:bg-primary hover:text-white"
            type="button"
            aria-label={t('common.close')}
            tabIndex={isSignatureVideoOpen ? 0 : -1}
            onClick={() => {
              setIsSignatureVideoOpen(false)
              signatureVideoRef.current?.pause()
            }}
          >
            <FiX />
          </button>
          <div className="overflow-hidden rounded-[1.25rem] bg-black">
            <video
              ref={signatureVideoRef}
              className="aspect-video max-h-[82vh] w-full bg-black object-contain"
              loop
              playsInline
              preload="auto"
              poster={storyThumbnail}
              controls={isSignatureVideoOpen}
              tabIndex={isSignatureVideoOpen ? 0 : -1}
              onClick={(event) => {
                const video = event.currentTarget
                if (video.paused) {
                  void video.play()
                } else {
                  video.pause()
                }
              }}
            >
              <source src={aboutVideo} type="video/mp4" />
              {t('home.signature.videoFallback')}
            </video>
          </div>
        </div>
      </div>
    </>
  )
}
