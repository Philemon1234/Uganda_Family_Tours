type SectionHeaderProps = {
  label?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function SectionHeader({ label, title, description, align = 'center' }: SectionHeaderProps) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-4xl text-center' : 'max-w-4xl'}>
      {label && <p className="text-sm font-bold text-primary">{label}</p>}
      <h2 className="mt-2 text-3xl font-black text-ink md:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-7 text-muted">{description}</p>}
    </div>
  )
}
