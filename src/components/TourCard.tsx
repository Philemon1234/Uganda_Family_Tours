import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import type { Tour } from '../data/tours'
import { MotionReveal } from './MotionReveal'
import { useLocale } from '../context/LocaleContext'

type TourCardProps = {
  tour: Tour
  revealDelay?: number
}

export function TourCard({ tour, revealDelay = 0 }: TourCardProps) {
  const { t } = useTranslation()
  const { formatCurrency } = useLocale()
  const contentKey = tour.slug.replace(/-\d+$/, '')
  const title = t(`tourContent.${contentKey}.title`, { defaultValue: tour.title })
  const shortDescription = t(`tourContent.${contentKey}.shortDescription`, { defaultValue: tour.shortDescription })
  const durationDays = tour.duration.match(/\d+/)?.[0] ?? tour.duration

  return (
    <MotionReveal delay={revealDelay}>
      <Link
        to={`/tours/${tour.slug}`}
        className="group relative flex h-full min-w-0 max-w-full flex-col overflow-visible rounded-[1.75rem] border border-[#eadfd3] bg-white pb-0 shadow-[0_18px_42px_rgba(17,24,39,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#decfc0] hover:shadow-[0_24px_55px_rgba(17,24,39,0.12)]"
      >
        <div className="relative h-72 overflow-hidden rounded-t-[1.75rem]">
          <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={tour.image} alt={title} />
          <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
        </div>
        <span className="absolute left-4 top-[12.85rem] z-30 rounded-xl border border-white/35 bg-[#263238]/95 px-4 py-2.5 text-base font-black leading-none text-white shadow-[0_14px_30px_rgba(17,24,39,0.18)] sm:-left-4">
          {formatCurrency(tour.priceUSD)}
        </span>
        <div className="relative z-10 -mt-8 flex min-h-60 min-w-0 flex-1 flex-col rounded-t-[1.75rem] rounded-b-[1.75rem] bg-white px-7 pb-7 pt-9">
          <h3 className="clamp-2 text-safe text-2xl font-medium leading-tight text-ink transition group-hover:text-[#FD5E02]">{title}</h3>
          <p className="tour-description mt-4 flex-1 text-lg leading-8 text-muted">
            {shortDescription || 'Explore this Uganda Family Tours experience.'}
          </p>
          <div className="mt-6 flex min-w-0 items-center justify-between gap-4">
            <span className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full bg-[#263238] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white transition group-hover:bg-[#111827]">
              <span className="truncate">
              {t('tourCard.getPackage', { defaultValue: 'Get Package' })}
              </span>
              <FiArrowRight className="text-[#FD5E02] transition group-hover:translate-x-0.5" />
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
