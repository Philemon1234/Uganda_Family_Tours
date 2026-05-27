import { Link } from 'react-router-dom'
import { useState } from 'react'
import { FaHandHoldingHeart, FaPause, FaPeopleGroup, FaPlay, FaShieldHeart, FaSliders } from 'react-icons/fa6'
import { FiArrowRight } from 'react-icons/fi'
import { tours } from '../data/tours'
import { TourCard } from '../components/TourCard'
import { SectionHeader } from '../components/SectionHeader'
import { WhyTravelCard } from '../components/WhyTravelCard'
import { GalleryCarousel } from '../components/GalleryCarousel'
import { ReviewCarousel } from '../components/ReviewCarousel'
import heroImage from '../assets/gorilla-7708328_1920.jpg'
import videoImage from '../assets/gorilla-7708352_1280.jpg'
import homeIconOne from '../assets/UFT-Homepage-icons-01.png'
import homeIconTwo from '../assets/UFT-Homepage-icons-02.png'
import homeIconThree from '../assets/UFT-Homepage-icons-03.png'
import homeIconFour from '../assets/UFT-Favicon.png'

type HomePageProps = {
  onBook: () => void
}

export function HomePage({ onBook }: HomePageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const featuredTours = [...tours, ...tours.slice(0, 3)]

  return (
    <>
      <section className="hero-section min-h-[90vh]" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="container-custom relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-4 pb-16 pt-40 text-center text-white lg:pb-20 lg:pt-44">
          <div className="w-full">
            <h1 className="mx-auto max-w-5xl text-4xl font-bold leading-tight md:text-7xl">Your Adventure Awaits in the Pearl of Africa</h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/90">
              Discover unforgettable safari experiences, breathtaking landscapes, and vibrant cultures with Uganda Family Tours & Safari Co.
            </p>
            <Link className="btn-primary mt-8" to="/tours">Explore Our Tours <FiArrowRight /></Link>
          </div>
          <div className="mt-14 grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { src: homeIconOne, alt: 'Uganda Family Tours service highlight' },
              { src: homeIconTwo, alt: 'Uganda Family Tours safari planning highlight' },
              { src: homeIconThree, alt: 'Uganda Family Tours travel support highlight' },
              { src: homeIconFour, alt: 'Uganda Family Tours brand mark' },
            ].map((item) => (
              <div key={item.alt} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
                <img className="mx-auto h-16 w-auto object-contain md:h-18" src={item.src} alt={item.alt} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <SectionHeader
            label="Our Story"
            title="Discover the Heart of Uganda"
            description="From misty mountains and mighty rivers to rare wildlife and warm hospitality, experience Uganda like never before."
          />
          <button
            className="relative mt-10 block aspect-video w-full overflow-hidden rounded-[2rem] shadow-soft"
            type="button"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            onClick={() => setIsPlaying((value) => !value)}
          >
            <img className="h-full w-full object-cover" src={videoImage} alt="Scenic Uganda waterfall video preview" />
            <span className="absolute inset-0 bg-black/35" />
            <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-3xl text-primary shadow-2xl">
              {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
            </span>
            <span className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-black/80 px-5 py-4 text-sm text-white">
              <span>{isPlaying ? '0:28' : '0:00'} / 1:45</span>
              <span className="h-1 flex-1 rounded-full bg-white/35"><span className={`block h-full rounded-full bg-primary ${isPlaying ? 'w-2/5' : 'w-10'}`} /></span>
            </span>
          </button>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <SectionHeader label="Explore Uganda" title="Featured Tours" />
          <div className="mt-12 grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {featuredTours.map((tour, index) => <TourCard key={`${tour.id}-${index}`} tour={tour} />)}
          </div>
          <div className="mt-10 text-center">
            <Link className="btn-outline" to="/tours">View All Tours <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      <section className="section-padding bg-[#023341]">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm font-bold text-primary">Your adventure. Our expertise.</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">WHY TRAVEL WITH UGANDA FAMILY TOURS?</h2>
            <p className="mx-auto mt-5 max-w-4xl text-lg leading-8 text-white/72">
              We craft unforgettable journeys that immerse you in the rich cultural tapestry, stunning landscapes, and diverse wildlife of Uganda. As a locally-rooted company, we take immense pride in showcasing the hidden gems and iconic attractions that make Uganda a true African paradise.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <WhyTravelCard variant="dark" icon={FaSliders} title="Tailor-Made Itineraries" text="Custom itineraries designed just for you." />
            <WhyTravelCard variant="dark" icon={FaPeopleGroup} title="Trusted Local Expertise" text="Passionate local guides and insider knowledge." />
            <WhyTravelCard variant="dark" icon={FaHandHoldingHeart} title="Responsible Travel" text="Protecting nature and empowering communities." />
            <WhyTravelCard variant="dark" icon={FaShieldHeart} title="Peace of Mind" text="Secure booking and 24/7 travel support." />
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <SectionHeader title="Moments from Our Journeys" />
          <div className="mt-9"><GalleryCarousel /></div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <SectionHeader title="What Our Travelers Say" />
          <div className="mt-9"><ReviewCarousel /></div>
          <div className="sr-only"><button type="button" onClick={onBook}>Plan Your Trip</button></div>
        </div>
      </section>
    </>
  )
}
