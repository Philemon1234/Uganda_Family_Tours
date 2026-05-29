import { FaEnvelope, FaHandHoldingHeart, FaLeaf, FaPeopleGroup, FaPhone, FaSeedling } from 'react-icons/fa6'
import { FiArrowRight } from 'react-icons/fi'
import heroImage from '../assets/happy-clients-on-uganda-safari-1.jpg'
import welcomeImage from '../assets/james-uganda-family-tours-safari.jpg'
import originsImage from '../assets/Venture-Uganda-Safari-Uganda-01.jpg'
import charityOne from '../assets/4.jpeg'
import charityTwo from '../assets/pic1.jpg'
import ctaImage from '../assets/Venture-Uganda-Safari-Uganda-01.jpg'
import { MotionReveal } from '../components/MotionReveal'

type AboutPageProps = {
  onBook: () => void
}

export function AboutPage({ onBook }: AboutPageProps) {
  const initiatives = [
    {
      icon: FaLeaf,
      title: 'Responsible Tourism',
      text: 'Promoting ethical travel practices that protect nature, support local communities and preserve culture.',
    },
    {
      icon: FaPeopleGroup,
      title: 'Community Empowerment',
      text: 'Partnering with local communities to support education, skills training and economic opportunities.',
    },
    {
      icon: FaHandHoldingHeart,
      title: 'Conservation Support',
      text: 'Supporting wildlife conservation initiatives and habitat protection across Uganda.',
    },
    {
      icon: FaSeedling,
      title: 'Eco-Friendly Travel',
      text: 'Reducing our environmental impact through sustainable operations and thoughtful travel planning.',
    },
  ]

  return (
    <main className="bg-white">
      <section className="hero-section min-h-[420px]" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />
        <div className="container-custom relative z-10 flex min-h-[420px] flex-col justify-center pt-20 text-white">
          <p className="hero-kicker text-sm font-black uppercase text-primary">Who We Are</p>
          <h1 className="hero-title mt-5 text-5xl font-bold leading-tight md:text-8xl">About Us</h1>
          <p className="hero-copy mt-4 text-xl font-medium text-white/90">10 Years of Authentic Safaris</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom grid items-center gap-14 lg:grid-cols-2">
          <MotionReveal>
            <img className="h-[390px] w-full rounded-card object-cover shadow-soft" src={welcomeImage} alt="Uganda Family Tours safari guests by company vehicle" />
          </MotionReveal>
          <div>
            <p className="text-sm font-black uppercase text-primary">Welcome</p>
            <h2 className="mt-3 text-4xl font-black text-ink">Karibu!</h2>
            <p className="mt-5 leading-8 text-muted">
              Welcome to Uganda Family Tours & Safari Company - your trusted partner for safe, fun and eco-friendly family adventures in the Pearl of Africa.
            </p>
            <p className="mt-5 leading-8 text-muted">
              We are a team of locally based tour planners and guides committed to helping families explore the beauty, wildlife and culture of Uganda in a way that’s exciting for kids, relaxing for parents and respectful to nature.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase text-primary">Our Story</p>
            <h2 className="mt-3 text-4xl font-black text-ink">Our Origins</h2>
            <span className="mt-4 block h-0.5 w-12 bg-primary" />
            <p className="mt-6 leading-8 text-muted">
              Our story began with a love for nature, wildlife and the incredible people of Uganda. What started as small, family-led safaris has grown into a mission to share the magic of Africa with families from around the world.
            </p>
            <p className="mt-5 leading-8 text-muted">
              Over the years we’ve built trusted partnerships, created safe and memorable journeys, and remained true to our values: authenticity, sustainability and exceptional care.
            </p>
          </div>
          <MotionReveal delay={90}>
            <img className="h-[370px] w-full rounded-card object-cover shadow-soft" src={originsImage} alt="Safari vehicle in Uganda near wildlife" />
          </MotionReveal>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase text-primary">What Drives Us</p>
            <h2 className="mt-3 text-4xl font-black text-ink">Our Initiatives</h2>
            <span className="mx-auto mt-4 block h-0.5 w-12 bg-primary" />
            <p className="mt-5 leading-7 text-muted">
              We are committed to responsible travel and creating positive impact for communities, wildlife and the environment across Uganda.
            </p>
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
            <p className="text-sm font-black uppercase text-primary">Making A Difference</p>
            <h2 className="mt-3 text-4xl font-black text-ink">Our Charities</h2>
          </div>
          <div className="mt-10 grid gap-6">
            <article className="card grid overflow-hidden lg:grid-cols-[1fr_1.1fr]">
              <img className="h-full min-h-72 w-full object-cover" src={charityOne} alt="Children supported by community travel initiatives" />
              <div className="p-7 md:p-9">
                <h3 className="text-2xl font-black text-ink">The Mammadu Trust in Windhoek</h3>
                <p className="mt-4 leading-7 text-muted">
                  The Mammadu Trust was founded to care for and support orphans, children and women living in extremely vulnerable conditions. We believe responsible travel should create real opportunities for young people and families.
                </p>
                <p className="mt-4 leading-7 text-muted">
                  Upon return, your guide can arrange a donation visit or community introduction where your support is directed with transparency and care.
                </p>
                <a className="btn-outline mt-6" href="#">VISIT TRUST SITE <FiArrowRight /></a>
              </div>
            </article>
            <article className="card grid overflow-hidden lg:grid-cols-[1.1fr_1fr]">
              <div className="p-7 md:p-9">
                <h3 className="text-2xl font-black text-ink">Orange Community Project</h3>
                <p className="mt-4 leading-7 text-muted">
                  We partner with schools and community groups to help improve classrooms, provide supplies and support practical learning opportunities for children in rural areas.
                </p>
                <p className="mt-4 leading-7 text-muted">
                  Uganda Family Tours continues to support community projects initiated by local leaders, creating sustainable benefits beyond each safari.
                </p>
                <a className="btn-outline mt-6" href="#">LEARN MORE <FiArrowRight /></a>
              </div>
              <img className="h-full min-h-72 w-full object-cover" src={charityTwo} alt="Uganda Family Tours team and community project" />
            </article>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-cover bg-center py-12 text-center text-white" style={{ backgroundImage: `url(${ctaImage})` }}>
        <div className="absolute inset-0 bg-black/70" />
        <div className="container-custom relative z-10">
          <p className="font-black text-primary">Get in touch now</p>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">Start building your dream journey</h2>
          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <a className="btn-primary justify-center" href="tel:+256703543027"><FaPhone /> Call Now <FiArrowRight /></a>
            <button className="btn-outline justify-center border-white/70 bg-transparent text-white hover:border-primary" type="button" onClick={onBook}>
              <FaEnvelope /> Make an Enquiry
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
