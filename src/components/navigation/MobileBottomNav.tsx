import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  PiArrowUpLight,
  PiCompassLight,
  PiHouseLineLight,
  PiListLight,
  PiUserLight,
  PiWhatsappLogoLight,
} from 'react-icons/pi'
import type { IconType } from 'react-icons'
import { MobileSidebarDrawer } from './MobileSidebarDrawer'

type NavItem = {
  id: string
  href: string | null
  icon: IconType
}

const navItems: NavItem[] = [
  { id: 'menu', href: null, icon: PiListLight },
  { id: 'about', href: '/about', icon: PiUserLight },
  { id: 'home', href: '/', icon: PiHouseLineLight },
  { id: 'services', href: '/tours', icon: PiCompassLight },
  { id: 'whatsapp', href: 'https://wa.me/256703543027', icon: PiWhatsappLogoLight },
]

export function MobileBottomNav() {
  const { t } = useTranslation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [isAtFooterBottom, setIsAtFooterBottom] = useState(false)
  const location = useLocation()

  const routeActiveItem = useMemo(() => {
    if (location.pathname === '/') return 'home'
    if (location.pathname.startsWith('/about')) return 'about'
    if (location.pathname === '/tours') return 'services'
    return 'home'
  }, [location.pathname])

  useEffect(() => {
    setSelectedItem(null)
  }, [location.hash, location.pathname])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const sentinel = document.getElementById('footer-bottom-sentinel')

    if (!sentinel || !mediaQuery.matches) {
      setIsAtFooterBottom(false)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsAtFooterBottom(entry.isIntersecting),
      {
        root: null,
        threshold: 1,
      },
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [location.pathname])

  const activeItem = selectedItem ?? routeActiveItem
  const activeIndex = Math.max(navItems.findIndex((item) => item.id === activeItem), 0)
  const activeNavItem = useMemo(() => navItems[activeIndex] ?? navItems[2], [activeIndex])
  const ActiveIcon = activeNavItem.icon
  const labelFor = (item: NavItem) => {
    if (item.id === 'menu') return t('common.menu')
    if (item.id === 'about') return t('navbar.about')
    if (item.id === 'home') return t('navbar.home')
    if (item.id === 'services') return t('navbar.tours')
    if (item.id === 'whatsapp') return 'WhatsApp'
    return t('common.menu')
  }

  const handleMenuClick = () => {
    if (isSidebarOpen) {
      closeSidebar()
      return
    }

    setSelectedItem('menu')
    setIsSidebarOpen(true)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
    setSelectedItem(null)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  const handleNavItemClick = (itemId: string, href?: string | null) => {
    setSelectedItem(itemId)
    setIsSidebarOpen(false)

    if (href && !href.startsWith('http') && location.pathname === href) {
      scrollToTop()
    }
  }

  const handleBackToTopClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <MobileSidebarDrawer isOpen={isSidebarOpen} onClose={closeSidebar} />
      <button
        type="button"
        className={`fixed bottom-[7.25rem] right-5 z-[95] grid h-12 w-12 place-items-center rounded-full bg-primary text-xl text-white shadow-[0_14px_34px_rgba(0,0,0,0.22)] transition duration-300 ease-out lg:hidden ${
          isAtFooterBottom ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
        aria-label={t('common.backToTop', { defaultValue: 'Back to top' })}
        onClick={handleBackToTopClick}
      >
        <PiArrowUpLight />
      </button>
      <div className="mobile-bottom-nav lg:hidden">
        <nav
          className="relative h-[calc(88px+env(safe-area-inset-bottom))] rounded-t-[24px] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(0,0,0,0.10)]"
          aria-label={t('mobileNav.ariaLabel')}
        >
          <div
            className="absolute -top-[2.15rem] left-[calc(10%_-_37px)] z-0 h-[74px] w-[74px] rounded-full bg-white transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `translate3d(${activeIndex * 20}vw, 0, 0)`,
              boxShadow: '0 -8px 22px rgba(0,0,0,0.08)',
            }}
          />
          <div
            className="absolute -top-[1.55rem] left-[calc(10%_-_28px)] z-10 grid h-[56px] w-[56px] place-items-center rounded-full bg-primary text-[1.55rem] text-white transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `translate3d(${activeIndex * 20}vw, 0, 0)`,
            }}
          >
            <ActiveIcon />
          </div>

          <div className="grid h-full grid-cols-5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.id === activeItem
              const buttonClass = `relative z-20 flex h-full flex-col items-center justify-end gap-2 pb-4 text-[0.9rem] font-medium transition hover:text-primary ${
                isActive ? 'text-primary' : 'text-ink'
              }`

              if (item.id === 'menu') {
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={t('mobileNav.openMenu')}
                    className={buttonClass}
                    onClick={handleMenuClick}
                  >
                    <Icon className={`text-[1.35rem] transition ${isActive ? 'opacity-0' : 'opacity-100'}`} />
                    <span>{labelFor(item)}</span>
                  </button>
                )
              }

              const content = (
                <>
                  <Icon className={`text-[1.35rem] transition ${isActive ? 'opacity-0' : 'opacity-100'}`} />
                  <span>{labelFor(item)}</span>
                </>
              )

              if (item.href?.startsWith('http')) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonClass}
                    onClick={() => handleNavItemClick(item.id, item.href)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {content}
                  </a>
                )
              }

              return (
                <Link
                  key={item.id}
                  to={item.href ?? '/'}
                  className={buttonClass}
                  onClick={() => handleNavItemClick(item.id, item.href)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {content}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </>
  )
}
