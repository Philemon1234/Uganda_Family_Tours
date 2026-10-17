import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaFacebookF,
  FaHome,
  FaMapMarkerAlt,
  FaTimes,
  FaUser,
  FaWhatsapp,
  FaYoutube,
} from 'react-icons/fa'
import logo from '../../assets/New logo.png'
import type { HomeCustomizationContent } from '../../types/homeCustomization'
import { isSafeHeroLink } from '../../utils/heroSlider'

type MobileSidebarDrawerProps = {
  isOpen: boolean
  onClose: () => void
  navigation: HomeCustomizationContent['nav']
}

const navigationIcons = { home: FaHome, tours: FaMapMarkerAlt, about: FaUser }
const defaultLabels: Record<string, string> = { home: 'Home', tours: 'Tours', about: 'About Us' }
const labelKeys: Record<string, string> = { home: 'navbar.home', tours: 'navbar.tours', about: 'navbar.about' }

export function MobileSidebarDrawer({ isOpen, onClose, navigation }: MobileSidebarDrawerProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const drawerItems = navigation.links.filter(item => isSafeHeroLink(item.href)).map(item => ({ ...item, icon: navigationIcons[item.id as keyof typeof navigationIcons] || FaMapMarkerAlt }))
  // Preserve the existing mobile WhatsApp shortcut alongside the managed links.
  if (!drawerItems.some(item => item.href === 'https://wa.me/256703543027')) drawerItems.push({ id: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/256703543027', icon: FaWhatsapp })

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

  const isActive = (href: string) => {
    const path = href.split(/[?#]/)[0]
    if (path === '/') return location.pathname === '/'
    return path.startsWith('/') && (location.pathname === path || location.pathname.startsWith(`${path}/`))
  }

  return (
    <div className={`fixed inset-0 z-[70] lg:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div
        aria-hidden="true"
        className={`absolute inset-0 h-screen w-screen rounded-none bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={`relative flex h-screen w-[82vw] max-w-[340px] flex-col rounded-none bg-white px-4 py-7 shadow-[20px_0_50px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <img className="h-10 w-auto object-contain" src={navigation.logo.src || logo} alt={navigation.logo.alt || t('common.logoAlt')} onError={event => { if (event.currentTarget.getAttribute('src') !== logo) event.currentTarget.src = logo }} />
          <button
            type="button"
            aria-label={t('common.close')}
            className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-lg text-primary transition hover:bg-primary hover:text-ink"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <nav className="mt-8 space-y-4" aria-label={t('mobileNav.drawerAriaLabel')}>
          {drawerItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const content = (
              <>
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full text-sm ${
                    active ? 'bg-white/25 text-white' : 'bg-primary/10 text-primary'
                  }`}
                >
                  <Icon />
                </span>
                <span>{labelKeys[item.id] && item.label === defaultLabels[item.id] ? t(labelKeys[item.id]) : item.label}</span>
              </>
            )

            const className = `flex w-full items-center gap-4 rounded-2xl px-3 py-3.5 text-base font-semibold transition ${
              active ? 'bg-primary text-white shadow-[0_14px_28px_rgba(255,164,96,0.18)]' : 'text-ink hover:bg-primary/8'
            }`

            if (/^(https?:|mailto:|tel:)/i.test(item.href)) {
              return (
                <a key={item.id} href={item.href} className={className} target="_blank" rel="noreferrer" onClick={onClose}>
                  {content}
                </a>
              )
            }

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
              aria-label={t('social.facebook')}
              target="_blank"
              rel="noreferrer"
              className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg text-ink transition hover:bg-[#263238] hover:text-white"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.youtube.com/@ugandafamilytours/shorts"
              aria-label={t('social.youtube')}
              target="_blank"
              rel="noreferrer"
              className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg text-ink transition hover:bg-[#263238] hover:text-white"
            >
              <FaYoutube />
            </a>
            <a
              href="https://wa.me/256703543027"
              aria-label={t('social.whatsapp')}
              target="_blank"
              rel="noreferrer"
              className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg text-ink transition hover:bg-[#263238] hover:text-white"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </aside>
    </div>
  )
}
