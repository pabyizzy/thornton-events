#!/usr/bin/env node

/**
 * Anythink Libraries Events Scraper
 *
 * Fetches events from Anythink Libraries RSS feed
 * Covers all Adams County library branches including Thornton locations
 *
 * RSS Feed URL with configurable filters (base64 encoded JSON)
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { createHash } from 'crypto'
import { parseStringPromise } from 'xml2js'
import { addImagesToEvents } from './lib/generate-event-image.mjs'

// Load environment variables from .env.local
config({ path: '.env.local' })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('❌ Missing env: SUPABASE_URL or SUPABASE_SERVICE_ROLE')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

// RSS feed configuration - 30 days of events from all locations
const FEED_CONFIG = {
  feedType: 'rss',
  filters: {
    location: ['all'],
    ages: ['all'],
    types: ['all'],
    tags: [],
    term: '',
    days: 30, // 30 days of events
  },
}

const FEED_DATA = Buffer.from(JSON.stringify(FEED_CONFIG)).toString('base64')
const RSS_URL = `https://events.anythinklibraries.org/feeds?data=${FEED_DATA}`

/**
 * Generate a UUID from a string (for consistent IDs)
 */
function generateUUID(str) {
  const hash = createHash('md5').update(str).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`
}

/**
 * Parse date/time from RSS description
 * Format: "Saturday, January 24 2026 9:15am - 10:00am"
 */
function parseDateTimeFromDescription(description, pubDate) {
  try {
    // Try to extract date/time from description
    const dateMatch = description.match(
      /(\w+),\s+(\w+)\s+(\d+)\s+(\d{4})\s+(\d{1,2}):(\d{2})(am|pm)\s*-\s*(\d{1,2}):(\d{2})(am|pm)/i
    )

    if (dateMatch) {
      const [, , month, day, year, startHour, startMin, startAmPm, endHour, endMin, endAmPm] =
        dateMatch

      const months = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
      }

      const monthNum = months[month.toLowerCase()]

      let startH = parseInt(startHour)
      if (startAmPm.toLowerCase() === 'pm' && startH !== 12) startH += 12
      if (startAmPm.toLowerCase() === 'am' && startH === 12) startH = 0

      let endH = parseInt(endHour)
      if (endAmPm.toLowerCase() === 'pm' && endH !== 12) endH += 12
      if (endAmPm.toLowerCase() === 'am' && endH === 12) endH = 0

      const startDate = new Date(year, monthNum, parseInt(day), startH, parseInt(startMin))
      const endDate = new Date(year, monthNum, parseInt(day), endH, parseInt(endMin))

      return {
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      }
    }

    // Fallback to pubDate
    const pubDateTime = new Date(pubDate)
    return {
      start_time: pubDateTime.toISOString(),
      end_time: new Date(pubDateTime.getTime() + 60 * 60 * 1000).toISOString(), // +1 hour
    }
  } catch {
    const pubDateTime = new Date(pubDate)
    return {
      start_time: pubDateTime.toISOString(),
      end_time: new Date(pubDateTime.getTime() + 60 * 60 * 1000).toISOString(),
    }
  }
}

/**
 * Extract location from description or use default
 */
function extractLocation(description) {
  // Common Anythink locations in the area
  const locations = [
    'Anythink Brighton',
    'Anythink Huron Street',
    'Anythink Wright Farms',
    'Anythink Commerce City',
    'Anythink Perl Mack',
    'Anythink Bennett',
    'Anythink Thornton Community Center',
  ]

  for (const loc of locations) {
    if (description.toLowerCase().includes(loc.toLowerCase().replace('anythink ', ''))) {
      return loc
    }
  }

  return 'Anythink Libraries'
}

/**
 * Determine city based on venue
 */
function getCityFromVenue(venue) {
  const venueCity = {
    'Anythink Brighton': 'Brighton',
    'Anythink Huron Street': 'Thornton',
    'Anythink Wright Farms': 'Thornton',
    'Anythink Commerce City': 'Commerce City',
    'Anythink Perl Mack': 'Denver',
    'Anythink Bennett': 'Bennett',
    'Anythink Thornton Community Center': 'Thornton',
  }
  return venueCity[venue] || 'Adams County'
}

/**
 * Fetch and parse RSS feed
 */
async function fetchAnythinkEvents() {
  console.log('🌐 Fetching Anythink Libraries RSS feed...')
  console.log(`📅 Fetching ${FEED_CONFIG.filters.days} days of events`)

  try {
    const response = await fetch(RSS_URL)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xml = await response.text()
    console.log(`✅ Fetched RSS feed (${(xml.length / 1024).toFixed(2)} KB)`)

    // Parse XML
    const result = await parseStringPromise(xml, { explicitArray: false })
    const items = result.rss.channel.item

    if (!items) {
      console.log('⚠️ No events found in RSS feed')
      return []
    }

    // Handle single item (not array)
    const eventItems = Array.isArray(items) ? items : [items]
    console.log(`📊 Found ${eventItems.length} events in feed`)

    return eventItems
  } catch (error) {
    console.error('❌ Error fetching RSS feed:', error.message)
    return []
  }
}

/**
 * Transform RSS item to database schema
 */
function transformAnythinkEvent(item) {
  const title = item.title?.replace(/\[\!\[CDATA\[|\]\]\]/g, '').trim() || 'Untitled Event'
  const description = item.description?.replace(/\[\!\[CDATA\[|\]\]\]/g, '').trim() || ''
  const content = item['content:encoded']?.replace(/\[\!\[CDATA\[|\]\]\]/g, '').trim() || description
  const link = item.link || item.guid
  const pubDate = item.pubDate

  // Extract event ID from link
  const eventIdMatch = link?.match(/event\/(\d+)/)
  const sourceId = eventIdMatch ? eventIdMatch[1] : generateUUID(title + pubDate)

  // Parse date/time
  const { start_time, end_time } = parseDateTimeFromDescription(description, pubDate)

  // Extract location
  const venue = extractLocation(description)
  const city = getCityFromVenue(venue)

  return {
    id: generateUUID(`anythink-${sourceId}`),
    source_name: 'Anythink Libraries',
    source_id: sourceId.toString(),
    title: title,
    description: content || description.split('\n').slice(1).join(' ').trim(),
    start_time: start_time,
    end_time: end_time,
    venue: venue,
    city: city,
    state: 'CO',
    url: link,
    image_url: null,
    price_text: 'Free',
    category: 'Library',
    source: 'anythink',
    source_type: 'rss-feed',
  }
}

async function main() {
  console.log('🚀 Starting Anythink Libraries event ingestion...\n')

  // Fetch events from RSS feed
  const rssItems = await fetchAnythinkEvents()
  if (rssItems.length === 0) {
    console.log('⚠️ No events to process')
    process.exit(0)
  }

  // Transform events
  const events = rssItems.map(transformAnythinkEvent)

  // Filter out events in the past
  const now = new Date()
  const futureEvents = events.filter((e) => new Date(e.start_time) >= now)
  console.log(`📅 ${futureEvents.length} future events (filtered from ${events.length} total)`)

  if (futureEvents.length === 0) {
    console.log('⚠️ No future events to upsert')
    process.exit(0)
  }

  // Add images to events (uses Unsplash API if available)
  // Note: For large batches, we limit to first 40 to respect API rate limits
  const eventsToProcess = futureEvents.slice(0, 40)
  const remainingEvents = futureEvents.slice(40)

  const eventsWithImages = await addImagesToEvents(eventsToProcess, {
    preferredSource: 'unsplash',
    delayMs: 1200, // Unsplash rate limit: 50 req/hour
  })

  // Combine processed events with remaining (no images for overflow)
  const allEvents = [...eventsWithImages, ...remainingEvents]

  console.log(`📝 Upserting ${allEvents.length} events into database...`)

  // Upsert events into database
  const { error } = await supabase.from('events').upsert(allEvents, {
    onConflict: 'source_name,source_id',
    ignoreDuplicates: false,
  })

  if (error) {
    console.error('❌ Database error:', error.message)
    process.exit(1)
  }

  console.log(`✅ Successfully upserted ${allEvents.length} events`)

  console.log('\n✨ Anythink Libraries ingestion complete!')
  console.log(`📊 Total events processed: ${allEvents.length}`)
  const withImages = allEvents.filter(e => e.image_url).length
  console.log(`🖼️  Events with images: ${withImages}/${allEvents.length}`)

  // Show sample events
  console.log('\n📋 Sample events:')
  allEvents.slice(0, 5).forEach((e) => {
    const date = new Date(e.start_time)
    const hasImg = e.image_url ? '🖼️' : '❌'
    console.log(`  ${hasImg} ${e.title.substring(0, 50)} (${date.toLocaleDateString()}) @ ${e.venue}`)
  })
}

main().catch(console.error)
