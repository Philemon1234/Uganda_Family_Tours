import { useMemo, useState } from 'react'
import { Route, Routes, useLocation, useParams } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { BookingModal } from './components/BookingModal'
import { InquiryModal } from './components/InquiryModal'
import { ScrollToTop } from './components/ScrollToTop'
import { MobileBottomNav } from './components/navigation/MobileBottomNav'
import { HomePage } from './pages/HomePage'
import { ToursPage } from './pages/ToursPage'
import { ItineraryPage } from './pages/ItineraryPage'
import { AboutPage } from './pages/AboutPage'
import { tours, type Tour } from './data/tours'

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const [bookingTour, setBookingTour] = useState<Tour | undefined>(tours[0])
  const location = useLocation()

  const currentTour = useMemo(() => {
    const slug = location.pathname.split('/').pop()
    return tours.find((tour) => tour.slug === slug) ?? tours[0]
  }, [location.pathname])

  const openBooking = (tour = currentTour) => {
    setBookingTour(tour)
    setIsBookingOpen(true)
  }

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-ink lg:pb-0">
      <ScrollToTop />
      <Navbar onInquiry={() => setIsInquiryOpen(true)} />
      <div key={location.pathname} className="page-transition">
        <Routes>
          <Route path="/" element={<HomePage onBook={() => openBooking(tours[0])} />} />
          <Route path="/about" element={<AboutPage onInquiry={() => setIsInquiryOpen(true)} />} />
          <Route path="/tours" element={<ToursPage onInquiry={() => setIsInquiryOpen(true)} />} />
          <Route path="/tours/:tourId" element={<ItineraryRoute onBook={openBooking} />} />
        </Routes>
      </div>
      <Footer />
      <MobileBottomNav />
      <BookingModal isOpen={isBookingOpen} tour={bookingTour} onClose={() => setIsBookingOpen(false)} />
      <InquiryModal isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
    </div>
  )
}

function ItineraryRoute({ onBook }: { onBook: (tour?: Tour) => void }) {
  const { tourId } = useParams()
  const tour = tours.find((item) => item.slug === tourId) ?? tours[0]
  return <ItineraryPage onBook={() => onBook(tour)} />
}

export default App
