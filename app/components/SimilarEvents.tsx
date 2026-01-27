'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SimilarEvent {
  id: string
  title: string
  start_time: string | null
  venue: string | null
  city: string | null
  image_url: string | null
  category: string | null
}

interface SimilarEventsProps {
  currentEventId: string
  category: string | null
  city: string | null
  source?: string | null
}

export default function SimilarEvents({ currentEventId, category, city }: SimilarEventsProps) {
  const [events, setEvents] = useState<SimilarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSimilarEvents = async () => {
      try {
        const now = new Date().toISOString()

        // Try to find events with same category first
        let query = supabase
          .from('events')
          .select('id,title,start_time,venue,city,image_url,category')
          .neq('id', currentEventId)
          .gte('start_time', now)
          .order('start_time', { ascending: true })
          .limit(5)

        // Filter by category if available
        if (category) {
          query = query.eq('category', category)
        }

        const { data: categoryMatches } = await query

        // If we got enough matches, use them
        if (categoryMatches && categoryMatches.length >= 3) {
          setEvents(categoryMatches)
          setLoading(false)
          return
        }

        // Otherwise, also fetch by city and merge
        if (city) {
          const { data: cityMatches } = await supabase
            .from('events')
            .select('id,title,start_time,venue,city,image_url,category')
            .neq('id', currentEventId)
            .eq('city', city)
            .gte('start_time', now)
            .order('start_time', { ascending: true })
            .limit(5)

          // Combine and deduplicate
          const combined = [...(categoryMatches || [])]
          const existingIds = new Set(combined.map(e => e.id))

          cityMatches?.forEach(event => {
            if (!existingIds.has(event.id)) {
              combined.push(event)
            }
          })

          // Sort by date and limit to 5
          combined.sort((a, b) => {
            const dateA = a.start_time ? new Date(a.start_time).getTime() : 0
            const dateB = b.start_time ? new Date(b.start_time).getTime() : 0
            return dateA - dateB
          })

          setEvents(combined.slice(0, 5))
        } else {
          setEvents(categoryMatches || [])
        }
      } catch (error) {
        console.error('Error fetching similar events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarEvents()
  }, [currentEventId, category, city])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Events</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Events</h3>
      <div className="space-y-4">
        {events.map(event => {
          const dt = event.start_time ? new Date(event.start_time) : null
          const dateStr = dt ? dt.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }) : ''

          return (
            <Link
              key={event.id}
              href={`/event-detail?id=${event.id}`}
              className="flex gap-3 group"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {event.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Event Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{dateStr}</p>
                {event.venue && (
                  <p className="text-xs text-gray-400 truncate">{event.venue}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* View All Link */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link
          href="/events"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View All Events
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
