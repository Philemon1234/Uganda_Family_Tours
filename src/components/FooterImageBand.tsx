type FooterImageBandProps = {
  src: string
  alt: string
  zoom?: number
}

export function FooterImageBand({ src, alt, zoom = 1 }: FooterImageBandProps) {
  return (
    <section className="-mb-px overflow-hidden bg-dark" aria-label={alt}>
      <img
        className="block h-auto w-full"
        src={src}
        alt={alt}
        loading="lazy"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center bottom',
        }}
      />
    </section>
  )
}
