import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import OpenAI from 'openai'
import { tavily } from '@tavily/core'

// Load environment variables from .env.local
config({ path: '.env.local' })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
const TAVILY_API_KEY = process.env.TAVILY_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing env: SUPABASE_URL / SUPABASE_SERVICE_ROLE')
  process.exit(1)
}

if (!TAVILY_API_KEY) {
  console.error('Missing env: TAVILY_API_KEY')
  process.exit(1)
}

if (!OPENAI_API_KEY) {
  console.error('Missing env: OPENAI_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
const tavilyClient = tavily({ apiKey: TAVILY_API_KEY })
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

// Mile High on the Cheap events page
const EVENTS_URL = 'https://www.milehighonthecheap.com/events/'

async function fetchEventsPage() {
  console.log('Fetching events from Mile High on the Cheap...')

  // Use Tavily to extract content from the events page
  const searchResults = await tavilyClient.extract([EVENTS_URL])

  if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
    throw new Error('No content extracted from Mile High on the Cheap events page')
  }

  return searchResults.results[0].rawContent || searchResults.results[0].text
}

async function parseEventsWithAI(pageContent) {
  console.log('Parsing events with AI...')

  const today = new Date()
  const currentYear = today.getFullYear()

  const prompt = `Extract ALL events from this Mile High on the Cheap events page content.
The current date is ${today.toISOString().split('T')[0]} and the year is ${currentYear}.

For each event, extract:
- title: Event name
- date: The date in YYYY-MM-DD format (use ${currentYear} for the year if not specified)
- startTime: Start time in HH:MM format (24-hour), or null if not specified
- endTime: End time in HH:MM format (24-hour), or null if not specified
- venue: Venue/location name
- city: City (default to "Denver" if in Denver area)
- state: State (default to "CO")
- price: Price text (e.g., "FREE", "$10", "$5-20")
- isFree: boolean, true if the event is free
- description: Brief description of the event
- url: The detail page URL from milehighonthecheap.com (full URL starting with https://)
- category: Category (one of: Family Fun, Music, Arts & Theatre, Sports, Food & Drink, Community, Education, Free Events)

Page Content:
${pageContent}

Return as JSON:
{
  "events": [
    {
      "title": "Event Title",
      "date": "2026-01-29",
      "startTime": "10:00",
      "endTime": "16:00",
      "venue": "Venue Name",
      "city": "Denver",
      "state": "CO",
      "price": "FREE",
      "isFree": true,
      "description": "Brief description",
      "url": "https://www.milehighonthecheap.com/event-page/",
      "category": "Free Events"
    }
  ]
}

Extract ALL events you can find. Return ONLY valid JSON.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You extract event data from web page content and return structured JSON. Be thorough and extract every event mentioned.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  })

  const responseText = completion.choices[0].message.content || '{}'
  const parsed = JSON.parse(responseText)
  return parsed.events || []
}

function toRows(events) {
  return events.map((ev) => {
    // Construct start_time from date and startTime
    let start_time = null
    if (ev.date) {
      if (ev.startTime) {
        start_time = `${ev.date}T${ev.startTime}:00`
      } else {
        start_time = `${ev.date}T09:00:00` // Default to 9am if no time specified
      }
    }

    // Construct end_time from date and endTime
    let end_time = null
    if (ev.date && ev.endTime) {
      end_time = `${ev.date}T${ev.endTime}:00`
    }

    // Generate a unique source_id from title and date
    const sourceId = `mhoc-${ev.title?.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)}-${ev.date || 'nodate'}`

    return {
      source_name: 'milehighonthecheap',
      source_id: sourceId,
      title: ev.title || 'Untitled event',
      start_time,
      end_time,
      timezone: 'America/Denver',
      venue: ev.venue || null,
      city: ev.city || 'Denver',
      state: ev.state || 'CO',
      latitude: null,
      longitude: null,
      category: ev.category || (ev.isFree ? 'Free Events' : 'Community'),
      price_text: ev.price || (ev.isFree ? 'FREE' : null),
      url: ev.url || EVENTS_URL,
      image_url: null, // Will use default image
      description: ev.description || null,
      status: 'active',
      updated_at: new Date().toISOString(),
    }
  })
}

async function run() {
  try {
    // Fetch the events page content
    const pageContent = await fetchEventsPage()
    console.log(`Fetched ${pageContent.length} characters of content`)

    // Parse events using AI
    const events = await parseEventsWithAI(pageContent)
    console.log(`Parsed ${events.length} events`)

    if (events.length === 0) {
      console.log('No events found to import')
      return
    }

    // Convert to database rows
    const rows = toRows(events).filter((r) => !!r.start_time)
    console.log(`${rows.length} events have valid start times`)

    if (rows.length === 0) {
      console.log('No valid events to import')
      return
    }

    // Log first few events for verification
    console.log('\nSample events to import:')
    rows.slice(0, 3).forEach((r, i) => {
      console.log(`${i + 1}. ${r.title}`)
      console.log(`   Date: ${r.start_time}`)
      console.log(`   Venue: ${r.venue}, ${r.city}`)
      console.log(`   Price: ${r.price_text}`)
      console.log(`   URL: ${r.url}`)
    })

    // Upsert events to database
    console.log('\nUpserting events to database...')
    const { error } = await supabase
      .from('events')
      .upsert(rows, { onConflict: 'source_name,source_id' })

    if (error) throw error

    console.log(`\nIngest complete. Imported ${rows.length} events from Mile High on the Cheap.`)
  } catch (error) {
    console.error('Ingest failed:', error)
    process.exit(1)
  }
}

run()
