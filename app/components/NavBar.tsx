'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeSwitcher from './ThemeSwitcher'

export default function NavBar() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href

  return (
    <header className="theme-navbar w-full border-b border-[var(--theme-card-border)] bg-gray-50/90 backdrop-blur shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="text-xl font-extrabold tracking-tight theme-text-primary hover:opacity-80 transition-opacity">
          Thornton Events
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/"
            className={`px-4 py-2 rounded-[var(--theme-border-radius-sm)] font-medium transition-all ${
              isActive('/')
                ? 'bg-[var(--theme-btn-info)] text-white shadow'
                : 'theme-text-primary hover:bg-[color:var(--theme-card-bg-subtle)]'
            }`}
          >
            Home
          </Link>
          <Link
            href="/events"
            className={`px-4 py-2 rounded-[var(--theme-border-radius-sm)] font-medium transition-all ${
              isActive('/events')
                ? 'bg-[var(--theme-btn-info)] text-white shadow'
                : 'theme-text-primary hover:bg-[color:var(--theme-card-bg-subtle)]'
            }`}
          >
            Events
          </Link>
          <Link
            href="/contact"
            className={`px-4 py-2 rounded-[var(--theme-border-radius-sm)] font-medium transition-all ${
              isActive('/contact')
                ? 'bg-[var(--theme-btn-info)] text-white shadow'
                : 'theme-text-primary hover:bg-[color:var(--theme-card-bg-subtle)]'
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden theme-navbar border-t border-[var(--theme-card-border)] bg-gray-50/90">
        <nav className="flex items-center justify-center gap-4 px-4 py-3">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-[var(--theme-border-radius-sm)] text-sm font-medium transition-all ${
              isActive('/')
                ? 'bg-[var(--theme-btn-info)] text-white shadow'
                : 'theme-text-primary hover:bg-[color:var(--theme-card-bg-subtle)]'
            }`}
          >
            Home
          </Link>
          <Link
            href="/events"
            className={`px-3 py-1.5 rounded-[var(--theme-border-radius-sm)] text-sm font-medium transition-all ${
              isActive('/events')
                ? 'bg-[var(--theme-btn-info)] text-white shadow'
                : 'theme-text-primary hover:bg-[color:var(--theme-card-bg-subtle)]'
            }`}
          >
            Events
          </Link>
          <Link
            href="/contact"
            className={`px-3 py-1.5 rounded-[var(--theme-border-radius-sm)] text-sm font-medium transition-all ${
              isActive('/contact')
                ? 'bg-[var(--theme-btn-info)] text-white shadow'
                : 'theme-text-primary hover:bg-[color:var(--theme-card-bg-subtle)]'
            }`}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  )
}


