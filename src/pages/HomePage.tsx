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
import { getPublishedTourPackages } from '../services/publicTourService'
import { packageToTour } from '../utils/tourPackageMapper'
import heroImage from '../assets/gorilla-7708328_1920.jpg'
import storyThumbnail from '../assets/Thumbnail.png'
import homeIconOne from '../assets/UFT-Homepage-icons-01.png'
import homeIconTwo from '../assets/UFT-Homepage-icons-02.png'
import homeIconThree from '../assets/UFT-Homepage-icons-03.png'
import homeIconFour from '../assets/UFT-Favicon.png'
import journeyImage from '../assets/Venture-Uganda-Safari-Uganda-01.jpg'
import ctaImage from '../assets/cover_1669-Tree-Climbing-Lions.jpg'

type HomePageProps = {
  onBook: () => void
}

const FEATURED_TOURS_LIMIT = 3

const signatureExperienceIcons = [FiMapPin, FiCamera, FiCompass, FiUsers, FiMap, FiHeart]

export function HomePage({ onBook }: HomePageProps) {
  const { t } = useTranslation()
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([])
  const [isLoadingFeaturedTours, setIsLoadingFeaturedTours] = useState(true)
  const [featuredToursError, setFeaturedToursError] = useState('')
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

  return (
    <>
      <section className="hero-section min-h-[92vh] bg-black" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-black/55 to-black md:h-40" />
        <div className="container-custom relative z-10 flex min-h-[92vh] flex-col items-center justify-center px-4 pb-20 pt-40 text-center text-white lg:pb-24 lg:pt-44">
          <div className="w-full">
            <p className="hero-kicker luxury-script text-3xl leading-none text-white/95 md:text-4xl">{t('home.hero.kicker')}</p>
            <h1 className="hero-title mx-auto mt-1 max-w-5xl text-4xl font-bold leading-tight md:text-7xl">{t('home.hero.title')}</h1>
            <p className="hero-copy mx-auto mt-5 max-w-2xl text-base leading-8 text-white/82 md:text-lg">
              {t('home.hero.subtitle')}
            </p>
            <Link className="hero-action btn-primary mt-8 shadow-[0_14px_34px_rgba(0,0,0,0.18)]" to="/tours">{t('home.hero.primaryCta')} <FiArrowRight /></Link>
          </div>
          <div className="hero-badges mt-14 flex w-full justify-center">
            <div className="flex w-full max-w-2xl items-center justify-center gap-4 border-y border-white/15 bg-black/20 px-5 py-4 sm:w-auto sm:px-8 lg:gap-7">
              {[
                { src: homeIconOne, alt: t('home.hero.badgeAlt.service') },
                { src: homeIconTwo, alt: t('home.hero.badgeAlt.planning') },
                { src: homeIconThree, alt: t('home.hero.badgeAlt.support') },
                { src: homeIconFour, alt: t('home.hero.badgeAlt.brand') },
              ].map((item) => (
                <img key={item.alt} className="h-10 w-auto object-contain opacity-90 md:h-12" src={item.src} alt={item.alt} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black pb-20 pt-8 md:pb-28 md:pt-12">
        <div className="container-custom">
          <MotionReveal>
            <div className="mx-auto max-w-5xl text-center">
              <p className="luxury-script text-2xl leading-none text-white md:text-3xl">{t('home.story.label')}</p>
              <h2 className="mx-auto mt-1 max-w-4xl text-xl font-black leading-tight text-white md:text-3xl">
                {t('home.story.title')}
              </h2>
              <div className="mx-auto mt-8 max-w-4xl space-y-6 text-base leading-8 text-white/74 md:text-lg">
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
              <div className="relative h-full min-h-[24rem] overflow-hidden rounded-[1.75rem] bg-[#1f2937] shadow-[0_22px_55px_rgba(17,24,39,0.14)] lg:min-h-full">
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
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-base text-[#8f4b22] shadow-[0_12px_28px_rgba(17,24,39,0.06)] sm:h-11 sm:w-11 sm:text-lg">
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
                <div className="absolute -bottom-5 right-4 hidden w-44 overflow-hidden rounded-2xl border-4 border-[#fffaf5] shadow-[0_20px_45px_rgba(17,24,39,0.18)] sm:block">
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

      <section className="section-padding bg-[#1f2937]">
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

      <section className="relative overflow-hidden bg-[#1f2937] py-20 text-center text-white md:py-28" style={{ backgroundImage: `url(${ctaImage})`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
        <div className="absolute inset-0 bg-[#111827]/75" />
        <div className="container-custom relative z-10">
          <MotionReveal>
            <p className="luxury-script text-2xl leading-none text-white md:text-3xl">{t('home.finalCta.label')}</p>
            <h2 className="mx-auto mt-1 max-w-3xl text-3xl font-black leading-tight md:text-5xl">{t('home.finalCta.title')}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/78 md:text-lg">{t('home.finalCta.description')}</p>
            <button className="btn-primary mt-8" type="button" onClick={onBook}>{t('home.finalCta.button')} <FiArrowRight /></button>
          </MotionReveal>
        </div>
      </section>
    </>
  )
}
