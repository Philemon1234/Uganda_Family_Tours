import type { PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocale } from '../context/LocaleContext'

export type DurationFilter = 'all' | '2-5' | '6-8' | '9-12' | '13-20' | '20-plus'
export type RegionFilter = 'all' | 'east-africa'

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
  selectedRegion: RegionFilter
  onPriceChange: (range: PriceRange) => void
  onDurationChange: (duration: DurationFilter) => void
  onRegionChange: (region: RegionFilter) => void
  onReset: () => void
}

const durationOptions: Array<{ value: DurationFilter; labelKey: string }> = [
  { value: 'all', labelKey: 'tourFilters.durationOptions.all' },
  { value: '2-5', labelKey: 'tourFilters.durationOptions.twoFive' },
  { value: '6-8', labelKey: 'tourFilters.durationOptions.sixEight' },
  { value: '9-12', labelKey: 'tourFilters.durationOptions.nineTwelve' },
  { value: '13-20', labelKey: 'tourFilters.durationOptions.thirteenTwenty' },
  { value: '20-plus', labelKey: 'tourFilters.durationOptions.twentyPlus' },
]

const regionOptions: Array<{ value: RegionFilter; labelKey: string }> = [
  { value: 'east-africa', labelKey: 'tourFilters.regionOptions.eastAfrica' },
]

const minGap = 50

export function TourFilters({
  minPrice,
  maxPrice,
  selectedMinPrice,
  selectedMaxPrice,
  selectedDuration,
  selectedRegion,
  onPriceChange,
  onDurationChange,
  onRegionChange,
}: TourFiltersProps) {
  const { t } = useTranslation()
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
      aria-label={t('tourFilters.ariaLabel')}
      className="rounded-[1rem] border border-[#eadfd3] bg-[#fffdf9] p-4 shadow-[0_18px_45px_rgba(17,24,39,0.06)] md:p-5"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(39rem,42rem)] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{t('tourFilters.priceRange')}</p>
          <div className="tour-range-control relative mt-3 touch-none select-none px-1 pb-1 pt-7">
            <div
              className="currency-range-label pointer-events-none absolute top-0 -translate-x-1/2 select-none rounded-md border border-[#eadfd3] bg-white px-2 py-0.5 text-[0.68rem] font-bold text-ink shadow-sm"
              style={{ left: minLabelPosition }}
            >
              <span className="currency-value">{formatCurrency(selectedMinPrice)}</span>
            </div>
            <div
              className="currency-range-label pointer-events-none absolute top-0 -translate-x-1/2 select-none rounded-md border border-[#eadfd3] bg-white px-2 py-0.5 text-[0.68rem] font-bold text-ink shadow-sm"
              style={{ left: maxLabelPosition }}
            >
              <span className="currency-value">{formatCurrency(selectedMaxPrice)}</span>
            </div>
            <div className="tour-range-track" onPointerDown={handleTrackPointerDown}>
              <span
                className="absolute top-0 h-full rounded-full bg-primary"
                style={{ left: `${minPosition}%`, right: `${100 - maxPosition}%` }}
              />
            </div>
            <input
              aria-label={t('tourFilters.minimumPrice')}
              className="tour-range-input"
              max={usableMaxPrice}
              min={minPrice}
              step="50"
              type="range"
              value={selectedMinPrice}
              onChange={(event) => updateMinPrice(Number(event.target.value))}
            />
            <input
              aria-label={t('tourFilters.maximumPrice')}
              className="tour-range-input"
              max={usableMaxPrice}
              min={minPrice}
              step="50"
              type="range"
              value={selectedMaxPrice}
              onChange={(event) => updateMaxPrice(Number(event.target.value))}
            />
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{t('tourFilters.duration')}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {durationOptions.map((option) => {
                const isActive = selectedDuration === option.value

                return (
                  <button
                    className={`min-h-9 whitespace-nowrap rounded-lg border px-4 text-xs font-bold transition ${
                      isActive
                        ? 'border-primary bg-primary text-white shadow-[0_10px_22px_rgba(251,119,13,0.28)]'
                        : 'border-[#eadfd3] bg-white text-ink hover:border-primary hover:bg-[#fff4ec]'
                    }`}
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onRegionChange('all')
                      onDurationChange(option.value)
                    }}
                  >
                    {t(option.labelKey)}
                  </button>
                )
              })}

              {regionOptions.map((option) => {
                const isActive = selectedRegion === option.value

                return (
                  <button
                    className={`min-h-9 whitespace-nowrap rounded-lg border px-4 text-xs font-bold transition ${
                      isActive
                        ? 'border-primary bg-primary text-white shadow-[0_10px_22px_rgba(251,119,13,0.28)]'
                        : 'border-[#eadfd3] bg-white text-ink hover:border-primary hover:bg-[#fff4ec]'
                    }`}
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onDurationChange('all')
                      onRegionChange(isActive ? 'all' : option.value)
                    }}
                  >
                    {t(option.labelKey)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
