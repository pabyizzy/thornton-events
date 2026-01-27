'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import EventCard, { type EventRow } from '../components/EventCard'
import GridEventCard from '../components/GridEventCard'
import CalendarView from '../components/CalendarView'
import LoadingSkeleton from '../components/LoadingSkeleton'
import CustomIcon from '../components/CustomIcon'
import Filters from './Filters'
// Removed EventSlider hero usage per new logo banner

function rangeFor(param?: string) {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)
  if (param === 'weekend') {
    const day = now.getUTCDay()
    const daysUntilSat = (6 - day + 7) % 7
    const sat = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilSat))
    const mon = new Date(sat); mon.setUTCDate(sat.getUTCDate() + 2)
    return { start: sat.toISOString(), end: mon.toISOString() }
  }
  if (param === 'week') {
    end.setDate(end.getDate() + 7)
    return { start: start.toISOString(), end: end.toISOString() }
  }
  end.setDate(end.getDate() + 30)
  return { start: start.toISOString(), end: end.toISOString() }
}

export default function EventsClient() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    dateRange: '',
    city: '',
    category: '',
    freeOnly: false
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredEvents, setFilteredEvents] = useState<EventRow[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    fetchEvents()
    fetchCitiesAndCategories()
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter events based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEvents(events)
    } else {
      const filtered = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEvents(filtered)
    }
  }, [events, searchTerm])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const { start, end } = rangeFor(filters.dateRange)

      let q = supabase
        .from('events')
        .select('id,title,start_time,end_time,city,state,venue,url,image_url,price_text,category')
        .gte('start_time', start)
        .lt('start_time', end)

      if (filters.city) q = q.ilike('city', filters.city)
      if (filters.category) q = q.ilike('category', filters.category)
      if (filters.freeOnly) q = q.ilike('price_text', '%free%')

      const { data, error } = await q.order('start_time', { ascending: true }).limit(100)
      
      if (error) {
        setError(error.message)
      } else {
        setEvents((data ?? []) as EventRow[])
        setError(null)
      }
    } catch {
      setError('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const fetchCitiesAndCategories = async () => {
    try {
      const [citiesRes, categoriesRes] = await Promise.all([
        supabase
          .from('events')
          .select('city')
          .not('city', 'is', null)
          .order('city', { ascending: true })
          .limit(1000),
        supabase
          .from('events')
          .select('category')
          .not('category', 'is', null)
          .order('category', { ascending: true })
          .limit(1000)
      ])

      const cities = Array.from(new Set((citiesRes.data ?? []).map((r: { city: string }) => r.city))).filter(Boolean) as string[]
      const categories = Array.from(new Set((categoriesRes.data ?? []).map((r: { category: string }) => r.category))).filter(Boolean) as string[]
      
      setCities(cities)
      setCategories(categories)
    } catch {
      console.error('Failed to fetch cities and categories')
    }
  }

  const handleFilterChange = (newFilters: { dateRange?: string; city?: string; category?: string; freeOnly?: boolean }) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId)
      } else {
        newFavorites.add(eventId)
      }
      return newFavorites
    })
  }

  const applyQuickFilter = (filterType: string) => {
    switch (filterType) {
      case 'today':
        setFilters({ ...filters, dateRange: 'today' })
        break
      case 'weekend':
        setFilters({ ...filters, dateRange: 'weekend' })
        break
      case 'week':
        setFilters({ ...filters, dateRange: 'week' })
        break
      case 'free':
        setSearchTerm('free')
        break
      case 'family':
        setSearchTerm('family')
        break
      default:
        setFilters({ dateRange: '', city: '', category: '', freeOnly: false })
        setSearchTerm('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen theme-bg">
        <main className="max-w-6xl mx-auto p-6">

          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold theme-text-primary mb-4">
              All Events
            </h1>
            <p className="text-xl theme-text-secondary mb-8">
              Discovering amazing events for you...
            </p>
          </div>

          {/* Loading Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 theme-card p-4 rounded-2xl">
              <CustomIcon name="search" className="w-6 h-6 animate-bounce" />
              <span className="text-lg font-medium theme-text-primary">Finding the best events...</span>
            </div>
          </div>

          {/* Skeleton Loading */}
          <div className="theme-content-area p-8">
            <LoadingSkeleton viewMode={viewMode} />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen theme-bg">
      <main className="max-w-6xl mx-auto p-6 pt-0">

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Filters + Events */}
          <div className="lg:col-span-2">

        {/* Filters Section (with integrated search + view toggle) */}
        <div id="events-filters" className="theme-content-area mb-8 overflow-hidden">
          <button
            type="button"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((v) => !v)}
            className="theme-section-header p-4 w-full text-left flex items-center justify-between cursor-pointer select-none"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold">Advanced Filters</h2>
            <span className="text-sm opacity-80 mr-1">{filtersOpen ? 'click to collapse' : 'click to expand'}</span>
          </button>
          {filtersOpen && (
          <div className="p-6">
          <Filters
            dateRange={filters.dateRange}
            city={filters.city}
            category={filters.category}
            search={searchTerm}
            freeOnly={filters.freeOnly}
            cities={cities}
            categories={categories}
            onFilterChange={(f) => { if (f.search !== undefined) setSearchTerm(f.search); handleFilterChange(f) }}
          />
          </div>
          )}
        </div>

        {/* Events Section */}
        <div id="events-list" className="theme-content-area overflow-hidden">
          <div className="theme-section-header p-4 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-extrabold">Events</h2>
            <div className="flex bg-gray-100 rounded-lg p-0.5 md:p-1">
              <button onClick={() => setViewMode('list')} className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-base rounded-md transition-all duration-200 flex items-center gap-1 md:gap-2 ${viewMode === 'list' ? 'bg-white shadow-sm theme-text-primary' : 'text-gray-600 hover:text-gray-800 hover:bg-white/70'}`}>
                <CustomIcon name="list" className="w-3 h-3 md:w-4 md:h-4" />
                List
              </button>
              <button onClick={() => setViewMode('grid')} className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-base rounded-md transition-all duration-200 flex items-center gap-1 md:gap-2 ${viewMode === 'grid' ? 'bg-white shadow-sm theme-text-primary' : 'text-gray-600 hover:text-gray-800 hover:bg-white/70'}`}>
                <CustomIcon name="grid" className="w-3 h-3 md:w-4 md:h-4" />
                Grid
              </button>
              <button onClick={() => setViewMode('calendar')} className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-base rounded-md transition-all duration-200 flex items-center gap-1 md:gap-2 ${viewMode === 'calendar' ? 'bg-white shadow-sm theme-text-primary' : 'text-gray-600 hover:text-gray-800 hover:bg-white/70'}`}>
                <CustomIcon name="calendar" className="w-3 h-3 md:w-4 md:h-4" />
                Calendar
              </button>
            </div>
          </div>
          <div className="p-8">
          {error && (
            <div className="text-center py-8 mb-6">
              <div className="text-6xl mb-4">😅</div>
              <p className="text-2xl text-red-600 font-bold">Oops! Something went wrong</p>
              <p className="text-lg theme-text-secondary mt-2">Error: {error}</p>
            </div>
          )}

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <CustomIcon name="search" className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-2xl theme-text-secondary font-bold">
                {searchTerm ? 'No matching events found' : 'No events found'}
              </p>
              <p className="text-lg theme-text-muted mt-2">
                {searchTerm 
                  ? `Try searching for something else or clear your search term "${searchTerm}"` 
                  : 'Try adjusting your filters to see more events!'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="theme-btn-primary mt-4"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Header and view selector moved to section header; internal title removed */}
              
              {/* Dynamic View Rendering */}
              {viewMode === 'list' && (
                <div className="space-y-4 animate-fadeIn">
                  {filteredEvents.map((e, index) => (
                    <div
                      key={e.id}
                      className="animate-slideInUp"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <EventCard e={e} />
                    </div>
                  ))}
                </div>
              )}
              
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fadeIn">
                  {filteredEvents.map((e, index) => (
                    <div
                      key={e.id}
                      className="animate-slideInUp"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <GridEventCard e={e} />
                    </div>
                  ))}
                </div>
              )}
              
              {viewMode === 'calendar' && (
                <div className="animate-fadeIn">
                  <CalendarView events={filteredEvents} />
                </div>
              )}
            </>
          )}
          </div>
        </div>

          </div>

          {/* Right Column: Ad Space */}
          <div className="lg:col-span-1">
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
            <div className="theme-content-area mb-6 p-6 text-center">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-lg border-2 border-dashed border-gray-300">
                <h3 className="text-lg font-bold text-gray-600 mb-2">Advertisement Space</h3>
                <p className="text-gray-500 text-sm">300x250 Banner</p>
                <div className="mt-4 text-4xl opacity-50">🎯</div>
              </div>
            </div>
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
