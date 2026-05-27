import type { IconType } from 'react-icons'

type WhyTravelCardProps = {
  icon: IconType
  title: string
  text: string
  variant?: 'light' | 'dark'
}

export function WhyTravelCard({ icon: Icon, title, text, variant = 'light' }: WhyTravelCardProps) {
  const isDark = variant === 'dark'

  return (
    <div className={isDark ? 'rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-8 text-center' : 'text-center'}>
      <div className={isDark ? 'mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-2xl text-white' : 'mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-2xl text-white shadow-orange'}>
        <Icon />
      </div>
      <h3 className={isDark ? 'mt-5 text-lg font-black text-white' : 'mt-5 text-base font-black text-ink'}>{title}</h3>
      <p className={isDark ? 'mx-auto mt-3 max-w-60 text-base leading-7 text-white/72' : 'mx-auto mt-2 max-w-52 text-sm leading-6 text-muted'}>{text}</p>
    </div>
  )
}
