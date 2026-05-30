import { MotionReveal } from './MotionReveal'

type SectionHeaderProps = {
  label?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function SectionHeader({ label, title, description, align = 'center' }: SectionHeaderProps) {
  return (
    <MotionReveal>
      <div className={align === 'center' ? 'mx-auto max-w-4xl text-center' : 'max-w-4xl'}>
        {label && <p className="mx-auto inline-flex rounded-full bg-[#fff3ea] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#FD5E02]">{label}</p>}
        <h2 className="mt-2 text-3xl font-black text-ink md:text-4xl">{title}</h2>
        {description && <p className="mt-4 text-base leading-7 text-muted">{description}</p>}
      </div>
    </MotionReveal>
  )
}
