import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import type { TourPackageLocation } from '../types/tourPackage'

type TourRouteMapProps = {
  locations: TourPackageLocation[]
  title?: string
}

type RouteMarkerProps = {
  isAnimationReady: boolean
  location: TourPackageLocation
  index: number
  isActive: boolean
  onSelect: (location: TourPackageLocation) => void
}

const ROUTE_ORANGE = '#FB770D'
const UGANDA_BOUNDS = {
  maxLat: 4.4,
  maxLng: 35.2,
  minLat: -1.6,
  minLng: 29.3,
}

function isUsableCoordinate(location: TourPackageLocation) {
  return (
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) &&
    location.latitude >= UGANDA_BOUNDS.minLat &&
    location.latitude <= UGANDA_BOUNDS.maxLat &&
    location.longitude >= UGANDA_BOUNDS.minLng &&
    location.longitude <= UGANDA_BOUNDS.maxLng
  )
}

function getBounds(locations: TourPackageLocation[]) {
  return L.latLngBounds(locations.map((location) => [location.latitude, location.longitude]))
}

function getInterpolatedPositions(positions: [number, number][], progress: number) {
  if (positions.length < 2 || progress <= 0) return []

  const maxProgress = positions.length - 1
  const clampedProgress = Math.min(Math.max(progress, 0), maxProgress)
  const wholeSegments = Math.floor(clampedProgress)
  const segmentProgress = clampedProgress - wholeSegments
  const nextPositions = positions.slice(0, wholeSegments + 1)

  if (wholeSegments < positions.length - 1) {
    const [startLat, startLng] = positions[wholeSegments]
    const [endLat, endLng] = positions[wholeSegments + 1]
    nextPositions.push([
      startLat + (endLat - startLat) * segmentProgress,
      startLng + (endLng - startLng) * segmentProgress,
    ])
  }

  return nextPositions
}

function FitRouteBounds({ locations, focusedLocation }: { locations: TourPackageLocation[]; focusedLocation: TourPackageLocation | null }) {
  const map = useMap()

  useEffect(() => {
    if (focusedLocation) {
      map.flyTo([focusedLocation.latitude, focusedLocation.longitude], Math.max(map.getZoom(), 8), {
        duration: 0.8,
      })
      return
    }

    window.setTimeout(() => map.invalidateSize(), 0)

    if (locations.length === 1) {
      map.setView([locations[0].latitude, locations[0].longitude], 8)
      return
    }

    if (locations.length > 1) {
      const isMobile = window.matchMedia('(max-width: 767px)').matches

      map.fitBounds(getBounds(locations), {
        animate: false,
        maxZoom: isMobile ? 9 : 10,
        padding: isMobile ? [34, 34] : [46, 46],
      })
    }
  }, [focusedLocation, locations, map])

  return null
}

function AnimatedRoute({ positions }: { positions: [number, number][] }) {
  if (positions.length < 2) return null

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: ROUTE_ORANGE,
        dashArray: '8 10',
        lineCap: 'round',
        lineJoin: 'round',
        opacity: 0.86,
        weight: 3,
      }}
    />
  )
}

function createMarkerIcon(location: TourPackageLocation, index: number, isActive: boolean, isAnimationReady: boolean) {
  return L.divIcon({
    className: '',
    html: `<span role="button" aria-label="Day ${location.day_order}: ${location.location_name}" class="tour-map-pin ${isActive ? 'tour-map-pin-active' : ''} ${isAnimationReady ? '' : 'tour-map-pin-waiting'}" style="--pin-delay: ${index * 120}ms"><span>${index + 1}</span></span>`,
    iconAnchor: [16, 34],
    iconSize: [32, 38],
    popupAnchor: [0, -32],
  })
}

function RouteMarker({ isAnimationReady, location, index, isActive, onSelect }: RouteMarkerProps) {
  const icon = useMemo(() => createMarkerIcon(location, index, isActive, isAnimationReady), [index, isActive, isAnimationReady, location])

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={icon}
      keyboard
      title={`Day ${location.day_order}: ${location.location_name}`}
      eventHandlers={{
        click: () => onSelect(location),
        keypress: () => onSelect(location),
      }}
    />
  )
}

function RouteStopCard({ location }: { location: TourPackageLocation }) {
  return (
    <article className="overflow-hidden rounded-[1.2rem] border border-border/80 bg-white shadow-[0_18px_42px_rgba(17,24,39,0.08)]">
      {location.image_url ? (
        <img
          src={location.image_url}
          alt={location.location_name}
          loading="lazy"
          className="h-40 w-full object-cover sm:h-48"
        />
      ) : null}
      <div className="p-4">
        <p className="text-safe text-base font-semibold text-ink">{location.location_name}</p>
        <p className="mt-2 text-sm font-semibold text-primary">Day {location.day_order}</p>
        {location.notes ? (
          <p className="text-safe mt-3 text-sm leading-6 text-muted">{location.notes}</p>
        ) : null}
      </div>
    </article>
  )
}

function StaticRouteFallback({ locations }: { locations: TourPackageLocation[] }) {
  return (
    <div className="rounded-[1.15rem] border border-border/80 bg-white p-4 shadow-[0_18px_45px_rgba(17,24,39,0.06)]">
      <div className="space-y-3">
        {locations.map((location, index) => (
          <div key={location.id} className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-ink">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-safe text-sm font-semibold text-ink">{location.location_name}</p>
              {location.day_order || location.notes ? (
                <p className="text-safe mt-1 text-xs leading-5 text-muted">
                  Day {location.day_order}
                  {location.notes ? ' - ' : ''}
                  {location.notes ?? ''}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TourRouteMap({ locations }: TourRouteMapProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const routeLocations = useMemo(
    () => locations.filter(isUsableCoordinate).sort((first, second) => first.day_order - second.day_order),
    [locations],
  )
  const [activeLocation, setActiveLocation] = useState<TourPackageLocation | null>(null)
  const [focusedLocation, setFocusedLocation] = useState<TourPackageLocation | null>(null)
  const [isUserPaused, setIsUserPaused] = useState(false)
  const [routeProgress, setRouteProgress] = useState(0)
  const [hasActivated, setHasActivated] = useState(false)
  const positions = useMemo<[number, number][]>(
    () => routeLocations.map((location) => [location.latitude, location.longitude]),
    [routeLocations],
  )
  const animatedPositions = useMemo(
    () => getInterpolatedPositions(positions, routeProgress),
    [positions, routeProgress],
  )

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasActivated(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!hasActivated || isUserPaused || routeLocations.length === 0) return

    let step = 0
    let closeTimer = 0
    let nextTimer = 0
    let startTimer = 0
    let animationFrame = 0

    setRouteProgress(0)
    setActiveLocation(null)
    setFocusedLocation(null)

    const animateToStep = (nextStep: number) => {
      const fromProgress = Math.max(0, nextStep - 1)
      const startedAt = performance.now()
      const duration = 1450

      const tick = (now: number) => {
        const elapsed = now - startedAt
        const progress = Math.min(1, elapsed / duration)
        setRouteProgress(fromProgress + progress)

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick)
          return
        }

        step = nextStep
        showStop()
      }

      animationFrame = window.requestAnimationFrame(tick)
    }

    const showStop = () => {
      setActiveLocation(routeLocations[step])

      closeTimer = window.setTimeout(() => {
        setActiveLocation(null)

        if (step >= routeLocations.length - 1) return

        step += 1
        nextTimer = window.setTimeout(() => animateToStep(step), 450)
      }, 3600)
    }

    startTimer = window.setTimeout(showStop, 450)

    return () => {
      window.clearTimeout(startTimer)
      window.clearTimeout(closeTimer)
      window.clearTimeout(nextTimer)
      window.cancelAnimationFrame(animationFrame)
    }
  }, [hasActivated, isUserPaused, routeLocations])

  if (routeLocations.length === 0) {
    return null
  }

  const initialCenter: [number, number] = [1.3733, 32.2903]
  const activeIndex = activeLocation
    ? routeLocations.findIndex((location) => location.id === activeLocation.id)
    : -1
  const handleSelectLocation = (location: TourPackageLocation) => {
    const locationIndex = routeLocations.findIndex((currentLocation) => currentLocation.id === location.id)

    setIsUserPaused(true)
    setActiveLocation(location)
    setFocusedLocation(location)

    if (locationIndex > -1) {
      setRouteProgress((currentProgress) => Math.max(currentProgress, locationIndex))
    }
  }

  return (
    <section ref={sectionRef} id="route-map" className="scroll-mt-28">
      <div className="relative isolate z-0 h-[22rem] min-w-0 overflow-hidden rounded-[1.35rem] border border-border/80 bg-[#f8f3ec] shadow-[0_22px_55px_rgba(17,24,39,0.08)] sm:h-[24rem] md:h-[36rem]">
          <MapContainer
            center={initialCenter}
            zoom={7}
            scrollWheelZoom={false}
            className="h-full w-full font-sans"
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap contributors &copy; CARTO"
            />
            <FitRouteBounds locations={routeLocations} focusedLocation={focusedLocation} />
            <AnimatedRoute positions={animatedPositions} />
            {routeLocations.map((location, index) => (
              <RouteMarker
                key={location.id}
                isAnimationReady={hasActivated}
                location={location}
                index={index}
                isActive={activeIndex === index}
                onSelect={handleSelectLocation}
              />
            ))}
          </MapContainer>
      </div>

      <div className="mt-4 md:hidden">
        <div key={(activeLocation ?? routeLocations[0]).id} className="animate-route-stop-card">
          <RouteStopCard location={activeLocation ?? routeLocations[0]} />
        </div>
      </div>

      <noscript>
        <StaticRouteFallback locations={routeLocations} />
      </noscript>
    </section>
  )
}

export default TourRouteMap
