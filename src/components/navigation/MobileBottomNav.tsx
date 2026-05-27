import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiMenu, FiMessageSquare, FiUser } from 'react-icons/fi'
import { LuHand } from 'react-icons/lu'
import type { IconType } from 'react-icons'
import { MobileSidebarDrawer } from './MobileSidebarDrawer'

type NavItem = {
  id: string
  label: string
  href: string | null
  icon: IconType
}

const navItems: NavItem[] = [
  { id: 'menu', label: 'Menu', href: null, icon: FiMenu },
  { id: 'about', label: 'About', href: '/about', icon: FiUser },
  { id: 'home', label: 'Home', href: '/', icon: FiHome },
  { id: 'services', label: 'Services', href: '/tours', icon: LuHand },
  { id: 'contact', label: 'Contact', href: '#contact', icon: FiMessageSquare },
]

export function MobileBottomNav() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const location = useLocation()

  const routeActiveItem = useMemo(() => {
    if (location.pathname === '/') return 'home'
    if (location.pathname.startsWith('/about')) return 'about'
    if (location.pathname.startsWith('/tours')) return 'services'
    return 'home'
  }, [location.pathname])

  const activeItem = hoveredItem ?? selectedItem ?? routeActiveItem
  const activeIndex = Math.max(navItems.findIndex((item) => item.id === activeItem), 0)
  const activeNavItem = useMemo(() => navItems[activeIndex] ?? navItems[2], [activeIndex])
  const ActiveIcon = activeNavItem.icon

  const handleMenuClick = () => {
    setSelectedItem('menu')
    setIsSidebarOpen(true)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
    setSelectedItem(null)
  }

  return (
    <>
      <MobileSidebarDrawer isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="fixed inset-x-0 bottom-0 z-[60] translate-y-0 lg:hidden">
        <nav
          className="relative h-[calc(88px+env(safe-area-inset-bottom))] rounded-t-[24px] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(0,0,0,0.10)]"
          aria-label="Mobile bottom navigation"
          onPointerLeave={() => setHoveredItem(null)}
        >
          <div
            className="absolute -top-[2.15rem] z-0 h-[74px] w-[74px] rounded-full bg-white transition-[left] duration-300 ease-out"
            style={{
              left: `calc(${activeIndex * 20 + 10}% - 37px)`,
              boxShadow: '0 -8px 22px rgba(0,0,0,0.08)',
            }}
          />
          <div
            className="absolute -top-[1.55rem] z-10 grid h-[56px] w-[56px] place-items-center rounded-full bg-primary text-[1.55rem] text-white transition-[left] duration-300 ease-out"
            style={{
              left: `calc(${activeIndex * 20 + 10}% - 28px)`,
            }}
          >
            <ActiveIcon strokeWidth={2} />
          </div>

          <div className="grid h-full grid-cols-5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.id === activeItem
              const buttonClass = `relative z-20 flex h-full flex-col items-center justify-end gap-2 pb-4 text-[0.9rem] font-semibold transition ${
                isActive ? 'text-primary' : 'text-ink'
              }`

              if (item.id === 'menu') {
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label="Open menu"
                    className={buttonClass}
                    onClick={handleMenuClick}
                    onPointerEnter={() => setHoveredItem(item.id)}
                    onFocus={() => setHoveredItem(item.id)}
                    onBlur={() => setHoveredItem(null)}
                  >
                    <Icon className={`text-[1.35rem] transition ${isActive ? 'opacity-0' : 'opacity-100'}`} strokeWidth={2} />
                    <span>{item.label}</span>
                  </button>
                )
              }

              const content = (
                <>
                  <Icon className={`text-[1.35rem] transition ${isActive ? 'opacity-0' : 'opacity-100'}`} strokeWidth={2} />
                  <span>{item.label}</span>
                </>
              )

              if (item.href?.startsWith('#')) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={buttonClass}
                    onClick={() => setSelectedItem(item.id)}
                    onPointerEnter={() => setHoveredItem(item.id)}
                    onFocus={() => setHoveredItem(item.id)}
                    onBlur={() => setHoveredItem(null)}
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
                  onClick={() => setSelectedItem(item.id)}
                  onPointerEnter={() => setHoveredItem(item.id)}
                  onFocus={() => setHoveredItem(item.id)}
                  onBlur={() => setHoveredItem(null)}
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
