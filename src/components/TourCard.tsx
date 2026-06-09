import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import type { Tour } from '../data/tours'
import { MotionReveal } from './MotionReveal'
import { useLocale } from '../context/LocaleContext'
import { getLocalizedTourShortDescription, getLocalizedTourTitle } from '../utils/localizedTourContent'

type TourCardProps = {
  tour: Tour
  revealDelay?: number
}

export function TourCard({ tour, revealDelay = 0 }: TourCardProps) {
  const { t } = useTranslation()
  const { formatCardCurrency } = useLocale()
  const title = getLocalizedTourTitle(t, tour)
  const shortDescription = getLocalizedTourShortDescription(t, tour)
  const durationDays = tour.duration.match(/\d+/)?.[0] ?? tour.duration

  return (
    <MotionReveal delay={revealDelay}>
      <Link
        to={`/tours/${tour.slug}`}
        className="group relative flex h-full min-w-0 max-w-full flex-col overflow-visible rounded-[1.75rem] bg-white pb-0 shadow-[0_18px_42px_rgba(17,24,39,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(17,24,39,0.12)]"
      >
        <div className="relative h-72 overflow-hidden rounded-t-[1.75rem]">
          <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={tour.image} alt={title} />
          <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
        </div>
        <span className="tour-price-badge absolute left-4 top-[12.85rem] z-30 rounded-full bg-dark px-4 py-2.5 text-base font-black leading-none text-white shadow-[0_14px_30px_rgba(37,66,76,0.18)] sm:-left-4">
          <span className="currency-value">{formatCardCurrency(tour.priceUSD)}</span>
        </span>
        <div className="relative z-10 -mt-8 flex min-h-60 min-w-0 flex-1 flex-col rounded-t-[1.75rem] rounded-b-[1.75rem] bg-white px-7 pb-7 pt-9">
          <h3 className="clamp-2 text-safe min-h-[3.75rem] text-2xl font-medium leading-tight text-dark transition group-hover:text-primary">{title}</h3>
          <p className="tour-description mt-4 flex-1 text-lg leading-7 text-muted">
            {shortDescription || t('tourCard.fallbackDescription')}
          </p>
          <div className="mt-6 flex min-w-0 items-center justify-between gap-4">
            <span className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-primary bg-transparent px-4 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-primary transition group-hover:bg-primary/5">
              <span className="truncate">
              {t('tourCard.getPackage')}
              </span>
              <FiArrowRight className="text-primary transition group-hover:translate-x-0.5" />
            </span>
            <span className="shrink-0 text-base font-semibold text-slate-600">
              {durationDays} {t('common.days')}
            </span>
          </div>
        </div>
      </Link>
    </MotionReveal>
  )
}
