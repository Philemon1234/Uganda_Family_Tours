import { useMemo } from 'react'
import { FiFilter } from 'react-icons/fi'
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
  onReset,
}: TourFiltersProps) {
  const { formatCurrency } = useLocale()

  const usableMaxPrice = Math.max(maxPrice, minPrice + minGap)
  const rangeSize = usableMaxPrice - minPrice
  const minPosition = ((selectedMinPrice - minPrice) / rangeSize) * 100
  const maxPosition = ((selectedMaxPrice - minPrice) / rangeSize) * 100
  const minLabelPosition = `clamp(2.25rem, ${minPosition}%, calc(100% - 2.25rem))`
  const maxLabelPosition = `clamp(2.25rem, ${maxPosition}%, calc(100% - 2.25rem))`

  const activeFilterCount = useMemo(() => {
    let count = 0

    if (selectedMinPrice !== minPrice || selectedMaxPrice !== maxPrice) count += 1
    if (selectedDuration !== 'all') count += 1

    return count
  }, [maxPrice, minPrice, selectedDuration, selectedMaxPrice, selectedMinPrice])

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

  return (
    <section
      aria-label="Tour filters"
      className="rounded-[1rem] border border-[#eadfd3] bg-[#fffdf9] p-4 shadow-[0_18px_45px_rgba(17,24,39,0.06)] md:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fff4ec] text-primary">
            <FiFilter />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-ink">Filters</h2>
            <p className="text-sm text-muted">Refine tours by budget and trip length.</p>
          </div>
        </div>

        {activeFilterCount > 0 ? (
          <button
            className="min-h-9 rounded-lg border border-[#eadfd3] bg-white px-3.5 text-xs font-bold text-[#f97316] transition hover:border-primary hover:bg-[#fff4ec]"
            type="button"
            onClick={onReset}
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">Price Range</p>
          <div className="relative mt-3 touch-none select-none px-1 pb-1 pt-7">
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
            <div className="tour-range-track">
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
