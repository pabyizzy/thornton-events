'use client'

import Link from 'next/link'
import NavBar from './NavBar'
import { GoogleAdBanner } from './GoogleAd'

interface PageLayoutProps {
  children: React.ReactNode
  showBanner?: boolean
}

export default function PageLayout({ children, showBanner = false }: PageLayoutProps) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Banner Ad Space */}
      {showBanner && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
            <GoogleAdBanner slot="top-banner" className="mx-auto" />
          </div>
        </div>
      )}

      {/* Logo */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/MainLogo.png"
            alt="Thornton Events"
            className="h-24 md:h-32 mx-auto object-contain"
          />
        </div>
      </div>

      {/* Navigation Bar */}
      <NavBar />

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div className="md:col-span-2">
              <h3 className="text-white font-bold text-lg mb-4">Thornton Events</h3>
              <p className="text-sm text-gray-400 mb-4">
                Your go-to source for family-friendly events, local deals, and community happenings
                in Thornton, Colorado and the surrounding area.
              </p>
              <a
                href="mailto:thorntoncoevents@gmail.com"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                thorntoncoevents@gmail.com
              </a>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/events" className="hover:text-white transition-colors">All Events</Link></li>
                <li><Link href="/deals" className="hover:text-white transition-colors">Local Deals</Link></li>
                <li><Link href="/articles" className="hover:text-white transition-colors">Articles</Link></li>
                <li><Link href="/subscribe" className="hover:text-white transition-colors">Newsletter</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
              <h4 className="text-white font-semibold mt-6 mb-4">For Businesses</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/deals/submit" className="hover:text-white transition-colors">Submit a Deal</Link></li>
                <li><a href="mailto:thorntoncoevents@gmail.com" className="hover:text-white transition-colors">Advertise With Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {currentYear} Thornton Events. All rights reserved.</p>
            <p className="mt-1">Made with love for the Thornton community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
