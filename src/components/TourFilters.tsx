import type { PointerEvent } from 'react'
import { useLocale } from '../context/LocaleContext'

export type DurationFilter = 'all' | '1-2' | '3-4' | '5-7' | '8-plus'

type PriceRange = {
  min: number
  max: number
}

type TourFiltersProps = {
  minPrice: number
  maxPrice: number
  selectedMinPrice: number
  selectedMaxPrice: number
  selectedDuration: DurationFilter
  onPriceChange: (range: PriceRange) => void
  onDurationChange: (duration: DurationFilter) => void
  onReset: () => void
}

const durationOptions: Array<{ value: DurationFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: '1-2', label: '1-2 Days' },
  { value: '3-4', label: '3-4 Days' },
  { value: '5-7', label: '5-7 Days' },
  { value: '8-plus', label: '8+ Days' },
]

const minGap = 50

export function TourFilters({
  minPrice,
  maxPrice,
  selectedMinPrice,
  selectedMaxPrice,
  selectedDuration,
  onPriceChange,
  onDurationChange,
}: TourFiltersProps) {
  const { formatCurrency } = useLocale()

  const usableMaxPrice = Math.max(maxPrice, minPrice + minGap)
  const rangeSize = usableMaxPrice - minPrice
  const minPosition = ((selectedMinPrice - minPrice) / rangeSize) * 100
  const maxPosition = ((selectedMaxPrice - minPrice) / rangeSize) * 100
  const minLabelPosition = `clamp(2.25rem, ${minPosition}%, calc(100% - 2.25rem))`
  const maxLabelPosition = `clamp(2.25rem, ${maxPosition}%, calc(100% - 2.25rem))`

  const updateMinPrice = (value: number) => {
    onPriceChange({
      min: Math.min(value, selectedMaxPrice - minGap),
      max: selectedMaxPrice,
    })
  }

  const updateMaxPrice = (value: number) => {
    onPriceChange({
      min: selectedMinPrice,
      max: Math.max(value, selectedMinPrice + minGap),
    })
  }

  const handleTrackPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const position = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1)
    const rawValue = minPrice + position * rangeSize
    const steppedValue = Math.round(rawValue / 50) * 50
    const boundedValue = Math.min(Math.max(steppedValue, minPrice), usableMaxPrice)
    const distanceToMin = Math.abs(boundedValue - selectedMinPrice)
    const distanceToMax = Math.abs(boundedValue - selectedMaxPrice)

    if (distanceToMin <= distanceToMax) {
      updateMinPrice(boundedValue)
      return
    }

    updateMaxPrice(boundedValue)
  }

  return (
    <section
      aria-label="Tour filters"
      className="rounded-[1rem] border border-[#eadfd3] bg-[#fffdf9] p-4 shadow-[0_18px_45px_rgba(17,24,39,0.06)] md:p-5"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">Price Range</p>
          <div className="tour-range-control relative mt-3 touch-none select-none px-1 pb-1 pt-7">
            <div
              className="pointer-events-none absolute top-0 -translate-x-1/2 select-none rounded-md border border-[#eadfd3] bg-white px-2 py-0.5 text-[0.68rem] font-bold text-ink shadow-sm"
              style={{ left: minLabelPosition }}
            >
              {formatCurrency(selectedMinPrice)}
            </div>
            <div
              className="pointer-events-none absolute top-0 -translate-x-1/2 select-none rounded-md border border-[#eadfd3] bg-white px-2 py-0.5 text-[0.68rem] font-bold text-ink shadow-sm"
              style={{ left: maxLabelPosition }}
            >
              {formatCurrency(selectedMaxPrice)}
            </div>
            <div className="tour-range-track" onPointerDown={handleTrackPointerDown}>
              <span
                className="absolute top-0 h-full rounded-full bg-primary"
                style={{ left: `${minPosition}%`, right: `${100 - maxPosition}%` }}
              />
            </div>
            <input
              aria-label="Minimum price"
              className="tour-range-input"
              max={usableMaxPrice}
              min={minPrice}
              step="50"
              type="range"
              value={selectedMinPrice}
              onChange={(event) => updateMinPrice(Number(event.target.value))}
            />
            <input
              aria-label="Maximum price"
              className="tour-range-input"
              max={usableMaxPrice}
              min={minPrice}
              step="50"
              type="range"
              value={selectedMaxPrice}
              onChange={(event) => updateMaxPrice(Number(event.target.value))}
            />
            <div className="mt-4 flex items-center justify-between text-[0.68rem] font-semibold text-slate-500">
              <span>{formatCurrency(minPrice)}</span>
              <span>{formatCurrency(maxPrice)}+</span>
            </div>
          </div>
        </div>

        <div className="lg:w-[28rem]">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">Duration</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-2 xl:grid-cols-5">
            {durationOptions.map((option) => {
              const isActive = selectedDuration === option.value

              return (
                <button
                  className={`min-h-9 rounded-lg border px-3.5 text-xs font-bold transition ${
                    isActive
                      ? 'border-primary bg-primary text-white shadow-[0_10px_22px_rgba(251,119,13,0.28)]'
                      : 'border-[#eadfd3] bg-white text-ink hover:border-primary hover:bg-[#fff4ec]'
                  }`}
                  key={option.value}
                  type="button"
                  onClick={() => onDurationChange(option.value)}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
