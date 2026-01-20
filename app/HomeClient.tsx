'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import TodaysEvents from './components/TodaysEvents'
import CustomIcon from './components/CustomIcon'
import { type EventRow } from './components/EventCard'
import GridEventCard from './components/GridEventCard'

type HomeEvent = EventRow

export default function HomeClient() {
  const [events, setEvents] = useState<HomeEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const now = new Date()
      const { data, error } = await supabase
        .from('events')
        .select('id,title,city,state,start_time,end_time,venue,url,image_url,price_text,category')
        .gte('start_time', now.toISOString())
        .order('start_time', { ascending: true })
        .limit(10)

      if (error) {
        setError(error.message)
      } else {
        setEvents((data ?? []) as HomeEvent[])
      }
    } catch {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center theme-card p-8">
          <CustomIcon name="party" className="w-16 h-16 mx-auto mb-4 animate-bounce" />
          <h1 className="text-4xl font-bold theme-text-primary mb-2">Thornton CO Events</h1>
          <p className="text-xl theme-text-secondary">Loading amazing events for you...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center theme-card p-8">
          <div className="text-6xl mb-4">😅</div>
          <h1 className="text-4xl font-bold theme-text-primary mb-2">Oops!</h1>
          <p className="text-xl text-red-600">Error loading events: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen theme-bg">

      <main className="max-w-7xl mx-auto p-6 pt-0">

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2">
            {/* Events Section */}
            <div id="upcoming-events" className="theme-content-area overflow-hidden">
              <div className="theme-section-header p-4">
                <h2 className="text-2xl md:text-3xl font-extrabold text-center">Upcoming Events</h2>
              </div>
              <div className="p-8">
              {!events || events.length === 0 ? (
                <div className="text-center py-12">
                  <CustomIcon name="search" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-2xl theme-text-secondary">No events found at the moment.</p>
                  <p className="text-lg theme-text-muted mt-2">Check back soon for exciting events!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((e) => (
                    <GridEventCard key={e.id} e={e} />
                  ))}
                </div>
              )}

              {/* Browse All Events Button */}
              <div className="text-center mt-8 pt-6 border-top">
                <Link 
                  href="/events" 
                  className="theme-btn-secondary px-8 py-4 text-lg font-bold"
                >
                  Browse All Events
                </Link>
              </div>
            </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1">
            {/* Today's Events Widget */}
            <div className="theme-content-area mb-6 overflow-hidden">
              <div className="theme-section-header p-4 font-bold text-lg text-center">
                TODAY&apos;S EVENTS
              </div>
              <div className="p-4">
                <TodaysEvents />
              </div>
            </div>

            {/* Ad Space 1 */}
            <div className="theme-content-area mb-6 p-6">
              <div className="space-y-4 text-left">
                <div className="h-40 w-full overflow-hidden rounded-lg shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/herocollage/pexels-thelazyartist-1780357.jpg"
                    alt="Promote your business to Thornton locals"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold theme-text-primary">Promote Your Business Here</h3>
                <p className="text-sm theme-text-secondary">
                  Spotlight your brand to thousands of event seekers in Thornton every week with this premium placement.
                </p>
                <a href="mailto:thorntoncoevents@gmail.com" className="theme-btn-primary w-full text-center">
                  Reserve This Ad Spot
                </a>
              </div>
            </div>

            {/* Ad Space 2 */}
            <div className="theme-content-area mb-6 p-6 text-center">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-lg border-2 border-dashed border-gray-300">
                <h3 className="text-lg font-bold text-gray-600 mb-2">Advertisement Space</h3>
                <p className="text-gray-500 text-sm">300x250 Banner</p>
                <div className="mt-4 text-4xl opacity-50">🎯</div>
              </div>
            </div>

            {/* Ad Space 3 */}
            <div className="theme-content-area p-6 text-center">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 p-8 rounded-lg border-2 border-dashed border-gray-300">
                <h3 className="text-lg font-bold text-gray-600 mb-2">Advertisement Space</h3>
                <p className="text-gray-500 text-sm">300x250 Banner</p>
                <div className="mt-4 text-4xl opacity-50">💼</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
