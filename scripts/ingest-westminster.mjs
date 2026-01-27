#!/usr/bin/env node

/**
 * Westminster Colorado Events Scraper
 *
 * Scrapes community events from City of Westminster
 * URL: https://www.westminsterco.gov/calendar.aspx
 *
 * Filters for family-friendly and community events (excludes government meetings)
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import OpenAI from 'openai'
import { createHash } from 'crypto'

// Load environment variables from .env.local
config({ path: '.env.local' })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('❌ Missing env: SUPABASE_URL or SUPABASE_SERVICE_ROLE')
  process.exit(1)
}

if (!OPENAI_API_KEY) {
  console.error('❌ Missing env: OPENAI_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

/**
 * Generate a UUID from a string (for consistent IDs)
 */
function generateUUID(str) {
  const hash = createHash('md5').update(str).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`
}

/**
 * Fetch the HTML content from Westminster calendar page
 */
async function fetchWestminsterCalendarPage() {
  console.log('🌐 Fetching Westminster Calendar page...')

  const url = 'https://www.westminsterco.gov/calendar.aspx'

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const html = await response.text()
    console.log(`✅ Fetched page (${(html.length / 1024).toFixed(2)} KB)`)
    return html
  } catch (error) {
    console.error('❌ Error fetching page:', error.message)
    return null
  }
}

/**
 * Use OpenAI to extract event data from HTML
 */
async function extractEventsWithAI(html) {
  console.log('🤖 Using AI to extract event information...')

  const currentYear = new Date().getFullYear()

  const prompt = `You are a web scraping assistant. Extract COMMUNITY and FAMILY-FRIENDLY events from this Westminster, Colorado calendar page HTML.

INCLUDE these types of events:
- Community events, festivals, and celebrations
- Library programs (book clubs, launch parties, readings)
- Recreation programs and classes
- Comedy shows, concerts, and entertainment
- Family activities and kids' programs
- Car seat clinics and safety programs
- Community update meetings with Mayor (these are open to public)

EXCLUDE these types of events (government/administrative):
- City Council Meetings
- Planning Commission Meetings
- Board Meetings (Environmental Advisory, Historic Landmark, etc.)
- Legislative Affairs Calls
- CANCELLED events
- Internal government meetings

For each valid community event found, create a JSON object with:
{
  "title": "Event Name",
  "description": "Description of the event",
  "start_time": "${currentYear}-MM-DDTHH:MM:00-07:00" (use the date/time from the page),
  "end_time": "${currentYear}-MM-DDTHH:MM:00-07:00" (end time if available),
  "venue": "Venue name",
  "address": "Full address if available",
  "city": "Westminster",
  "url": "https://www.westminsterco.gov/calendar.aspx",
  "category": "Community" or "Library" or "Recreation" or "Entertainment",
  "price_text": "Free" or price if mentioned
}

Return ONLY a valid JSON array of events. No explanations or markdown.

HTML content:
${html.substring(0, 60000)}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise web scraping assistant. Extract community event data and return valid JSON only. No explanations, no markdown code blocks. Skip government meetings.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    })

    let jsonText = completion.choices[0].message.content

    // Clean up the response if it has markdown code blocks
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim()
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim()
    }

    const events = JSON.parse(jsonText)
    console.log(`✅ AI extracted ${events.length} community events`)
    return events
  } catch (error) {
    console.error('❌ Error extracting events with AI:', error.message)
    return []
  }
}

/**
 * Transform Westminster event to database schema
 */
function transformWestminsterEvent(event) {
  const slug = event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const uniqueId = generateUUID(`westminster-${slug}-${event.start_time}`)

  return {
    id: uniqueId,
    source_name: 'City of Westminster',
    source_id: slug,
    title: event.title,
    description: event.description || event.title,
    start_time: event.start_time,
    end_time: event.end_time || event.start_time,
    venue: event.venue || 'Westminster',
    city: 'Westminster',
    state: 'CO',
    url: event.url || 'https://www.westminsterco.gov/calendar.aspx',
    image_url: null,
    price_text: event.price_text || 'Free',
    category: event.category || 'Community',
    source: 'westminster',
    source_type: 'ai-scraped',
  }
}

async function main() {
  console.log('🚀 Starting Westminster event ingestion...\n')

  // Fetch the calendar page
  const html = await fetchWestminsterCalendarPage()
  if (!html) {
    console.error('❌ Failed to fetch Westminster calendar page')
    process.exit(1)
  }

  // Extract events using AI
  const extractedEvents = await extractEventsWithAI(html)
  if (extractedEvents.length === 0) {
    console.log('⚠️ No community events extracted')
    process.exit(0)
  }

  // Transform events to database schema
  const transformedEvents = extractedEvents.map(transformWestminsterEvent)

  console.log(`📝 Upserting ${transformedEvents.length} events into database...`)

  // Upsert events into database
  const { error } = await supabase
    .from('events')
    .upsert(transformedEvents, {
      onConflict: 'source_name,source_id',
      ignoreDuplicates: false,
    })

  if (error) {
    console.error('❌ Database error:', error.message)
    process.exit(1)
  }

  console.log(`✅ Successfully upserted ${transformedEvents.length} events`)

  console.log('\n✨ Westminster ingestion complete!')
  console.log(`📊 Total events processed: ${transformedEvents.length}`)

  // Show sample events
  console.log('\n📋 Events extracted:')
  transformedEvents.forEach(e => {
    const date = new Date(e.start_time)
    console.log(`  - ${e.title} (${date.toLocaleDateString()})`)
  })
}

main().catch(console.error)
