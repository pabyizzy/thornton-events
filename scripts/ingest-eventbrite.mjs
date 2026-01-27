#!/usr/bin/env node

/**
 * Eventbrite Event Ingestion Script
 * Fetches events near Thornton, CO from Eventbrite API
 * Run: node scripts/ingest-eventbrite.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

// Environment validation
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !EVENTBRITE_API_KEY) {
  console.error('Missing env: SUPABASE_URL / SUPABASE_SERVICE_ROLE / EVENTBRITE_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

// Thornton, CO coordinates
const THORNTON_LAT = 39.8681
const THORNTON_LON = -104.9719
const SEARCH_RADIUS = '25mi' // 25 mile radius

/**
 * Fetch events from Eventbrite API
 */
async function fetchEventbriteEvents() {
  console.log('🎫 Fetching events from Eventbrite...')

  const now = new Date()
  const threeMonthsLater = new Date(now)
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)

  const url = new URL('https://www.eventbriteapi.com/v3/events/search/')
  url.searchParams.append('location.latitude', THORNTON_LAT.toString())
  url.searchParams.append('location.longitude', THORNTON_LON.toString())
  url.searchParams.append('location.within', SEARCH_RADIUS)
  url.searchParams.append('start_date.range_start', now.toISOString())
  url.searchParams.append('start_date.range_end', threeMonthsLater.toISOString())
  url.searchParams.append('expand', 'venue,category,organizer')
  url.searchParams.append('page_size', '100')

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${EVENTBRITE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Eventbrite API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log(`✅ Found ${data.events?.length || 0} Eventbrite events`)
    return data.events || []
  } catch (error) {
    console.error('❌ Error fetching from Eventbrite:', error.message)
    return []
  }
}

/**
 * Transform Eventbrite event to our database schema
 */
function transformEventbriteEvent(event) {
  // Extract price info
  let priceText = 'Free'
  if (event.is_free === false && event.ticket_availability?.minimum_ticket_price) {
    const minPrice = event.ticket_availability.minimum_ticket_price.major_value
    const currency = event.ticket_availability.minimum_ticket_price.currency
    priceText = `From ${currency} ${minPrice}`
  }

  // Extract venue info
  const venue = event.venue?.name || 'Online Event'
  const city = event.venue?.address?.city || 'Thornton'
  const state = event.venue?.address?.region || 'CO'

  // Extract category
  const category = event.category?.name || 'General'

  // Generate unique ID (combining source and event ID)
  const uniqueId = `eventbrite-${event.id}`

  return {
    id: uniqueId,
    title: event.name?.text || 'Untitled Event',
    description: event.description?.text || event.summary || null,
    start_time: event.start?.utc || event.start?.local || null,
    end_time: event.end?.utc || event.end?.local || null,
    venue: venue,
    city: city,
    state: state,
    url: event.url || null,
    image_url: event.logo?.url || event.logo?.original?.url || null,
    price_text: priceText,
    category: category,
    source: 'eventbrite',
  }
}

/**
 * Upsert events into Supabase
 */
async function upsertEvents(events) {
  if (events.length === 0) {
    console.log('⚠️  No events to insert')
    return
  }

  console.log(`📝 Upserting ${events.length} events into database...`)

  const { data, error } = await supabase
    .from('events')
    .upsert(events, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })

  if (error) {
    console.error('❌ Error upserting events:', error)
    throw error
  }

  console.log(`✅ Successfully upserted ${events.length} events`)
  return data
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Eventbrite event ingestion...\n')

  try {
    // Fetch events from Eventbrite
    const eventbriteEvents = await fetchEventbriteEvents()

    // Transform events to our schema
    const transformedEvents = eventbriteEvents.map(transformEventbriteEvent)

    // Upsert into database
    await upsertEvents(transformedEvents)

    console.log('\n✨ Eventbrite ingestion complete!')
    console.log(`📊 Total events processed: ${transformedEvents.length}`)
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
main()
