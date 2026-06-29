import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from './Logo'
import { LanguageSwitcher } from './LanguageSwitcher'

type NavbarProps = {
  onInquiry: () => void
}

const navItems = [
  { labelKey: 'navbar.home', href: '/' },
  { labelKey: 'navbar.tours', href: '/tours' },
  { labelKey: 'navbar.about', href: '/about' },
]

export function Navbar({ onInquiry }: NavbarProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const [isAtFooterBottom, setIsAtFooterBottom] = useState(false)
  const [isPastHero, setIsPastHero] = useState(false)

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

  useEffect(() => {
    function updateHeaderState() {
      if (location.pathname !== '/') {
        setIsPastHero(true)
        return
      }

      const heroSection = document.querySelector('.home-hero-section')
      const heroBottom = heroSection instanceof HTMLElement ? heroSection.offsetHeight : window.innerHeight * 0.9
      setIsPastHero(window.scrollY > heroBottom - 96)
    }

    updateHeaderState()
    window.addEventListener('scroll', updateHeaderState, { passive: true })
    window.addEventListener('resize', updateHeaderState)

    return () => {
      window.removeEventListener('scroll', updateHeaderState)
      window.removeEventListener('resize', updateHeaderState)
    }
  }, [location.pathname])

  return (
    <header
      className={`site-header fixed left-0 right-0 top-0 z-40 border-b text-white shadow-[0_12px_35px_rgb(0_0_0_/_0.16)] backdrop-blur-sm transition-[background-color,border-color,box-shadow] duration-300 ${
        isPastHero
          ? 'border-white/10 bg-[#25424C]/95 shadow-[0_14px_38px_rgb(0_0_0_/_0.2)]'
          : 'border-white/15 bg-transparent'
      } ${
        isAtFooterBottom ? 'site-header-hidden-mobile' : ''
      }`}
    >
      <nav className="container-custom flex min-h-15 items-center justify-between py-2">
        <NavLink to="/" aria-label={t('navbar.homeAria')}>
          <Logo />
        </NavLink>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.labelKey}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center gap-1.5 py-4 text-[0.78rem] font-bold text-white transition hover:text-white ${
                  isActive
                    ? 'underline decoration-primary decoration-2 underline-offset-[14px]'
                    : 'text-white'
                }`
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button className="btn-primary hidden px-5 py-3 text-[0.72rem] text-white lg:inline-flex" type="button" onClick={onInquiry}>
            {t('navbar.talkToSpecialist')}
          </button>
        </div>
      </nav>
    </header>
  )
}
