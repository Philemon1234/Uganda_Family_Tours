import { Link } from 'react-router-dom'
import { FaStar } from 'react-icons/fa6'
import type { Tour } from '../data/tours'
import { MotionReveal } from './MotionReveal'

type TourCardProps = {
  tour: Tour
  revealDelay?: number
}

export function TourCard({ tour, revealDelay = 0 }: TourCardProps) {
  return (
    <MotionReveal delay={revealDelay}>
      <Link
        to={`/tours/${tour.slug}`}
        className="group relative block overflow-visible rounded-[2.25rem] bg-white pb-0 shadow-[0_18px_34px_rgba(17,24,39,0.14)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(17,24,39,0.18)]"
      >
        <div className="relative h-72 overflow-hidden rounded-t-[2.25rem]">
          <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={tour.image} alt={tour.title} />
        </div>
        <span className="absolute left-4 top-[12.85rem] z-30 rounded-xl bg-primary px-4 py-2.5 text-base font-black leading-none text-white sm:-left-6">
          {tour.price}
        </span>
        <div className="relative z-10 -mt-8 flex min-h-56 flex-col rounded-t-[2.25rem] rounded-b-[2.25rem] bg-white px-7 pb-7 pt-9">
          <h3 className="text-2xl font-medium leading-tight text-ink transition group-hover:text-primary">{tour.title}</h3>
          <p className="tour-description mt-4 flex-1 text-lg leading-8 text-muted">{tour.shortDescription}</p>
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-xl text-primary">
              <span className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => <FaStar key={index} />)}
              </span>
            </div>
            <span className="text-xl font-medium text-primary">
              {tour.duration}
            </span>
          </div>
        </div>
      </Link>
    </MotionReveal>
  )
}
