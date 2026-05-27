import { FiArrowRight } from 'react-icons/fi'
import { allTours } from '../data/tours'
import { TourCard } from '../components/TourCard'
import { SectionHeader } from '../components/SectionHeader'
import ctaImage from '../assets/Venture-Uganda-Safari-Uganda-01.jpg'

export function ToursPage() {
  return (
    <>
      <main className="bg-white pt-28">
        <section className="section-padding pt-10">
          <div className="container-custom">
            <SectionHeader
              title="Our Tours"
              description="Handpicked safari experiences designed for unforgettable journeys across Uganda and East Africa."
            />
            <div className="mt-12 grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {allTours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
            </div>
          </div>
        </section>
        <section className="relative overflow-hidden bg-cover bg-center py-28 text-center text-white" style={{ backgroundImage: `url(${ctaImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-[#7a2c0f]/65 to-black/70" />
          <div className="container-custom relative z-10">
            <p className="font-bold">Explore. Discover. Adventure. Travel</p>
            <h2 className="mx-auto mt-6 max-w-6xl text-4xl font-black leading-tight md:text-7xl">YOUR JOURNEY AWAITS - LET’S PLAN YOUR DREAM TRIP</h2>
            <a className="btn-primary mt-9" href="#contact">CONTACT OUR TEAM <FiArrowRight /></a>
          </div>
        </section>
      </main>
    </>
  )
}
