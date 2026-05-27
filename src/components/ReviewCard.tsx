import { FaStar } from 'react-icons/fa6'

type ReviewCardProps = {
  name: string
  country: string
  text: string
}

export function ReviewCard({ name, country, text }: ReviewCardProps) {
  return (
    <article className="flex min-h-[260px] flex-col rounded-[1.25rem] border border-border bg-white p-7">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-black text-[#4285f4]">G</span>
        <div>
          <h3 className="font-black text-ink">{name}</h3>
          <p className="text-xs text-muted">{country}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-1 text-primary">
        {Array.from({ length: 5 }).map((_, index) => <FaStar key={index} />)}
      </div>
      <p className="mt-5 text-base leading-7 text-muted">{text}</p>
    </article>
  )
}
