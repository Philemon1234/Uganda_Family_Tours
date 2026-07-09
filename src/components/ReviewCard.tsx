import { FaTripadvisor } from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'
import type { TripAdvisorReview } from '../data/reviews'

type ReviewCardProps = {
  review: TripAdvisorReview
  onOpen: (review: TripAdvisorReview) => void
}

export function ReviewStars({ rating, label }: { rating: number; label?: string }) {
  return (
    <span className="flex items-center justify-center gap-1" aria-label={label ?? `${rating} out of 5 rating`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`grid h-[1.05rem] w-[1.05rem] place-items-center rounded-full border-[0.16rem] ${
            index < rating ? 'border-[#00b98b]' : 'border-[#b9e2d7]'
          }`}
        >
          <span
            className={`h-[0.48rem] w-[0.48rem] rounded-full ${
              index < rating ? 'bg-[#00b98b]' : 'bg-transparent'
            }`}
          />
        </span>
      ))}
    </span>
  )
}

function relativeReviewDate(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  const now = new Date()
  const months =
    (now.getFullYear() - parsedDate.getFullYear()) * 12 +
    now.getMonth() -
    parsedDate.getMonth() -
    (now.getDate() < parsedDate.getDate() ? 1 : 0)

  if (months >= 1) {
    return `${months} month${months === 1 ? '' : 's'} ago`
  }

  const days = Math.max(1, Math.floor((now.getTime() - parsedDate.getTime()) / 86_400_000))

  return `${days} day${days === 1 ? '' : 's'} ago`
}

function ReviewExcerpt({ review }: { review: TripAdvisorReview }) {
  return (
    <p className="clamp-4 mt-3 text-center text-[1.02rem] font-medium leading-[1.45] text-[#07152a]">
      <span className="font-bold">{review.title}</span>
      <br />
      <span>{review.text}</span>
    </p>
  )
}

export function ReviewCard({ review, onOpen }: ReviewCardProps) {
  return (
    <article
      className="group relative z-0 flex h-full min-h-[17.4rem] cursor-pointer flex-col items-center rounded-[0.55rem] bg-[#f4f4f4] px-6 pb-6 pt-[3.65rem] text-center text-[#07152a] transition duration-200 hover:-translate-y-1 md:min-h-[17.8rem] md:px-7"
      onClick={() => onOpen(review)}
    >
      <a
        className="absolute left-1/2 top-0 z-20 h-[4.45rem] w-[4.45rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#eef5f0] focus-visible:ring-4 focus-visible:ring-[#008f5a]/15"
        href={review.sourceUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${review.name}'s TripAdvisor review`}
        onClick={(event) => event.stopPropagation()}
      >
        <img
          className="h-full w-full rounded-full object-cover"
          src={review.profileImage}
          alt={`${review.name} profile`}
          loading="lazy"
        />
        <span className="absolute bottom-0 right-0 grid h-[1.35rem] w-[1.35rem] place-items-center rounded-full border-2 border-white bg-[#00b98b] text-[0.72rem] text-white shadow-[0_2px_5px_rgb(0_0_0/0.12)]">
          <FaTripadvisor aria-hidden="true" />
        </span>
      </a>

      <a
        className="text-safe block max-w-full text-[0.98rem] font-bold leading-tight text-[#07152a] transition hover:text-[#008f5a] focus-visible:text-[#008f5a]"
        href={review.sourceUrl}
        target="_blank"
        rel="noreferrer"
        onClick={(event) => event.stopPropagation()}
      >
        {review.name}
      </a>
      <p className="mt-1 text-[0.92rem] font-medium leading-tight text-[#7f8790]">{relativeReviewDate(review.date)}</p>

      <div className="mt-3 flex items-center justify-center gap-2">
        <ReviewStars rating={review.rating} label={`${review.rating} out of 5 TripAdvisor stars`} />
        <MdVerified aria-label="Verified review" className="text-[1.05rem] text-[#3b82f6]" />
      </div>

      <ReviewExcerpt review={review} />

      <button
        type="button"
        className="mt-auto pt-3 text-[0.95rem] font-bold text-[#969696] transition group-hover:text-[#6f6f6f]"
        aria-label={`Read full review by ${review.name}`}
        onClick={(event) => {
          event.stopPropagation()
          onOpen(review)
        }}
      >
        Read more
      </button>
    </article>
  )
}
