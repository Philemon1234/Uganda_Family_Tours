import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { FaHandHoldingHeart, FaPeopleGroup, FaShieldHeart, FaSliders } from 'react-icons/fa6'
import { FiArrowRight, FiCamera, FiCompass, FiHeart, FiMap, FiMapPin, FiUsers } from 'react-icons/fi'
import type { Tour } from '../data/tours'
import { TourCard } from '../components/TourCard'
import { SectionHeader } from '../components/SectionHeader'
import { WhyTravelCard } from '../components/WhyTravelCard'
import { GalleryCarousel } from '../components/GalleryCarousel'
import { ReviewCarousel } from '../components/ReviewCarousel'
import { MotionReveal } from '../components/MotionReveal'
import { FooterImageBand } from '../components/FooterImageBand'
import { getPublishedTourPackages } from '../services/publicTourService'
import { packageToTour } from '../utils/tourPackageMapper'
import heroVideo from '../assets/Gorillatours.mp4'
import heroVideoPoster from '../assets/on load.png'
// import heroImage from '../assets/gorilla-7708328_1920.jpg'
// import gorillaForestImage from '../assets/Africa-Gorilla-GettyImages-986556120.jpg'
// import elephantImage from '../assets/elephant-4736008_1280.jpg'
import storyThumbnail from '../assets/Thumbnail.png'
import homeIconOne from '../assets/UFT-Homepage-icons-01.png'
import homeIconTwo from '../assets/UFT-Homepage-icons-02.png'
import homeIconThree from '../assets/UFT-Homepage-icons-03.png'
import homeIconFour from '../assets/UFT-Favicon.png'
import journeyImage from '../assets/Venture-Uganda-Safari-Uganda-01.jpg'
import homeFooterImage from '../assets/footer/UFT Website Work-03.jpg'

type HomePageProps = {
  onBook: () => void
}

const FEATURED_TOURS_LIMIT = 6

const signatureExperienceIcons = [FiMapPin, FiCamera, FiCompass, FiUsers, FiMap, FiHeart]
// const heroSlides = [heroImage, gorillaForestImage, elephantImage, lionImage]

export function HomePage({ onBook }: HomePageProps) {
  const { t } = useTranslation()
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([])
  const [isLoadingFeaturedTours, setIsLoadingFeaturedTours] = useState(true)
  const [featuredToursError, setFeaturedToursError] = useState('')
  const [isHeroVideoReady, setIsHeroVideoReady] = useState(false)
  const signatureExperiences = signatureExperienceIcons.map((Icon, index) => ({
    Icon,
    title: t(`home.signature.items.${index}.title`),
    text: t(`home.signature.items.${index}.text`),
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

    return () => {
      isMounted = false
    }
  }, [])

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
        <img
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
            isHeroVideoReady ? 'opacity-0' : 'opacity-100'
          }`}
          src={heroVideoPoster}
          alt=""
          aria-hidden="true"
          loading="eager"
        />
        <video
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out ${
            isHeroVideoReady ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={heroVideoPoster}
          aria-hidden="true"
          onLoadedData={() => setIsHeroVideoReady(true)}
        >
          <source src={heroVideo} type="video/mp4" />
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
            <p className="hero-kicker luxury-script text-3xl leading-none text-white/95 md:text-4xl">{t('home.hero.kicker')}</p>
            <h1 className="hero-title mx-auto mt-1 max-w-5xl text-4xl font-bold leading-tight md:text-7xl">{t('home.hero.title')}</h1>
            <p className="hero-copy mx-auto mt-5 max-w-2xl text-base leading-8 text-white/82 md:text-lg">
              {t('home.hero.subtitle')}
            </p>
            <Link className="hero-action btn-primary btn-on-dark mt-8" to="/tours">{t('home.hero.primaryCta')} <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      <section className="bg-[#171719] pb-20 pt-8 md:pb-28 md:pt-12">
        <div className="container-custom">
          <MotionReveal>
            <div className="mx-auto mb-14 flex w-full max-w-xl items-center justify-center gap-5 px-4 md:mb-16 md:gap-7">
              {[
                { src: homeIconOne, alt: t('home.hero.badgeAlt.service') },
                { src: homeIconTwo, alt: t('home.hero.badgeAlt.planning') },
                { src: homeIconThree, alt: t('home.hero.badgeAlt.support') },
                { src: homeIconFour, alt: t('home.hero.badgeAlt.brand') },
              ].map((item) => (
                <span key={item.alt} className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-[0_14px_34px_rgba(0,0,0,0.22)] md:h-16 md:w-16">
                  <img className="max-h-10 w-auto object-contain md:max-h-11" src={item.src} alt={item.alt} />
                </span>
              ))}
            </div>
          </MotionReveal>
          <MotionReveal>
            <div className="mx-auto max-w-5xl text-center">
              <p className="luxury-script text-2xl leading-none text-white md:text-3xl">{t('home.story.label')}</p>
              <h2 className="mx-auto mt-1 max-w-4xl text-xl font-black leading-tight text-white md:text-3xl">
                {t('home.story.title')}
              </h2>
              <div className="mx-auto mt-8 max-w-4xl space-y-6 text-base leading-8 text-white md:text-lg">
                <p>
                  <Trans
                    i18nKey="home.story.p1"
                    components={[<strong className="font-black text-white" />]}
                  />
                </p>
                <p>
                  <Trans
                    i18nKey="home.story.p2"
                    components={[<strong className="font-black text-white" />]}
                  />
                </p>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-padding bg-[#faf7f2]">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.25fr] lg:items-stretch">
            <MotionReveal className="h-full">
              <div className="relative h-full min-h-[24rem] overflow-hidden rounded-[1.75rem] bg-dark shadow-[0_22px_55px_rgba(37,66,76,0.14)] lg:min-h-full">
                <video
                  className="aspect-[4/3] h-full w-full object-cover lg:aspect-auto"
                  controls
                  playsInline
                  preload="metadata"
                  poster={journeyImage}
                  aria-label={t('home.signature.videoAria')}
                >
                  <source src="/videos/signature-experiences.mp4" type="video/mp4" />
                  {t('home.signature.videoFallback')}
                </video>
              </div>
            </MotionReveal>
            <MotionReveal className="h-full" delay={80}>
              <div className="flex h-full flex-col">
                <div className="max-w-4xl">
                  <p className="luxury-script text-2xl leading-none text-ink md:text-3xl">{t('home.signature.title')}</p>
                  <p className="mt-5 max-w-3xl text-base leading-7 text-muted">{t('home.signature.description')}</p>
                </div>
                <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-3">
                  {signatureExperiences.map(({ Icon, title, text }) => (
                    <div key={title} className="group border-t border-[#ded2c4] px-1 py-4 transition hover:border-primary sm:py-5">
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-base text-white shadow-[0_12px_28px_rgba(251,119,13,0.22)] sm:h-11 sm:w-11 sm:text-lg">
                          <Icon />
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
          <SectionHeader label={t('home.featured.label')} title={t('home.featured.title')} description={t('home.featured.description')} />
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
                  <img className="h-full w-full object-cover" src={journeyImage} alt={t('home.journey.imageAlt')} />
                </div>
                <div className="absolute -bottom-5 right-4 hidden w-44 overflow-hidden rounded-2xl border-4 border-[#fffaf5] shadow-[0_20px_45px_rgba(37,66,76,0.18)] sm:block">
                  <img className="h-32 w-full object-cover" src={storyThumbnail} alt={t('home.journey.thumbnailAlt')} />
                </div>
              </div>
            </MotionReveal>
            <MotionReveal delay={100}>
              <div className="mx-auto max-w-xl lg:mx-0">
                <p className="luxury-script text-2xl leading-none text-ink md:text-3xl">{t('home.journey.label')}</p>
                <h2 className="mt-1 text-2xl font-black leading-tight text-ink md:text-3xl">{t('home.journey.title')}</h2>
                <p className="mt-5 text-base leading-8 text-muted md:text-lg">{t('home.journey.description')}</p>
                <button className="btn-outline mt-8" type="button" onClick={onBook}>{t('home.journey.cta')} <FiArrowRight /></button>
              </div>
            </MotionReveal>
          </div>
        </div>
      </section>

      <section className="section-padding bg-dark">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl text-center">
            <p className="luxury-script text-2xl leading-none text-white md:text-3xl">{t('home.why.label')}</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-white md:text-3xl">{t('home.why.title')}</h2>
            <p className="mx-auto mt-5 max-w-4xl text-lg leading-8 text-white/72">
              {t('home.why.description')}
            </p>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-5 md:gap-6 lg:grid-cols-4">
            <WhyTravelCard revealDelay={0} variant="dark" icon={FaSliders} title={t('home.why.tailorTitle')} text={t('home.why.tailorText')} />
            <WhyTravelCard revealDelay={80} variant="dark" icon={FaPeopleGroup} title={t('home.why.localTitle')} text={t('home.why.localText')} />
            <WhyTravelCard revealDelay={160} variant="dark" icon={FaHandHoldingHeart} title={t('home.why.responsibleTitle')} text={t('home.why.responsibleText')} />
            <WhyTravelCard revealDelay={240} variant="dark" icon={FaShieldHeart} title={t('home.why.peaceTitle')} text={t('home.why.peaceText')} />
          </div>
        </div>
      </section>

      <section className="section-padding section-blend-warm">
        <div className="container-custom">
          <SectionHeader label={t('home.galleryLabel')} title={t('home.galleryTitle')} description={t('home.galleryDescription')} />
          <MotionReveal delay={80}>
            <div className="mt-9"><GalleryCarousel /></div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <SectionHeader title={t('home.reviewsTitle')} description={t('home.reviewsDescription')} />
          <MotionReveal delay={80}>
            <div className="mt-9"><ReviewCarousel /></div>
          </MotionReveal>
        </div>
      </section>

      <FooterImageBand src={homeFooterImage} alt={t('home.finalCta.title')} />
    </>
  )
}
