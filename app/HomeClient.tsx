'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import TodaysEvents from './components/TodaysEvents'
import { type EventRow } from './components/EventCard'
import GridEventCard from './components/GridEventCard'
import PageLayout from './components/PageLayout'
import FeaturedDealsCarousel from './components/FeaturedDealsCarousel'

type HomeEvent = EventRow

export default function HomeClient() {
  const [localEvents, setLocalEvents] = useState<HomeEvent[]>([])
  const [regionalEvents, setRegionalEvents] = useState<HomeEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const now = new Date()

      // Calculate 3 months from now for local events filter
      const threeMonthsFromNow = new Date()
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

      // Fetch local family-friendly events (City of Thornton, Adams County, Anythink Libraries) - next 3 months only
      const { data: localData, error: localError } = await supabase
        .from('events')
        .select('id,title,city,state,start_time,end_time,venue,url,image_url,price_text,category,source_name')
        .in('source', ['city-thornton', 'adams-county', 'anythink'])
        .gte('start_time', now.toISOString())
        .lte('start_time', threeMonthsFromNow.toISOString())
        .order('start_time', { ascending: true })
        .limit(6)

      // Fetch Ticketmaster events (regional concerts, sports, etc.)
      const { data: regionalData, error: regionalError } = await supabase
        .from('events')
        .select('id,title,city,state,start_time,end_time,venue,url,image_url,price_text,category,source_name')
        .eq('source_name', 'ticketmaster')
        .gte('start_time', now.toISOString())
        .order('start_time', { ascending: true })
        .limit(8)

      if (localError || regionalError) {
        setError(localError?.message || regionalError?.message || 'Failed to load events')
      } else {
        setLocalEvents((localData ?? []) as HomeEvent[])
        setRegionalEvents((regionalData ?? []) as HomeEvent[])
      }
    } catch {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thornton Events</h1>
          <p className="text-lg text-gray-600">Loading events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md">
          <div className="text-6xl mb-4">😅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-lg text-red-600 mb-4">Error loading events: {error}</p>
          <button
            onClick={fetchEvents}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <PageLayout showBanner={true}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* FEATURED DEALS CAROUSEL - Hero Section */}
            <section>
              <FeaturedDealsCarousel />
            </section>

            {/* LOCAL FAMILY EVENTS - Priority Section */}
            <section className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-orange-100">
              <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 px-6 py-5">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-sm">
                  Local Family Events
                </h2>
                <p className="text-center text-white/90 text-sm mt-1">
                  Free community & library events in Thornton & Adams County
                </p>
              </div>
              <div className="p-6">
                {!localEvents || localEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600">No local events scheduled at the moment.</p>
                    <p className="text-sm text-gray-500 mt-1">Check back soon for Thornton&apos;s amazing community events!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {localEvents.map((e) => (
                      <GridEventCard key={e.id} e={e} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* REGIONAL EVENTS - Ticketmaster */}
            <section className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-blue-100">
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-6 py-5">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-sm">
                  Concerts, Sports & Entertainment
                </h2>
                <p className="text-center text-white/90 text-sm mt-1">
                  Happening near Thornton
                </p>
              </div>
              <div className="p-6">
                {!regionalEvents || regionalEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-gray-600">No events found at the moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {regionalEvents.map((e) => (
                      <GridEventCard key={e.id} e={e} />
                    ))}
                  </div>
                )}

                {/* Browse All Events Button */}
                <div className="text-center mt-8 pt-6 border-t border-gray-100">
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    Browse All Events
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </section>

            {/* Coming Soon: Articles Section */}
            <section className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-teal-100">
              <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400 px-6 py-5">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-sm">
                  Latest Articles
                </h2>
              </div>
              <div className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h3>
                <p className="text-gray-600 mb-4">
                  We&apos;re working on bringing you great articles about family activities, local tips, and community news.
                </p>
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 font-semibold group"
                >
                  Learn More
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Today's Events Widget */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 px-4 py-4">
                <h3 className="font-bold text-lg text-white text-center drop-shadow-sm">
                  TODAY&apos;S EVENTS
                </h3>
              </div>
              <div className="p-4">
                <TodaysEvents />
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 overflow-hidden group">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative text-center mb-4">
                <div className="w-14 h-14 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white drop-shadow-sm">Stay Updated!</h3>
                <p className="text-sm text-white/90 mt-1">
                  Get weekly updates on the best events happening in Thornton
                </p>
              </div>
              <Link
                href="/subscribe"
                className="relative block w-full px-4 py-3 bg-white text-indigo-600 font-bold text-center rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                Subscribe to Newsletter
              </Link>
            </div>

            {/* Ad Space 1 */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="h-40 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/herocollage/pexels-thelazyartist-1780357.jpg"
                  alt="Promote your business"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Promote Your Business</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Reach thousands of local families every week
                </p>
                <a
                  href="mailto:thorntoncoevents@gmail.com"
                  className="block w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold text-center rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Advertise Here
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/deals" className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors group">
                  <span className="text-2xl">🏷️</span>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Local Deals</p>
                    <p className="text-xs text-gray-500">Save money at local businesses</p>
                  </div>
                </Link>
                <Link href="/events" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">All Events</p>
                    <p className="text-xs text-gray-500">Browse the full calendar</p>
                  </div>
                </Link>
                <Link href="/deals/submit" className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group">
                  <span className="text-2xl">🏪</span>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Submit a Deal</p>
                    <p className="text-xs text-gray-500">Business owners welcome!</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
