import { useEffect, useMemo, useRef, useState } from 'react'
import { FiFilter, FiX } from 'react-icons/fi'
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
  const [isOpen, setIsOpen] = useState(false)
  const [draftPriceRange, setDraftPriceRange] = useState<PriceRange>({
    min: selectedMinPrice,
    max: selectedMaxPrice,
  })
  const [draftDuration, setDraftDuration] = useState<DurationFilter>(selectedDuration)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  const usableMaxPrice = Math.max(maxPrice, minPrice + minGap)
  const rangeSize = usableMaxPrice - minPrice
  const minPosition = ((draftPriceRange.min - minPrice) / rangeSize) * 100
  const maxPosition = ((draftPriceRange.max - minPrice) / rangeSize) * 100
  const minLabelPosition = `clamp(2.25rem, ${minPosition}%, calc(100% - 2.25rem))`
  const maxLabelPosition = `clamp(2.25rem, ${maxPosition}%, calc(100% - 2.25rem))`

  const activeFilterCount = useMemo(() => {
    let count = 0

    if (selectedMinPrice !== minPrice || selectedMaxPrice !== maxPrice) count += 1
    if (selectedDuration !== 'all') count += 1

    return count
  }, [maxPrice, minPrice, selectedDuration, selectedMaxPrice, selectedMinPrice])

  useEffect(() => {
    if (!isOpen) {
      setDraftPriceRange({ min: selectedMinPrice, max: selectedMaxPrice })
      setDraftDuration(selectedDuration)
    }
  }, [isOpen, selectedDuration, selectedMaxPrice, selectedMinPrice])

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => closeButtonRef.current?.focus(), 80)
    }
  }, [isOpen])

  const updateMinPrice = (value: number) => {
    setDraftPriceRange((current) => ({
      min: Math.min(value, current.max - minGap),
      max: current.max,
    }))
  }

  const updateMaxPrice = (value: number) => {
    setDraftPriceRange((current) => ({
      min: current.min,
      max: Math.max(value, current.min + minGap),
    }))
  }

  const clearFilters = () => {
    setDraftPriceRange({ min: minPrice, max: maxPrice })
    setDraftDuration('all')
    onReset()
  }

  const applyFilters = () => {
    onPriceChange(draftPriceRange)
    onDurationChange(draftDuration)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-flex justify-end" ref={wrapperRef}>
      <button
        aria-expanded={isOpen}
        className="relative inline-flex min-h-11 items-center gap-2 rounded-full border border-[#eadfd3] bg-[#fffdf9] px-4 text-sm font-bold text-ink shadow-[0_14px_30px_rgba(17,24,39,0.07)] transition hover:border-primary hover:bg-[#fff4ec] focus-visible:ring-4 focus-visible:ring-primary/20"
        type="button"
        onClick={() => setIsOpen((open) => !open)}
      >
        <FiFilter className="text-primary" />
        <span className="hidden sm:inline">Filters</span>
        {activeFilterCount > 0 ? (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[0.65rem] font-black leading-none text-white">
            {activeFilterCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <>
          <button
            aria-label="Close filters"
            className="fixed inset-0 z-40 cursor-default bg-black/20 backdrop-blur-[1px] md:hidden"
            type="button"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-3 top-28 z-50 max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-[1.35rem] border border-[#eadfd3] bg-[#fffdf9] p-4 shadow-[0_28px_70px_rgba(17,24,39,0.2)] animate-filter-panel md:absolute md:inset-auto md:right-0 md:top-[calc(100%+0.75rem)] md:w-[23rem] md:max-h-none md:overflow-visible md:p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-bold text-ink">Filters</h2>
              <div className="flex items-center gap-3">
                <button
                  className="text-xs font-bold text-[#f97316] transition hover:text-[#c75d13]"
                  type="button"
                  onClick={clearFilters}
                >
                  Clear all
                </button>
                <button
                  aria-label="Close filters"
                  className="grid h-8 w-8 place-items-center rounded-full border border-[#eadfd3] bg-white text-ink transition hover:border-primary hover:bg-[#fff4ec]"
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  <FiX />
                </button>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">Price Range</p>
              <div className="relative mt-3 touch-none select-none px-1 pb-1 pt-7">
                <div
                  className="pointer-events-none absolute top-0 -translate-x-1/2 select-none rounded-md border border-[#eadfd3] bg-white px-2 py-0.5 text-[0.68rem] font-bold text-ink shadow-sm"
                  style={{ left: minLabelPosition }}
                >
                  {formatCurrency(draftPriceRange.min)}
                </div>
                <div
                  className="pointer-events-none absolute top-0 -translate-x-1/2 select-none rounded-md border border-[#eadfd3] bg-white px-2 py-0.5 text-[0.68rem] font-bold text-ink shadow-sm"
                  style={{ left: maxLabelPosition }}
                >
                  {formatCurrency(draftPriceRange.max)}
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
                  value={draftPriceRange.min}
                  onChange={(event) => updateMinPrice(Number(event.target.value))}
                />
                <input
                  aria-label="Maximum price"
                  className="tour-range-input"
                  max={usableMaxPrice}
                  min={minPrice}
                  step="50"
                  type="range"
                  value={draftPriceRange.max}
                  onChange={(event) => updateMaxPrice(Number(event.target.value))}
                />
                <div className="mt-4 flex items-center justify-between text-[0.68rem] font-semibold text-slate-500">
                  <span>{formatCurrency(minPrice)}</span>
                  <span>{formatCurrency(maxPrice)}+</span>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">Duration</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {durationOptions.map((option) => {
                  const isActive = draftDuration === option.value

                  return (
                    <button
                      className={`min-h-9 rounded-lg border px-3.5 text-xs font-bold transition ${
                        isActive
                          ? 'border-primary bg-primary text-white shadow-[0_10px_22px_rgba(255,164,96,0.28)]'
                          : 'border-[#eadfd3] bg-white text-ink hover:border-primary hover:bg-[#fff4ec]'
                      }`}
                      key={option.value}
                      type="button"
                      onClick={() => setDraftDuration(option.value)}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              className="mt-6 min-h-11 w-full rounded-lg bg-primary px-5 text-sm font-bold text-white shadow-orange transition hover:bg-[#f08f4f] focus-visible:ring-4 focus-visible:ring-primary/25"
              type="button"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
