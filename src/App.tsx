import { useEffect, useState } from 'react'
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
import { defaultHomeCustomization } from './services/homeCustomizationDefaults'
import { getPublishedHomepageCustomization, subscribeToHomepageCustomizationChanges } from './services/homeCustomizationService'
import type { HomeCustomizationContent } from './types/homeCustomization'

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const [bookingTour, setBookingTour] = useState<Tour | undefined>(tours[0])
  const [activeTourPackageId, setActiveTourPackageId] = useState<string | undefined>()
  const [inquiryPackageId, setInquiryPackageId] = useState<string | undefined>()
  const [homeCustomization, setHomeCustomization] = useState<HomeCustomizationContent>(defaultHomeCustomization)
  const location = useLocation()

  useEffect(() => {
    let isMounted = true

    async function loadCustomization() {
      try {
        const customization = await getPublishedHomepageCustomization()
        if (isMounted) setHomeCustomization(customization)
      } catch {
        if (isMounted) setHomeCustomization(defaultHomeCustomization)
      }
    }

    void loadCustomization()
    const unsubscribe = subscribeToHomepageCustomizationChanges(() => {
      void loadCustomization()
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const openBooking = (tour = tours[0]) => {
    setBookingTour(tour)
    setIsBookingOpen(true)
  }

  const openInquiry = () => {
    setInquiryPackageId(location.pathname.startsWith('/tours/') ? activeTourPackageId : undefined)
    setIsInquiryOpen(true)
  }


  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-ink lg:pb-0">
      <ScrollToTop />
      <Navbar customization={homeCustomization} onInquiry={openInquiry} />
      <div key={location.pathname} className="page-transition">
        <Routes>
          <Route path="/" element={<HomePage customization={homeCustomization} onInquiry={openInquiry} />} />
          <Route path="/about" element={<AboutPage onInquiry={openInquiry} />} />
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/tours/:tourId" element={<ItineraryRoute onBook={openBooking} onPackageLoad={setActiveTourPackageId} />} />
        </Routes>
      </div>
      <Footer customization={homeCustomization} />
      <MobileBottomNav />
      <BookingModal isOpen={isBookingOpen} tour={bookingTour} onClose={() => setIsBookingOpen(false)} />
      <InquiryModal isOpen={isInquiryOpen} packageId={inquiryPackageId} onClose={() => setIsInquiryOpen(false)} />
    </div>
  )
}

function ItineraryRoute({
  onBook,
  onPackageLoad,
}: {
  onBook: (tour?: Tour) => void
  onPackageLoad: (packageId: string) => void
}) {
  const { tourId } = useParams()
  return <ItineraryPage slug={tourId ?? ''} onBook={onBook} onPackageLoad={onPackageLoad} />
}

export default App
