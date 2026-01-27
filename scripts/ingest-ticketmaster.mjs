import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
const TM_KEY = process.env.TICKETMASTER_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !TM_KEY) {
  console.error('Missing env: SUPABASE_URL / SUPABASE_SERVICE_ROLE / TICKETMASTER_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

const LAT = 39.8680
const LON = -104.9719
const RADIUS_MILES = 25

const fmt = (d) => new Date(d).toISOString().replace(/\.\d{3}Z$/, 'Z')
const now = new Date()
const startISO = fmt(now)
const end = new Date(now)
end.setDate(end.getDate() + 45)
const endISO = fmt(end)

async function fetchPage(page = 0, size = 100) {
  const params = new URLSearchParams({
    apikey: TM_KEY,
    latlong: `${LAT},${LON}`,
    radius: String(RADIUS_MILES),
    unit: 'miles',
    sort: 'date,asc',
    size: String(size),
    page: String(page),
    countryCode: 'US',
    startDateTime: startISO,
    endDateTime: endISO,
    classificationName: 'music,sports,arts,theatre,film',
  })
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TM HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

function toRows(json) {
  const events = json?._embedded?.events ?? []
  return events.map((ev) => {
    const venue = ev?._embedded?.venues?.[0] ?? {}
    const city = venue?.city?.name ?? null
    const state = venue?.state?.stateCode ?? venue?.state?.name ?? null
    const start = ev?.dates?.start?.dateTime || null
    const end = ev?.dates?.end?.dateTime || null
    const pr = ev?.priceRanges?.[0]
    const price_text = pr ? `${pr.min ?? ''}${pr.min ? '-' : ''}${pr.max ?? ''} ${pr.currency ?? ''}`.trim() : null

    return {
      source_name: 'ticketmaster',
      source_id: ev?.id,
      title: ev?.name ?? 'Untitled event',
      start_time: start,
      end_time: end,
      timezone: ev?.dates?.timezone ?? null,
      venue: venue?.name ?? null,
      city,
      state,
      latitude: venue?.location?.latitude ? Number(venue.location.latitude) : null,
      longitude: venue?.location?.longitude ? Number(venue.location.longitude) : null,
      category: ev?.classifications?.[0]?.segment?.name ?? null,
      price_text,
      url: ev?.url ?? null,
      image_url: ev?.images?.[0]?.url ?? null,
      description: ev?.info ?? ev?.pleaseNote ?? null,
      status: ev?.dates?.status?.code === 'cancelled' ? 'canceled' : 'active',
      updated_at: new Date().toISOString(),
    }
  })
}

async function run() {
  let page = 0
  let total = 0
  while (true) {
    const data = await fetchPage(page)
    const rows = toRows(data).filter((r) => !!r.start_time)
    if (!rows.length) break

    const { error } = await supabase
      .from('events')
      .upsert(rows, { onConflict: 'source_name,source_id' })

    if (error) throw error

    total += rows.length
    const info = data?.page || {}
    if (info.number >= (info.totalPages ?? 1) - 1) break
    page += 1
  }
  console.log(`Ingest complete. Processed ~${total} events.`)
}

run().catch((e) => {
  console.error('Ingest failed:', e)
  process.exit(1)
})
