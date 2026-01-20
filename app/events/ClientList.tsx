'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import EventCard, { type EventRow } from '../components/EventCard'
import Filters from './Filters'
// import Link from 'next/link'; // Unused for now

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

type CityRow = { city: string | null }
type CategoryRow = { category: string | null }

export default function ClientList({ sp }: { sp: Record<string, string | undefined> }) {
  const [events, setEvents] = useState<EventRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const dateRange = sp.dateRange
  const city = sp.city
  const category = sp.category
  const { start, end } = useMemo(() => rangeFor(dateRange), [dateRange])

  useEffect(() => {
    let isMounted = true
    async function load() {
      setError(null)
      setEvents(null)
      let q = supabase
        .from('events')
        .select('id,title,start_time,end_time,city,state,venue,url,image_url,price_text,category')
        .gte('start_time', start)
        .lt('start_time', end)
        .order('start_time', { ascending: true })
        .limit(100)

      if (city) q = q.ilike('city', city)
      if (category) q = q.ilike('category', category)

      const { data, error } = await q
      if (!isMounted) return
      if (error) setError(error.message)
      else setEvents((data ?? []) as EventRow[])
    }
    load()
    return () => { isMounted = false }
  }, [start, end, city, category])

  const [cities, setCities] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  useEffect(() => {
    async function loadFilters() {
      const { data: cData } = await supabase
        .from('events')
        .select('city')
        .not('city', 'is', null)
        .order('city', { ascending: true })
        .limit(1000)

      const { data: kData } = await supabase
        .from('events')
        .select('category')
        .not('category', 'is', null)
        .order('category', { ascending: true })
        .limit(1000)

      const cityList = Array.from(new Set((cData ?? []).map((r: CityRow) => r.city)))
        .filter((v): v is string => Boolean(v))
      const catList = Array.from(new Set((kData ?? []).map((r: CategoryRow) => r.category)))
        .filter((v): v is string => Boolean(v))

      setCities(cityList)
      setCategories(catList)
    }
    loadFilters()
  }, [])

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Events</h1>

      <Filters dateRange={dateRange} city={city} category={category} cities={cities} categories={categories} />

      {error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : !events ? (
        <p className="theme-text-secondary">Loading…</p>
      ) : events.length === 0 ? (
        <p className="theme-text-secondary">No events match those filters.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((e) => <EventCard key={e.id} e={e} />)}
        </ul>
      )}
    </main>
  )
}
