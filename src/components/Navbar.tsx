import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FaBars, FaXmark } from 'react-icons/fa6'
import { FiArrowRight } from 'react-icons/fi'
import { Logo } from './Logo'

type NavbarProps = {
  onBook: () => void
}

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Tours', href: '/tours' },
  { label: 'About Us', href: '/about' },
]

export function Navbar({ onBook }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className="absolute left-0 right-0 top-0 z-40 border-b border-white/10 bg-dark text-white">
      <nav className="container-custom flex min-h-20 items-center justify-between py-3">
        <NavLink to="/" aria-label="Uganda Family Tours home">
          <Logo />
        </NavLink>

        <div className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center gap-1.5 py-6 text-sm font-bold text-white transition hover:text-white ${
                  isActive
                    ? 'underline decoration-primary decoration-2 underline-offset-[18px]'
                    : 'text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <button className="btn-primary hidden lg:inline-flex" type="button" onClick={onBook}>
          {isHome ? 'Plan Your Trip' : 'Book This Tour'} <FiArrowRight />
        </button>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-white lg:hidden"
          type="button"
          aria-label="Open menu"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <FaXmark /> : <FaBars />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-white/10 bg-dark px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-bold text-white hover:bg-white/5"
              >
                {item.label}
              </NavLink>
            ))}
            <button className="btn-primary mt-2 justify-center" type="button" onClick={onBook}>
              {isHome ? 'Plan Your Trip' : 'Book This Tour'} <FiArrowRight />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
