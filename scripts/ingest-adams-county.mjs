#!/usr/bin/env node

/**
 * Adams County Special Events Scraper
 *
 * Scrapes events from Adams County Parks, Open Space & Cultural Arts
 * URL: https://adamscountyco.gov/our-county/parks-open-space-cultural-arts/special-events/
 *
 * Events include: Adams County Fair, Adams County Pride, Festival Latino, Stars & Stripes
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
 * Fetch the HTML content from Adams County events page
 */
async function fetchAdamsCountyEventsPage() {
  console.log('🌐 Fetching Adams County Special Events page...')

  const url = 'https://adamscountyco.gov/our-county/parks-open-space-cultural-arts/special-events/'

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

  const prompt = `You are a web scraping assistant. Extract event information from this Adams County Special Events page HTML.

Look for major annual events like:
- Adams County Fair (usually late July/early August)
- Adams County Pride (usually June)
- Festival Latino (usually September)
- Stars & Stripes / Independence Day celebration (usually July 3-4)
- Any other special events mentioned

For each event found, create a JSON object with:
{
  "title": "Event Name",
  "description": "Description of the event from the page",
  "start_time": "${currentYear}-MM-DDTHH:00:00-06:00" (use the date/time from the page, assume ${currentYear} if year not specified),
  "end_time": "${currentYear}-MM-DDTHH:00:00-06:00" (end time if available, otherwise same day evening),
  "venue": "Venue name if mentioned",
  "address": "Address if mentioned",
  "city": "City name (Brighton, Commerce City, etc.)",
  "url": "https://adamscountyco.gov/our-county/parks-open-space-cultural-arts/special-events/",
  "category": "Community" or "Festival" or "Fair",
  "price_text": "Free" or price if mentioned
}

Important date mappings for ${currentYear}:
- Adams County Pride: Usually 2nd Saturday of June
- Stars & Stripes: July 3rd
- Adams County Fair: Last week of July through first weekend of August (5 days)
- Festival Latino: 2nd Sunday of September

Return ONLY a valid JSON array of events. No explanations or markdown.

HTML content:
${html.substring(0, 50000)}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise web scraping assistant. Extract event data and return valid JSON only. No explanations, no markdown code blocks.'
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
    console.log(`✅ AI extracted ${events.length} events`)
    return events
  } catch (error) {
    console.error('❌ Error extracting events with AI:', error.message)
    return []
  }
}

/**
 * Transform Adams County event to database schema
 */
function transformAdamsCountyEvent(event) {
  const slug = event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const uniqueId = generateUUID(`adams-county-${slug}-${event.start_time}`)

  return {
    id: uniqueId,
    source_name: 'Adams County',
    source_id: slug,
    title: event.title,
    description: event.description || event.title,
    start_time: event.start_time,
    end_time: event.end_time || event.start_time,
    venue: event.venue || 'Adams County',
    city: event.city || 'Brighton',
    state: 'CO',
    url: event.url || 'https://adamscountyco.gov/our-county/parks-open-space-cultural-arts/special-events/',
    image_url: null,
    price_text: event.price_text || 'Free',
    category: event.category || 'Community',
    source: 'adams-county',
    source_type: 'ai-scraped',
  }
}

async function main() {
  console.log('🚀 Starting Adams County event ingestion...\n')

  // Fetch the events page
  const html = await fetchAdamsCountyEventsPage()
  if (!html) {
    console.error('❌ Failed to fetch Adams County events page')
    process.exit(1)
  }

  // Extract events using AI
  const extractedEvents = await extractEventsWithAI(html)
  if (extractedEvents.length === 0) {
    console.log('⚠️ No events extracted')
    process.exit(0)
  }

  // Transform events to database schema
  const transformedEvents = extractedEvents.map(transformAdamsCountyEvent)

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

  console.log('\n✨ Adams County ingestion complete!')
  console.log(`📊 Total events processed: ${transformedEvents.length}`)

  // Show sample events
  console.log('\n📋 Events extracted:')
  transformedEvents.forEach(e => {
    const date = new Date(e.start_time)
    console.log(`  - ${e.title} (${date.toLocaleDateString()})`)
  })
}

main().catch(console.error)
