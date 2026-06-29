import { FaHandHoldingHeart, FaLeaf, FaPeopleGroup, FaSeedling, FaShieldHeart } from 'react-icons/fa6'
import { FiArrowRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import welcomeImage from '../assets/james-uganda-family-tours-safari.jpg'
import originsImage from '../assets/footer/UFT Website Work-01.jpg'
import charityOne from '../assets/4.jpeg'
import charityTwo from '../assets/pic1.jpg'
import aboutFooterImage from '../assets/footer/UFT Website Work-02.jpg'
import { MotionReveal } from '../components/MotionReveal'
import { FooterImageBand } from '../components/FooterImageBand'
import { SectionHeader } from '../components/SectionHeader'

type AboutPageProps = {
  onInquiry: () => void
}

export function AboutPage({ onInquiry }: AboutPageProps) {
  const { t } = useTranslation()
  const initiatives = [
    { icon: FaLeaf, title: t('aboutPage.initiatives.responsible.title'), text: t('aboutPage.initiatives.responsible.text') },
    { icon: FaPeopleGroup, title: t('aboutPage.initiatives.community.title'), text: t('aboutPage.initiatives.community.text') },
    { icon: FaHandHoldingHeart, title: t('aboutPage.initiatives.conservation.title'), text: t('aboutPage.initiatives.conservation.text') },
    { icon: FaSeedling, title: t('aboutPage.initiatives.eco.title'), text: t('aboutPage.initiatives.eco.text') },
  ]
  const trustPoints = [
    { icon: FaPeopleGroup, title: t('aboutPage.trust.items.local') },
    { icon: FaShieldHeart, title: t('aboutPage.trust.items.family') },
    { icon: FaHandHoldingHeart, title: t('aboutPage.trust.items.support') },
    { icon: FaLeaf, title: t('aboutPage.trust.items.responsible') },
  ]

  return (
    <main className="bg-white pt-16 md:pt-24">
      <section className="pb-14 pt-5 md:pb-20 md:pt-10">
        <div className="container-custom">
          <SectionHeader
            title={t('aboutPage.hero.title')}
            description={t('aboutPage.hero.subtitle')}
          />
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <MotionReveal>
            <div className="overflow-hidden rounded-[1.75rem] shadow-[0_22px_55px_rgba(17,24,39,0.13)]">
              <img className="aspect-[4/3] w-full object-cover" src={welcomeImage} alt={t('aboutPage.welcome.imageAlt')} />
            </div>
          </MotionReveal>
          <MotionReveal delay={80}>
            <p className="luxury-script text-2xl leading-none text-ink md:text-3xl">{t('aboutPage.welcome.label')}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-ink md:text-4xl">{t('aboutPage.welcome.title')}</h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-muted md:text-lg">
              <p>{t('aboutPage.welcome.p1')}</p>
              <p>{t('aboutPage.welcome.p2')}</p>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-padding bg-[#fffaf5]">
        <div className="container-custom grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <MotionReveal>
            <p className="luxury-script text-2xl leading-none text-ink md:text-3xl">{t('aboutPage.origins.label')}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-ink md:text-4xl">{t('aboutPage.origins.title')}</h2>
            <span className="mt-4 block h-0.5 w-12 bg-primary" />
            <div className="mt-6 space-y-5 text-base leading-8 text-muted md:text-lg">
              <p>{t('aboutPage.origins.p1')}</p>
              <p>{t('aboutPage.origins.p2')}</p>
            </div>
          </MotionReveal>
          <MotionReveal delay={90}>
            <div className="overflow-hidden rounded-[1.75rem] shadow-soft">
              <img className="aspect-[4/3] w-full object-cover" src={originsImage} alt={t('aboutPage.origins.imageAlt')} />
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="section-padding bg-dark">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <p className="luxury-script text-2xl leading-none text-white md:text-3xl">{t('aboutPage.initiatives.label')}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-white md:text-4xl">{t('aboutPage.initiatives.title')}</h2>
            <span className="mx-auto mt-4 block h-0.5 w-12 bg-primary" />
            <p className="mt-5 leading-7 text-white/72">{t('aboutPage.initiatives.description')}</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {initiatives.map(({ icon: Icon, title, text }, index) => (
              <MotionReveal key={title} delay={index * 80}>
                <article className="h-full border-t border-white/15 px-1 py-5 text-center transition hover:border-primary sm:py-6">
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white/8 text-lg text-primary sm:h-12 sm:w-12 sm:text-xl">
                    <Icon />
                  </span>
                  <h3 className="mt-4 text-sm font-black leading-5 text-white sm:mt-5 sm:text-base">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/68 sm:mt-3 sm:text-sm sm:leading-6">{text}</p>
                </article>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <MotionReveal>
            <div className="relative overflow-hidden rounded-[1.75rem] shadow-soft">
              <img className="aspect-[4/3] w-full object-cover" src={charityTwo} alt={t('aboutPage.impact.imageAlt')} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            </div>
          </MotionReveal>
          <MotionReveal delay={80}>
            <p className="luxury-script text-2xl leading-none text-ink md:text-3xl">{t('aboutPage.impact.label')}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-ink md:text-4xl">{t('aboutPage.impact.title')}</h2>
            <p className="mt-6 text-base leading-8 text-muted md:text-lg">{t('aboutPage.impact.description')}</p>
          </MotionReveal>
        </div>
      </section>

      <section className="section-padding bg-[#fffaf5]">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <p className="luxury-script text-2xl leading-none text-ink md:text-3xl">{t('aboutPage.charities.label')}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-ink md:text-4xl">{t('aboutPage.charities.title')}</h2>
          </div>
          <div className="mt-12 grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <MotionReveal>
              <div className="relative overflow-hidden rounded-[1.75rem] shadow-soft">
                <img className="aspect-[4/3] w-full object-cover" src={charityOne} alt={t('aboutPage.charities.mammadu.imageAlt')} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
              </div>
            </MotionReveal>
            <MotionReveal delay={80}>
              <p className="luxury-script text-2xl leading-none text-ink md:text-3xl">{t('aboutPage.charities.label')}</p>
              <h3 className="mt-2 text-3xl font-black leading-tight text-ink md:text-4xl">{t('aboutPage.charities.mammadu.title')}</h3>
              <div className="mt-6 space-y-5 text-base leading-8 text-muted md:text-lg">
                <p>{t('aboutPage.charities.mammadu.p1')}</p>
                <p>{t('aboutPage.charities.mammadu.p2')}</p>
              </div>
              <button className="btn-outline mt-8" type="button" onClick={onInquiry}>{t('aboutPage.charities.visit')} <FiArrowRight /></button>
            </MotionReveal>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <p className="luxury-script text-2xl leading-none text-ink md:text-3xl">{t('aboutPage.trust.label')}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-ink md:text-4xl">{t('aboutPage.trust.title')}</h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {trustPoints.map(({ icon: Icon, title }, index) => (
              <MotionReveal key={title} delay={index * 70}>
                <div className="h-full rounded-[1.25rem] border border-[#eadfd3] bg-[#fffdf9] p-5 text-center">
                  <Icon className="mx-auto text-2xl text-primary" />
                  <p className="mt-4 text-sm font-black leading-6 text-ink">{title}</p>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <FooterImageBand src={aboutFooterImage} alt={t('aboutPage.cta.title')} zoom={1.14} />
    </main>
  )
}
