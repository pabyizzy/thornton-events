'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { GoogleAdResponsive } from './GoogleAd'

type Article = {
  id: string
  slug: string
  title: string
  category: string
  view_count: number
  published_at: string
}

type Event = {
  id: string
  title: string
  start_time: string
  venue: string
  city: string
}

export default function ArticleSidebar() {
  const [popularArticles, setPopularArticles] = useState<Article[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSidebarContent = async () => {
      try {
        // Fetch popular articles
        const { data: articles } = await supabase
          .from('articles')
          .select('id, slug, title, category, view_count, published_at')
          .eq('status', 'published')
          .order('view_count', { ascending: false })
          .limit(5)

        setPopularArticles((articles as Article[]) || [])

        // Fetch upcoming events
        const now = new Date().toISOString()
        const { data: events } = await supabase
          .from('events')
          .select('id, title, start_time, venue, city')
          .gte('start_time', now)
          .order('start_time', { ascending: true })
          .limit(5)

        setUpcomingEvents((events as Event[]) || [])
      } catch (error) {
        console.error('Failed to load sidebar content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSidebarContent()
  }, [])

  if (loading) {
    return (
      <aside className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="space-y-6">
      {/* Popular Articles */}
      {popularArticles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Popular Articles
          </h3>
          <div className="space-y-4">
            {popularArticles.map((article, index) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="block group"
              >
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                        {article.category}
                      </span>
                      <span>{article.view_count.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/articles"
            className="block mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 text-center"
          >
            View All Articles →
          </Link>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm p-6 border-2 border-blue-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upcoming Events
          </h3>
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const eventDate = new Date(event.start_time)
              const formattedDate = eventDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })
              const formattedTime = eventDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })

              return (
                <Link
                  key={event.id}
                  href={`/event-detail?id=${event.id}`}
                  className="block bg-white rounded-lg p-3 hover:shadow-md transition-all group"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg flex flex-col items-center justify-center">
                      <span className="text-xs font-semibold uppercase">
                        {formattedDate.split(' ')[0]}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {formattedDate.split(' ')[1]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {event.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{formattedTime}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {event.venue || event.city}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          <Link
            href="/events"
            className="block mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 text-center"
          >
            View All Events →
          </Link>
        </div>
      )}

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-sm p-6 border-2 border-orange-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Stay Updated</h3>
        <p className="text-sm text-gray-600 mb-4">
          Get the latest family events and activities delivered to your inbox weekly!
        </p>
        <Link
          href="/subscribe"
          className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2.5 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-sm hover:shadow-md"
        >
          Subscribe Now
        </Link>
      </div>

      {/* Ad Space 1 */}
      <GoogleAdResponsive slot="sidebar-1" className="rounded-lg overflow-hidden" />

      {/* Categories */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Browse by Category</h3>
        <div className="space-y-2">
          {[
            { name: 'Family Fun', color: 'blue' },
            { name: 'Local News', color: 'green' },
            { name: 'Guides & Resources', color: 'purple' },
            { name: 'Seasonal Activities', color: 'orange' },
            { name: 'Parent Tips', color: 'pink' }
          ].map((category) => (
            <Link
              key={category.name}
              href={`/articles?category=${encodeURIComponent(category.name)}`}
              className={`block px-3 py-2 rounded-lg bg-${category.color}-50 text-${category.color}-700 hover:bg-${category.color}-100 transition-colors text-sm font-medium`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Ad Space 2 */}
      <GoogleAdResponsive slot="sidebar-2" className="rounded-lg overflow-hidden" />
    </aside>
  )
}
