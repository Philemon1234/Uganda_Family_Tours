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
        {label && <p className="luxury-script text-2xl leading-none text-ink md:text-3xl">{label}</p>}
        <h2 className={label ? 'mt-2 text-2xl font-black leading-tight text-ink md:text-3xl' : 'text-2xl font-black leading-tight text-ink md:text-3xl'}>{title}</h2>
        {description && <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted">{description}</p>}
      </div>
    </MotionReveal>
  )
}
