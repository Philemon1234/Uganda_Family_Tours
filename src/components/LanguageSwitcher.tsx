import { useEffect, useRef, useState } from 'react'
import { FiCheck, FiChevronDown } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { languages, useLocale, type LanguageCode } from '../context/LocaleContext'

function FlagIcon({ code }: { code: LanguageCode }) {
  return (
    <span
      className={`language-flag language-flag-${code.toLowerCase()}`}
      aria-hidden="true"
    />
  )
}

export function LanguageSwitcher() {
  const { t } = useTranslation()
  const { language, setLanguage } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const chooseLanguage = (code: LanguageCode) => {
    setLanguage(code)
    setIsOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        className="inline-flex h-10 items-center gap-2 rounded-none border-0 bg-transparent px-2 text-sm font-bold text-white shadow-none transition hover:bg-transparent"
        type="button"
        aria-label={t('navbar.language')}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        <FlagIcon code={language.code} />
        <FiChevronDown className={`text-xs text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-[80] max-h-80 w-60 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-xl border border-border bg-white py-2 text-ink shadow-[0_20px_45px_rgba(17,24,39,0.18)]">
          {languages.map((item) => (
            <button
              key={item.code}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition hover:bg-primary/5 hover:text-primary"
              type="button"
              onClick={() => chooseLanguage(item.code)}
            >
              <FlagIcon code={item.code} />
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              {item.code === language.code && <FiCheck className="text-lg text-green-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
