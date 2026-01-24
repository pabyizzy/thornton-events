'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import TodaysEvents from './components/TodaysEvents'
import { type EventRow } from './components/EventCard'
import GridEventCard from './components/GridEventCard'
import PageLayout from './components/PageLayout'

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
            {/* LOCAL FAMILY EVENTS - Priority Section */}
            <section className="bg-white rounded-lg shadow-sm overflow-hidden border-2 border-orange-200">
              <div className="bg-gradient-to-r from-orange-500 to-coral-500 px-6 py-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                  Local Family Events
                </h2>
                <p className="text-center text-orange-50 text-sm mt-1">
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
            <section className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                  Concerts, Sports & Entertainment
                </h2>
                <p className="text-center text-blue-50 text-sm mt-1">
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
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <Link
                    href="/events"
                    className="btn-secondary inline-block"
                  >
                    Browse All Events
                  </Link>
                </div>
              </div>
            </section>

            {/* Coming Soon: Articles Section */}
            <section className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-teal-400 px-6 py-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                  Latest Articles
                </h2>
              </div>
              <div className="p-8 text-center">
                <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h3>
                <p className="text-gray-600 mb-4">
                  We&apos;re working on bringing you great articles about family activities, local tips, and community news.
                </p>
                <Link href="/articles" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Learn More →
                </Link>
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Today's Events Widget */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-4 py-3">
                <h3 className="font-bold text-lg text-white text-center">
                  TODAY&apos;S EVENTS
                </h3>
              </div>
              <div className="p-4">
                <TodaysEvents />
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm p-6 border-2 border-blue-200">
              <div className="text-center mb-4">
                <svg className="w-12 h-12 mx-auto text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900">Stay Updated!</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Get weekly updates on the best events happening in Thornton
                </p>
              </div>
              <Link
                href="/subscribe"
                className="btn-primary w-full text-center block"
              >
                Subscribe to Newsletter
              </Link>
            </div>

            {/* Ad Space 1 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                <div className="h-40 w-full overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/herocollage/pexels-thelazyartist-1780357.jpg"
                    alt="Promote your business"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Promote Your Business</h3>
                <p className="text-sm text-gray-600">
                  Reach thousands of local families every week
                </p>
                <a
                  href="mailto:thorntoncoevents@gmail.com"
                  className="btn-primary w-full text-center block"
                >
                  Advertise Here
                </a>
              </div>
            </div>

            {/* Ad Space 2 */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center border-2 border-dashed border-gray-300">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">Ad Space Available</h4>
              <p className="text-xs text-gray-400">300x250</p>
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
