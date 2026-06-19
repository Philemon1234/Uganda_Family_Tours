type FooterImageBandProps = {
  src: string
  alt: string
}

export function FooterImageBand({ src, alt }: FooterImageBandProps) {
  return (
    <section className="-mb-px bg-dark" aria-label={alt}>
      <img
        className="block h-auto w-full"
        src={src}
        alt={alt}
        loading="lazy"
      />
    </section>
  )
}
