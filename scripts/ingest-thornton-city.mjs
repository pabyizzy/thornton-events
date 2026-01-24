#!/usr/bin/env node

/**
 * City of Thornton Event Ingestion Script
 * Uses AI to scrape events from thorntonco.gov
 * Run: node scripts/ingest-thornton-city.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import OpenAI from 'openai'
import { createHash } from 'crypto'

// Load environment variables from .env.local
config({ path: '.env.local' })

// Environment validation
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !OPENAI_API_KEY) {
  console.error('Missing env: SUPABASE_URL / SUPABASE_SERVICE_ROLE / OPENAI_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

/**
 * Fetch the HTML content from City of Thornton events page
 */
async function fetchThorntonEventsPage() {
  console.log('🌐 Fetching City of Thornton events page (list view)...')

  // Using list view for potentially cleaner structure
  const url = 'https://www.thorntonco.gov/community-culture/festivals-events?view=list'

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
 * Fetch image from an event page
 */
async function fetchEventImage(eventUrl) {
  try {
    const response = await fetch(eventUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ThorntonEvents/1.0)',
      },
    })

    if (!response.ok) {
      return null
    }

    const html = await response.text()

    // Look for event-specific images (not logos/favicons)
    // Pattern: /sites/default/files/styles/.../*.jpg or .png
    const imageMatch = html.match(/src="(\/sites\/default\/files\/styles\/[^"]*\.(jpg|png|webp)[^"]*)"/i)
    if (imageMatch && imageMatch[1]) {
      return `https://www.thorntonco.gov${imageMatch[1].replace(/&amp;/g, '&')}`
    }

    // Also check for images in /sites/default/files/ without styles
    const altImageMatch = html.match(/src="(\/sites\/default\/files\/[^"]*\.(jpg|png|webp)[^"]*)"/i)
    if (altImageMatch && altImageMatch[1] && !altImageMatch[1].includes('logo') && !altImageMatch[1].includes('Header')) {
      return `https://www.thorntonco.gov${altImageMatch[1].replace(/&amp;/g, '&')}`
    }

    return null
  } catch {
    return null
  }
}

/**
 * Use OpenAI to extract event data from HTML
 */
async function extractEventsWithAI(html) {
  console.log('🤖 Using AI to extract event information...')

  const prompt = `You are a web scraping assistant. Extract event information from this City of Thornton events page HTML.

Look for event links in the format: href="/community-culture/festivals-events/[event-name]"

Major annual events to extract include:
- Thorntonfest, WinterFest, Fourth of July, Harvest Fest, Trunk or Treat, Concerts & Movies, etc.

For each unique event found, create:
{
  "title": "Event Name" (clean, user-friendly),
  "description": "Brief description based on event type",
  "start_time": "2026-MM-DDTHH:00:00-07:00" (estimate typical month/date),
  "end_time": "2026-MM-DDTHH:00:00-07:00" (same or later),
  "venue": "City of Thornton",
  "url": "https://www.thorntonco.gov/community-culture/festivals-events/[slug]",
  "category": "Family Fun",
  "price_text": "Free"
}

Date estimates: Thorntonfest=June 7, WinterFest=Dec 11-13, July 4th=July 4, Harvest Fest=Oct 3, Trunk or Treat=Oct 31

Skip: vendor-information, navigation, duplicates

Return ONLY valid JSON array.

HTML:
${html.substring(0, 50000)}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise web scraping assistant. Extract event data and return valid JSON only. No explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    })

    const responseText = completion.choices[0].message.content

    // Extract JSON from response (in case AI adds markdown formatting)
    let jsonText = responseText
    if (responseText.includes('```json')) {
      jsonText = responseText.split('```json')[1].split('```')[0].trim()
    } else if (responseText.includes('```')) {
      jsonText = responseText.split('```')[1].split('```')[0].trim()
    }

    const events = JSON.parse(jsonText)
    console.log(`✅ AI extracted ${events.length} events`)
    return events
  } catch (error) {
    console.error('❌ Error with AI extraction:', error.message)
    return []
  }
}

/**
 * Generate a UUID v5 from a string (for consistent IDs)
 */
function generateUUID(str) {
  const hash = createHash('md5').update(str).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`
}

/**
 * Transform City of Thornton event to our database schema
 */
function transformThorntonEvent(event) {
  // Generate unique ID using city-thornton prefix
  const slug = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // Generate UUID from slug for database compatibility
  const uniqueId = generateUUID(`city-thornton-${slug}`)

  return {
    id: uniqueId,
    source_name: 'City of Thornton',
    source_id: slug,
    title: event.title,
    description: event.description || event.title,
    start_time: event.start_time,
    end_time: event.end_time || event.start_time,
    venue: event.venue || 'City of Thornton',
    city: 'Thornton',
    state: 'CO',
    url: event.url,
    image_url: null, // Will be filled in later
    price_text: event.price_text || 'Free',
    category: event.category || 'Community',
    source: 'city-thornton',
    source_type: 'ai-scraped',
  }
}

/**
 * Add images to events by fetching from source pages
 */
async function addSourceImages(events) {
  console.log(`\n🖼️  Fetching images from source pages...`)

  const results = []

  for (let i = 0; i < events.length; i++) {
    const event = events[i]

    process.stdout.write(`  [${i + 1}/${events.length}] ${event.title.substring(0, 40)}...`)

    const imageUrl = await fetchEventImage(event.url)

    if (imageUrl) {
      results.push({ ...event, image_url: imageUrl })
      console.log(' ✓')
    } else {
      results.push(event)
      console.log(' (no image)')
    }

    // Small delay to be respectful to the server
    if (i < events.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  const withImages = results.filter(e => e.image_url).length
  console.log(`✅ Found images for ${withImages}/${results.length} events\n`)

  return results
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
      onConflict: 'source_name,source_id',
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
  console.log('🚀 Starting City of Thornton event ingestion...\n')

  try {
    // Fetch the events page HTML
    const html = await fetchThorntonEventsPage()

    if (!html) {
      console.error('❌ Failed to fetch page content')
      process.exit(1)
    }

    // Extract events using AI
    const extractedEvents = await extractEventsWithAI(html)

    if (extractedEvents.length === 0) {
      console.log('⚠️  No events found on page')
      process.exit(0)
    }

    // Transform events to our schema
    const transformedEvents = extractedEvents.map(transformThorntonEvent)

    // Fetch images from source event pages
    const eventsWithImages = await addSourceImages(transformedEvents)

    // Upsert into database
    await upsertEvents(eventsWithImages)

    console.log('\n✨ City of Thornton ingestion complete!')
    console.log(`📊 Total events processed: ${eventsWithImages.length}`)
    const withImages = eventsWithImages.filter(e => e.image_url).length
    console.log(`🖼️  Events with images: ${withImages}/${eventsWithImages.length}`)

    // Display sample events
    console.log('\n📋 Sample events:')
    eventsWithImages.slice(0, 3).forEach(event => {
      const hasImg = event.image_url ? '🖼️' : '❌'
      console.log(`  ${hasImg} ${event.title} (${new Date(event.start_time).toLocaleDateString()})`)
    })

  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
main()
