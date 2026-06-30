import { FaTripadvisor } from 'react-icons/fa'
import { FiChevronDown } from 'react-icons/fi'
import type { TripAdvisorReview } from '../data/reviews'

type ReviewCardProps = {
  review: TripAdvisorReview
  onOpen: (review: TripAdvisorReview) => void
}

const TRIPADVISOR_GREEN = '#008f5a'

export function ReviewStars({ rating, label }: { rating: number; label?: string }) {
  return (
    <span className="flex items-center gap-1.5" aria-label={label ?? `${rating} out of 5 rating`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`h-3.5 w-3.5 rounded-full ${index < rating ? 'bg-[#008f5a]' : 'bg-[#d8e7df]'}`}
        />
      ))}
    </span>
  )
}

export function ReviewCard({ review, onOpen }: ReviewCardProps) {
  return (
    <article
      className="group flex h-full min-h-[19rem] cursor-pointer flex-col rounded-card border border-black bg-white p-5 text-left text-ink shadow-none transition duration-200 hover:-translate-y-1 hover:shadow-none"
      onClick={() => onOpen(review)}
    >
      <div className="flex items-start gap-3">
        <a
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#eef5f0] focus-visible:ring-4 focus-visible:ring-[#008f5a]/15"
          href={review.sourceUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${review.name}'s TripAdvisor review`}
          onClick={(event) => event.stopPropagation()}
        >
          <img
            className="h-full w-full object-cover"
            src={review.profileImage}
            alt={`${review.name} profile`}
            loading="lazy"
          />
          <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-[#00aa6c] text-[0.65rem] text-white">
            <FaTripadvisor aria-hidden="true" />
          </span>
        </a>
        <div className="min-w-0">
          <a
            className="text-safe block text-sm font-black leading-tight text-ink transition hover:text-[#008f5a] focus-visible:text-[#008f5a]"
            href={review.sourceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            {review.name}
          </a>
          <p className="mt-1 text-xs font-bold leading-tight text-muted">{review.date}</p>
        </div>
      </div>

      <div className="mt-4">
        <ReviewStars rating={review.rating} label={`${review.rating} out of 5 TripAdvisor stars`} />
      </div>

      <p className="clamp-5 mt-5 flex-1 text-base leading-7 text-[#1f2933]">
        {review.text}
      </p>

      <div className="mt-5 border-t border-[#ece6df] pt-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#008f5a] transition group-hover:text-[#006f47]"
          style={{ color: TRIPADVISOR_GREEN }}
          aria-label={`Read full review by ${review.name}`}
          onClick={(event) => {
            event.stopPropagation()
            onOpen(review)
          }}
        >
          Read more
          <FiChevronDown aria-hidden="true" className="text-base" />
        </button>
      </div>
    </article>
  )
}
