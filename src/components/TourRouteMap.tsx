import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { FiMapPin } from 'react-icons/fi'
import type { TourPackageLocation } from '../types/tourPackage'

type TourRouteMapProps = {
  locations: TourPackageLocation[]
  title: string
}

type RouteMarkerProps = {
  location: TourPackageLocation
  index: number
  isActive: boolean
  onSelect: (location: TourPackageLocation) => void
}

const ROUTE_ORANGE = '#f08f4f'

function isUsableCoordinate(location: TourPackageLocation) {
  return (
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) &&
    Math.abs(location.latitude) <= 90 &&
    Math.abs(location.longitude) <= 180
  )
}

function getBounds(locations: TourPackageLocation[]) {
  return L.latLngBounds(locations.map((location) => [location.latitude, location.longitude]))
}

function FitRouteBounds({ locations, activeLocation }: { locations: TourPackageLocation[]; activeLocation: TourPackageLocation | null }) {
  const map = useMap()

  useEffect(() => {
    if (activeLocation) {
      map.flyTo([activeLocation.latitude, activeLocation.longitude], Math.max(map.getZoom(), 8), {
        duration: 0.8,
      })
      return
    }

    if (locations.length === 1) {
      map.setView([locations[0].latitude, locations[0].longitude], 8)
      return
    }

    if (locations.length > 1) {
      map.fitBounds(getBounds(locations), {
        animate: true,
        padding: [34, 34],
      })
    }
  }, [activeLocation, locations, map])

  return null
}

function AnimatedRoute({ positions }: { positions: [number, number][] }) {
  const [routeRef, setRouteRef] = useState<L.Polyline | null>(null)

  useEffect(() => {
    const path = routeRef?.getElement() as SVGPathElement | null
    if (!path) return

    path.style.opacity = '0'
    path.getBoundingClientRect()
    path.style.transition = 'opacity 900ms cubic-bezier(0.22, 1, 0.36, 1)'
    path.style.opacity = '0.86'
  }, [positions, routeRef])

  if (positions.length < 2) return null

  return (
    <Polyline
      ref={setRouteRef}
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

function createMarkerIcon(index: number, isActive: boolean) {
  return L.divIcon({
    className: '',
    html: `<span class="tour-map-pin ${isActive ? 'tour-map-pin-active' : ''}" style="--pin-delay: ${index * 120}ms"><span>${index + 1}</span></span>`,
    iconAnchor: [16, 34],
    iconSize: [32, 38],
    popupAnchor: [0, -32],
  })
}

function RouteMarker({ location, index, isActive, onSelect }: RouteMarkerProps) {
  const icon = useMemo(() => createMarkerIcon(index, isActive), [index, isActive])

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(location),
        mouseover: (event) => event.target.openPopup(),
      }}
    >
      <Popup className="tour-map-popup" closeButton={false}>
        <div className="font-sans">
          <p className="text-sm font-semibold text-ink">{location.location_name}</p>
          <p className="mt-1 text-xs font-semibold text-primary">Day {location.day_order}</p>
          {location.notes ? (
            <p className="mt-1 max-w-52 text-xs leading-5 text-muted">{location.notes}</p>
          ) : null}
        </div>
      </Popup>
    </Marker>
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

function TourRouteMap({ locations, title }: TourRouteMapProps) {
  const routeLocations = useMemo(
    () => locations.filter(isUsableCoordinate).sort((first, second) => first.day_order - second.day_order),
    [locations],
  )
  const [activeLocation, setActiveLocation] = useState<TourPackageLocation | null>(null)
  const positions = useMemo<[number, number][]>(
    () => routeLocations.map((location) => [location.latitude, location.longitude]),
    [routeLocations],
  )

  if (routeLocations.length === 0) {
    return null
  }

  const initialCenter = positions[0]
  const activeIndex = activeLocation
    ? routeLocations.findIndex((location) => location.id === activeLocation.id)
    : -1

  return (
    <section id="route-map" className="scroll-mt-28">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-safe text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">Route map</p>
          <h2 className="content-title text-safe mt-2">{title} journey path</h2>
        </div>
        <p className="text-safe max-w-xl text-sm leading-6 text-muted">
          Explore each stop in sequence, then tap a pin to focus the map on that destination.
        </p>
      </div>

      <div className="grid min-w-0 overflow-hidden rounded-[1.35rem] border border-border/80 bg-white shadow-[0_22px_55px_rgba(17,24,39,0.08)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="max-h-[26rem] min-w-0 overflow-y-auto border-b border-border/80 bg-[#fffaf6] p-4 lg:border-b-0 lg:border-r">
          <p className="text-safe text-sm font-semibold text-ink">Destinations ({routeLocations.length})</p>
          <div className="mt-4 space-y-2">
            {routeLocations.map((location, index) => {
              const isActive = activeIndex === index

              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => setActiveLocation(location)}
                  className={`flex w-full min-w-0 items-start gap-3 rounded-xl px-3 py-2 text-left transition ${
                    isActive ? 'bg-white shadow-[0_10px_26px_rgba(17,24,39,0.08)] ring-1 ring-primary/40' : 'hover:bg-white/80'
                  }`}
                >
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-ink">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="text-safe block text-sm font-semibold text-ink">{location.location_name}</span>
                    <span className="text-safe mt-0.5 block text-xs font-semibold text-muted">Day {location.day_order}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="relative h-[24rem] min-w-0 bg-[#f8f3ec] md:h-[31rem]">
          <MapContainer
            center={initialCenter}
            zoom={7}
            scrollWheelZoom={false}
            className="h-full w-full font-sans"
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <FitRouteBounds locations={routeLocations} activeLocation={activeLocation} />
            <AnimatedRoute positions={positions} />
            {routeLocations.map((location, index) => (
              <RouteMarker
                key={location.id}
                location={location}
                index={index}
                isActive={activeIndex === index}
                onSelect={setActiveLocation}
              />
            ))}
          </MapContainer>

          {activeLocation ? (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[500] rounded-xl border border-border/80 bg-white/95 p-3 shadow-[0_16px_34px_rgba(17,24,39,0.14)] backdrop-blur md:hidden">
              <div className="flex min-w-0 items-start gap-3">
                <FiMapPin className="mt-1 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-safe text-sm font-semibold text-ink">{activeLocation.location_name}</p>
                  {activeLocation.day_order || activeLocation.notes ? (
                    <p className="text-safe mt-1 text-xs leading-5 text-muted">
                      Day {activeLocation.day_order}
                      {activeLocation.notes ? ' - ' : ''}
                      {activeLocation.notes ?? ''}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <noscript>
        <StaticRouteFallback locations={routeLocations} />
      </noscript>
    </section>
  )
}

export default TourRouteMap
