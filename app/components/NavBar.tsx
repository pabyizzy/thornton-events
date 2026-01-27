'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthButton from './AuthButton'

export default function NavBar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' && !pathname.includes('/auth') && !pathname.includes('/account') && !pathname.includes('/admin')
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  const openMobileMenu = () => {
    setMobileMenuOpen(true)
    setTimeout(() => setIsAnimating(true), 10)
  }

  const closeMobileMenu = () => {
    setIsAnimating(false)
    setTimeout(() => setMobileMenuOpen(false), 300)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main navbar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-gray-900">
              Thornton Events
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              HOME
            </Link>
            <Link
              href="/articles"
              className={`text-sm font-medium transition-colors ${
                isActive('/articles') || isActive('/guides')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              ARTICLES
            </Link>
            <Link
              href="/events"
              className={`text-sm font-medium transition-colors ${
                isActive('/events') || isActive('/event-detail')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              EVENTS
            </Link>
            <Link
              href="/deals"
              className={`text-sm font-medium transition-colors ${
                isActive('/deals')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              DEALS
            </Link>
            <Link
              href="/subscribe"
              className={`text-sm font-medium transition-colors ${
                isActive('/subscribe')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              SUBSCRIBE
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors ${
                isActive('/contact')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              CONTACT
            </Link>
          </nav>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center">
            <AuthButton />
          </div>

          {/* Hamburger Menu Button - Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => mobileMenuOpen ? closeMobileMenu() : openMobileMenu()}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                // X icon when menu is open
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon when menu is closed
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className={`fixed inset-0 bg-black z-40 md:hidden transition-opacity duration-300 ${
              isAnimating ? 'opacity-50' : 'opacity-0'
            }`}
            onClick={closeMobileMenu}
          />

          {/* Drawer */}
          <div className={`fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
            isAnimating ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">Menu</span>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto py-4">
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 text-base font-medium transition-colors ${
                    isActive('/')
                      ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/articles"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 text-base font-medium transition-colors ${
                    isActive('/articles') || isActive('/guides')
                      ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  Articles
                </Link>
                <Link
                  href="/events"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 text-base font-medium transition-colors ${
                    isActive('/events') || isActive('/event-detail')
                      ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  Events
                </Link>
                <Link
                  href="/deals"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 text-base font-medium transition-colors ${
                    isActive('/deals')
                      ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  Deals
                </Link>
                <Link
                  href="/subscribe"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 text-base font-medium transition-colors ${
                    isActive('/subscribe')
                      ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  Subscribe
                </Link>
                <Link
                  href="/contact"
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 text-base font-medium transition-colors ${
                    isActive('/contact')
                      ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  Contact
                </Link>
              </nav>

              {/* Auth Button in Drawer */}
              <div className="p-4 border-t border-gray-200">
                <AuthButton />
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}


