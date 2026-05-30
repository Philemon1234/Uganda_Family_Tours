import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaBoxOpen,
  FaEnvelope,
  FaFacebookF,
  FaHome,
  FaMapMarkerAlt,
  FaTimes,
  FaUser,
  FaWhatsapp,
  FaYoutube,
} from 'react-icons/fa'
import logo from '../../assets/UFT-Logo-PNG.png'

type MobileSidebarDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

const drawerItems = [
  { id: 'home', labelKey: 'navbar.home', href: '/', icon: FaHome },
  { id: 'tours', labelKey: 'navbar.tours', href: '/tours', icon: FaMapMarkerAlt },
  { id: 'packages', labelKey: 'navbar.tours', href: '/tours', icon: FaBoxOpen },
  { id: 'about', labelKey: 'navbar.about', href: '/about', icon: FaUser },
  { id: 'contact', labelKey: 'footer.contact', href: '#contact', icon: FaEnvelope },
]

export function MobileSidebarDrawer({ isOpen, onClose }: MobileSidebarDrawerProps) {
  const { t } = useTranslation()
  const location = useLocation()

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  const isActive = (id: string) => {
    if (id === 'home') return location.pathname === '/'
    if (id === 'tours') return location.pathname.startsWith('/tours')
    if (id === 'packages') return location.pathname.startsWith('/packages')
    if (id === 'about') return location.pathname.startsWith('/about')
    return false
  }

  return (
    <div className={`fixed inset-0 z-[70] lg:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <button
        type="button"
        aria-label={t('common.close')}
        className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={`relative flex h-screen w-[82vw] max-w-[340px] flex-col rounded-r-[28px] bg-white px-4 py-7 shadow-[20px_0_50px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <img className="h-10 w-auto object-contain" src={logo} alt="Uganda Family Tours" />
          <button
            type="button"
            aria-label={t('common.close')}
            className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-lg text-primary transition hover:bg-primary hover:text-white"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <nav className="mt-8 space-y-4" aria-label={t('navbar.language')}>
          {drawerItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.id)
            const content = (
              <>
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full text-sm ${
                    active ? 'bg-white/25 text-white' : 'bg-primary/10 text-primary'
                  }`}
                >
                  <Icon />
                </span>
                <span>{t(item.labelKey)}</span>
              </>
            )

            const className = `flex w-full items-center gap-4 rounded-2xl px-3 py-3.5 text-base font-bold transition ${
              active ? 'bg-primary text-white shadow-[0_14px_28px_rgba(253,94,2,0.18)]' : 'text-ink hover:bg-primary/8'
            }`

            if (item.href.startsWith('#')) {
              return (
                <a key={item.id} href={item.href} className={className} onClick={onClose}>
                  {content}
                </a>
              )
            }

            return (
              <Link key={item.id} to={item.href} className={className} onClick={onClose}>
                {content}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-border pt-6">
          <p className="text-sm font-bold text-muted">{t('footer.social')}</p>
          <div className="mt-4 flex gap-4">
            <a
              href="https://www.facebook.com/ugandafamilytours"
              aria-label="Facebook"
              target="_blank"
              rel="noreferrer"
              className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg text-white transition hover:bg-[#263238]"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.youtube.com/@ugandafamilytours/shorts"
              aria-label="YouTube"
              target="_blank"
              rel="noreferrer"
              className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg text-white transition hover:bg-[#263238]"
            >
              <FaYoutube />
            </a>
            <a
              href="https://wa.me/256703543027"
              aria-label="WhatsApp"
              target="_blank"
              rel="noreferrer"
              className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg text-white transition hover:bg-[#263238]"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </aside>
    </div>
  )
}
