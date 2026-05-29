import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FaBars, FaXmark } from 'react-icons/fa6'
import { FiArrowRight } from 'react-icons/fi'
import { Logo } from './Logo'

type NavbarProps = {
  onInquiry: () => void
}

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Tours', href: '/tours' },
  { label: 'About Us', href: '/about' },
]

export function Navbar({ onInquiry }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/15 bg-black/30 text-white shadow-[0_12px_35px_rgb(0_0_0_/_0.16)] backdrop-blur-md">
      <nav className="container-custom flex min-h-15 items-center justify-between py-2">
        <NavLink to="/" aria-label="Uganda Family Tours home">
          <Logo />
        </NavLink>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center gap-1.5 py-4 text-[0.78rem] font-bold text-white transition hover:text-white ${
                  isActive
                    ? 'underline decoration-primary decoration-2 underline-offset-[14px]'
                    : 'text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <button className="btn-primary hidden px-5 py-3 text-[0.72rem] lg:inline-flex" type="button" onClick={onInquiry}>
          Talk to a Travel Specialist <FiArrowRight />
        </button>

        <button
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-white lg:hidden"
          type="button"
          aria-label="Open menu"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <FaXmark /> : <FaBars />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-white/10 bg-black/75 px-5 py-4 backdrop-blur-md lg:hidden">
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
            <button className="btn-primary mt-2 justify-center" type="button" onClick={() => {
              setIsOpen(false)
              onInquiry()
            }}>
              Talk to a Travel Specialist <FiArrowRight />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
