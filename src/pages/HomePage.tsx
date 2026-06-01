import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { FaHandHoldingHeart, FaPeopleGroup, FaShieldHeart, FaSliders } from 'react-icons/fa6'
import { FiArrowRight } from 'react-icons/fi'
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

type HomePageProps = {
  onBook: () => void
}

const FEATURED_TOURS_LIMIT = 9

export function HomePage({ onBook }: HomePageProps) {
  const { t } = useTranslation()
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([])
  const [isLoadingFeaturedTours, setIsLoadingFeaturedTours] = useState(true)
  const [featuredToursError, setFeaturedToursError] = useState('')

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
          setFeaturedToursError(message || 'Unable to load featured tours right now.')
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
        <section className="hero-section min-h-[90vh] bg-black" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black via-black/70 via-35% to-transparent" />
          <div className="container-custom relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-4 pb-16 pt-40 text-center text-white lg:pb-20 lg:pt-44">
          <div className="w-full">
            <h1 className="hero-title mx-auto max-w-5xl text-4xl font-bold leading-tight md:text-7xl">{t('home.hero.title')}</h1>
            <p className="hero-copy mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/90">
              {t('home.hero.subtitle')}
            </p>
            <Link className="hero-action btn-primary mt-8 shadow-[0_14px_34px_rgba(0,0,0,0.18)]" to="/tours">{t('home.hero.primaryCta')} <FiArrowRight /></Link>
          </div>
          <div className="hero-badges mt-18 flex w-full justify-center">
            <div className="flex w-full max-w-3xl items-center justify-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-6 py-4 shadow-[0_22px_55px_rgba(0,0,0,0.14)] backdrop-blur-sm sm:w-auto sm:px-8 lg:gap-8">
            {[
              { src: homeIconOne, alt: 'Uganda Family Tours service highlight' },
              { src: homeIconTwo, alt: 'Uganda Family Tours safari planning highlight' },
              { src: homeIconThree, alt: 'Uganda Family Tours travel support highlight' },
              { src: homeIconFour, alt: 'Uganda Family Tours brand mark' },
            ].map((item) => (
              <img key={item.alt} className="h-12 w-auto object-contain md:h-14" src={item.src} alt={item.alt} />
            ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black pb-14 pt-20 md:pb-18 md:pt-24">
        <div className="container-custom">
          <MotionReveal>
            <div className="mx-auto max-w-5xl text-center">
              <p className="luxury-script text-3xl leading-none text-white md:text-5xl">{t('home.story.label')}</p>
              <h2 className="mx-auto mt-1 max-w-4xl text-xl font-black leading-tight text-white md:text-3xl">
                {t('home.story.title')}
              </h2>
              <div className="mx-auto mt-8 max-w-5xl space-y-10 text-base leading-8 text-white/78 md:text-lg">
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

      <section className="section-padding bg-white">
        <div className="container-custom">
          <MotionReveal delay={90}>
            <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] border border-white/80 shadow-soft">
              <img className="h-full w-full object-cover" src={storyThumbnail} alt="Uganda Family Tours safari story" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-padding section-blend-light">
        <div className="container-custom">
          <SectionHeader label={t('home.featured.label')} title={t('home.featured.title')} />
          {isLoadingFeaturedTours ? (
            <div className="mt-12 grid items-stretch gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[520px] animate-pulse rounded-[1.75rem] border border-[#eadfd3] bg-slate-100"
                />
              ))}
            </div>
          ) : featuredToursError ? (
            <div className="mx-auto mt-12 max-w-3xl rounded-[1.75rem] border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
              <p className="text-lg font-bold">Unable to load featured tours</p>
              <p className="mt-2 text-sm leading-6">{featuredToursError}</p>
            </div>
          ) : featuredTours.length === 0 ? (
            <div className="mx-auto mt-12 max-w-3xl rounded-[1.75rem] border border-dashed border-[#eadfd3] bg-[#fff8f3] px-6 py-10 text-center">
              <p className="text-xl font-black text-ink">No featured tours available yet.</p>
              <p className="mt-3 text-muted">Published packages from the admin dashboard will appear here.</p>
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

        <section className="section-padding bg-[#1f2937]">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl text-center">
            <p className="luxury-script text-4xl leading-none text-white md:text-5xl">{t('home.why.label')}</p>
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
          <SectionHeader title={t('home.galleryTitle')} />
          <MotionReveal delay={80}>
            <div className="mt-9"><GalleryCarousel /></div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <SectionHeader title={t('home.reviewsTitle')} />
          <MotionReveal delay={80}>
            <div className="mt-9"><ReviewCarousel /></div>
          </MotionReveal>
          <div className="sr-only"><button type="button" onClick={onBook}>{t('navbar.talkToSpecialist')}</button></div>
        </div>
      </section>
    </>
  )
}
