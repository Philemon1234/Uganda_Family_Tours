import type { IconType } from 'react-icons'
import { MotionReveal } from './MotionReveal'

type WhyTravelCardProps = {
  icon: IconType
  title: string
  text: string
  variant?: 'light' | 'dark'
  revealDelay?: number
}

export function WhyTravelCard({ icon: Icon, title, text, variant = 'light', revealDelay = 0 }: WhyTravelCardProps) {
  const isDark = variant === 'dark'

  return (
    <MotionReveal delay={revealDelay}>
      <div className={isDark ? 'rounded-3xl border border-white/10 bg-white/[0.04] px-3 py-6 text-center sm:px-6 sm:py-8' : 'text-center'}>
        <div className={isDark ? 'mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-xl text-white sm:h-16 sm:w-16 sm:text-2xl' : 'mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-2xl text-white shadow-orange'}>
          <Icon />
        </div>
        <h3 className={isDark ? 'mt-5 text-sm font-black text-white sm:text-lg' : 'mt-5 text-base font-black text-ink'}>{title}</h3>
        <p className={isDark ? 'mx-auto mt-3 max-w-60 text-sm leading-6 text-white/72 sm:text-base sm:leading-7' : 'mx-auto mt-2 max-w-52 text-sm leading-6 text-muted'}>{text}</p>
      </div>
    </MotionReveal>
  )
}
