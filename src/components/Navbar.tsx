import { NavLink } from 'react-router-dom'
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

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/15 bg-black/30 text-white shadow-[0_12px_35px_rgb(0_0_0_/_0.16)] backdrop-blur-md">
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
          <button className="btn-primary hidden px-5 py-3 text-[0.72rem] lg:inline-flex" type="button" onClick={onInquiry}>
            {t('navbar.talkToSpecialist')}
          </button>
        </div>
      </nav>
    </header>
  )
}
