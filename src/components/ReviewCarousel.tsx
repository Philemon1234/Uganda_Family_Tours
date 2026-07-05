import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionHeader } from './SectionHeader'

const TRUSTINDEX_WIDGET_URL = 'https://cdn.trustindex.io/loader.js?70ff06375367488ffc66451adf8'

export function ReviewCarousel({ title, description }: { title?: string; description?: string } = {}) {
  const { t } = useTranslation()
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const widgetRoot = widgetRef.current
    if (!widgetRoot) return

    widgetRoot.innerHTML = ''

    const script = document.createElement('script')
    script.src = TRUSTINDEX_WIDGET_URL
    script.defer = true
    script.async = true

    widgetRoot.appendChild(script)

    return () => {
      widgetRoot.innerHTML = ''
    }
  }, [])

  return (
    <section className="trustindex-reviews-section bg-white py-12 md:py-16" aria-label="TripAdvisor reviews">
      <div className="container-custom">
        <SectionHeader
          title={title || t('home.reviewsTitle')}
          description={description || t('home.reviewsDescription')}
        />
        <div ref={widgetRef} className="trustindex-reviews-embed mt-9 min-h-[22rem] bg-white" />
      </div>
    </section>
  )
}
