import { FaEnvelope, FaHandHoldingHeart, FaLeaf, FaPeopleGroup, FaPhone, FaSeedling } from 'react-icons/fa6'
import { FiArrowRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import heroImage from '../assets/happy-clients-on-uganda-safari-1.jpg'
import welcomeImage from '../assets/james-uganda-family-tours-safari.jpg'
import originsImage from '../assets/Venture-Uganda-Safari-Uganda-01.jpg'
import charityOne from '../assets/4.jpeg'
import charityTwo from '../assets/pic1.jpg'
import ctaImage from '../assets/Venture-Uganda-Safari-Uganda-01.jpg'
import { MotionReveal } from '../components/MotionReveal'

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

  return (
    <main className="bg-white">
      <section className="hero-section min-h-[420px]" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />
        <div className="container-custom relative z-10 flex min-h-[420px] flex-col justify-center pt-20 text-white">
          <p className="hero-kicker text-sm font-black uppercase text-primary">{t('aboutPage.hero.kicker')}</p>
          <h1 className="hero-title mt-5 text-5xl font-bold leading-tight md:text-8xl">{t('aboutPage.hero.title')}</h1>
          <p className="hero-copy mt-4 text-xl font-medium text-white/90">{t('aboutPage.hero.subtitle')}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom grid items-center gap-14 lg:grid-cols-2">
          <MotionReveal>
            <img className="h-[390px] w-full rounded-card object-cover shadow-soft" src={welcomeImage} alt="Uganda Family Tours safari guests by company vehicle" />
          </MotionReveal>
          <div>
            <p className="luxury-script text-4xl leading-none text-ink md:text-5xl">{t('aboutPage.welcome.label')}</p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-ink md:text-3xl">{t('aboutPage.welcome.title')}</h2>
            <p className="mt-5 leading-8 text-muted">{t('aboutPage.welcome.p1')}</p>
            <p className="mt-5 leading-8 text-muted">{t('aboutPage.welcome.p2')}</p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="luxury-script text-4xl leading-none text-ink md:text-5xl">{t('aboutPage.origins.label')}</p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-ink md:text-3xl">{t('aboutPage.origins.title')}</h2>
            <span className="mt-4 block h-0.5 w-12 bg-primary" />
            <p className="mt-6 leading-8 text-muted">{t('aboutPage.origins.p1')}</p>
            <p className="mt-5 leading-8 text-muted">{t('aboutPage.origins.p2')}</p>
          </div>
          <MotionReveal delay={90}>
            <img className="h-[370px] w-full rounded-card object-cover shadow-soft" src={originsImage} alt="Safari vehicle in Uganda near wildlife" />
          </MotionReveal>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <p className="luxury-script text-4xl leading-none text-ink md:text-5xl">{t('aboutPage.initiatives.label')}</p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-ink md:text-3xl">{t('aboutPage.initiatives.title')}</h2>
            <span className="mx-auto mt-4 block h-0.5 w-12 bg-primary" />
            <p className="mt-5 leading-7 text-muted">{t('aboutPage.initiatives.description')}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {initiatives.map(({ icon: Icon, title, text }, index) => (
              <MotionReveal key={title} delay={index * 80}>
                <article className="card p-7 text-center">
                  <Icon className="mx-auto text-5xl text-primary" />
                  <h3 className="mt-5 font-black text-ink">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
                </article>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <p className="luxury-script text-4xl leading-none text-ink md:text-5xl">{t('aboutPage.charities.label')}</p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-ink md:text-3xl">{t('aboutPage.charities.title')}</h2>
          </div>
          <div className="mt-10 grid gap-6">
            <article className="card grid overflow-hidden lg:grid-cols-[1fr_1.1fr]">
              <img className="h-full min-h-72 w-full object-cover" src={charityOne} alt="Children supported by community travel initiatives" />
              <div className="p-7 md:p-9">
                <h3 className="text-2xl font-black text-ink">{t('aboutPage.charities.mammadu.title')}</h3>
                <p className="mt-4 leading-7 text-muted">{t('aboutPage.charities.mammadu.p1')}</p>
                <p className="mt-4 leading-7 text-muted">{t('aboutPage.charities.mammadu.p2')}</p>
                <a className="btn-outline mt-6" href="#">{t('aboutPage.charities.visit')} <FiArrowRight /></a>
              </div>
            </article>
            <article className="card grid overflow-hidden lg:grid-cols-[1.1fr_1fr]">
              <div className="p-7 md:p-9">
                <h3 className="text-2xl font-black text-ink">{t('aboutPage.charities.orange.title')}</h3>
                <p className="mt-4 leading-7 text-muted">{t('aboutPage.charities.orange.p1')}</p>
                <p className="mt-4 leading-7 text-muted">{t('aboutPage.charities.orange.p2')}</p>
                <a className="btn-outline mt-6" href="#">{t('aboutPage.charities.learn')} <FiArrowRight /></a>
              </div>
              <img className="h-full min-h-72 w-full object-cover" src={charityTwo} alt="Uganda Family Tours team and community project" />
            </article>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-cover bg-center py-12 text-center text-white" style={{ backgroundImage: `url(${ctaImage})` }}>
        <div className="absolute inset-0 bg-black/70" />
        <div className="container-custom relative z-10">
          <p className="luxury-script text-4xl leading-none md:text-5xl">{t('aboutPage.cta.label')}</p>
          <h2 className="mt-2 text-2xl font-black leading-tight md:text-3xl">{t('aboutPage.cta.title')}</h2>
          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <a className="btn-primary justify-center" href="tel:+256703543027"><FaPhone /> {t('aboutPage.cta.call')} <FiArrowRight /></a>
            <button className="btn-outline justify-center border-white/70 bg-transparent text-white hover:border-primary" type="button" onClick={onInquiry}>
              <FaEnvelope /> {t('aboutPage.cta.inquiry')}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
