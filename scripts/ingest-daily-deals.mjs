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

// Restaurant deals page
const DEALS_URL = 'https://www.milehighonthecheap.com/food-drink-restaurant-deals-denver/'

// Day names
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getTodayAndTomorrow() {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return {
    today: {
      dayName: DAYS[today.getDay()],
      date: today.toISOString().split('T')[0],
    },
    tomorrow: {
      dayName: DAYS[tomorrow.getDay()],
      date: tomorrow.toISOString().split('T')[0],
    },
  }
}

async function fetchDealsPage() {
  console.log('Fetching restaurant deals from Mile High on the Cheap...')

  const searchResults = await tavilyClient.extract([DEALS_URL])

  if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
    throw new Error('No content extracted from Mile High on the Cheap deals page')
  }

  return searchResults.results[0].rawContent || searchResults.results[0].text
}

async function parseDealsWithAI(pageContent, targetDays) {
  console.log(`Parsing deals for: ${targetDays.join(', ')}...`)

  const prompt = `Extract ALL restaurant and food deals from this page content for these specific days: ${targetDays.join(', ')}.

Page Content:
${pageContent}

For each deal, extract:
- dayOfWeek: The day this deal is available (${targetDays.join(' or ')})
- businessName: Restaurant/bar name
- title: Short deal title (e.g., "Kids Eat Free", "Half-Price Pizza", "$1 Tacos")
- description: Full deal description including what you get, times, conditions
- discountAmount: The discount (e.g., "Kids Eat Free", "50% Off", "BOGO", "$1 Tacos")
- location: City or address if mentioned
- times: Hours the deal is available (e.g., "3pm-6pm", "All Day")
- conditions: Any restrictions (e.g., "with adult purchase", "dine-in only")
- category: One of: "Restaurants & Dining", "Kids Activities", "Happy Hour", "Free Events"

Return as JSON:
{
  "deals": [
    {
      "dayOfWeek": "Monday",
      "businessName": "Restaurant Name",
      "title": "Short Deal Title",
      "description": "Full description with details",
      "discountAmount": "50% Off",
      "location": "Denver",
      "times": "All Day",
      "conditions": "Dine-in only",
      "category": "Restaurants & Dining"
    }
  ]
}

ONLY return deals for ${targetDays.join(' and ')}. Return ONLY valid JSON.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You extract restaurant deals from web content. Be thorough and extract every deal for the specified days.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  })

  const responseText = completion.choices[0].message.content || '{}'
  const parsed = JSON.parse(responseText)
  return parsed.deals || []
}

function toDealsRows(deals, dates) {
  const { today, tomorrow } = dates

  return deals.map((deal) => {
    // Determine which date this deal applies to
    const dealDate = deal.dayOfWeek?.toLowerCase() === today.dayName.toLowerCase()
      ? today.date
      : tomorrow.date

    // Generate unique slug from business name and day
    const slug = `${deal.businessName?.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${deal.dayOfWeek?.toLowerCase()}-${Date.now()}`

    // Build description with times and conditions
    let fullDescription = deal.description || ''
    if (deal.times && !fullDescription.includes(deal.times)) {
      fullDescription += ` Available ${deal.times}.`
    }
    if (deal.conditions && !fullDescription.includes(deal.conditions)) {
      fullDescription += ` ${deal.conditions}.`
    }

    return {
      slug: slug.substring(0, 100),
      title: deal.title || `${deal.discountAmount} at ${deal.businessName}`,
      description: fullDescription.trim(),
      business_name: deal.businessName || 'Local Restaurant',
      business_logo_url: null,
      deal_type: deal.discountAmount?.toLowerCase().includes('free') ? 'freebie' : 'discount',
      discount_amount: deal.discountAmount || null,
      promo_code: null,
      category: deal.category || 'Restaurants & Dining',
      terms: deal.conditions || null,
      start_date: `${dealDate}T00:00:00`,
      end_date: `${dealDate}T23:59:59`,
      url: DEALS_URL,
      image_url: null,
      status: 'active',
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  })
}

async function clearOldDeals() {
  // Clear deals from milehighonthecheap that have expired (end_date in the past)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('url', DEALS_URL)
    .lt('end_date', yesterday.toISOString())

  if (error) {
    console.warn('Warning: Could not clear old deals:', error.message)
  }
}

async function run() {
  try {
    const dates = getTodayAndTomorrow()
    console.log(`Today is ${dates.today.dayName} (${dates.today.date})`)
    console.log(`Tomorrow is ${dates.tomorrow.dayName} (${dates.tomorrow.date})`)

    // Fetch the deals page content
    const pageContent = await fetchDealsPage()
    console.log(`Fetched ${pageContent.length} characters of content`)

    // Parse deals for today and tomorrow
    const targetDays = [dates.today.dayName, dates.tomorrow.dayName]
    const deals = await parseDealsWithAI(pageContent, targetDays)
    console.log(`Parsed ${deals.length} deals for ${targetDays.join(' and ')}`)

    if (deals.length === 0) {
      console.log('No deals found to import')
      return
    }

    // Convert to database rows
    const rows = toDealsRows(deals, dates)

    // Log sample deals
    console.log('\nSample deals to import:')
    rows.slice(0, 5).forEach((r, i) => {
      console.log(`${i + 1}. ${r.business_name}: ${r.title}`)
      console.log(`   ${r.discount_amount} | Valid: ${r.start_date.split('T')[0]}`)
    })

    // Clear expired deals first
    await clearOldDeals()

    // Upsert deals to database
    console.log('\nUpserting deals to database...')
    const { error } = await supabase
      .from('deals')
      .upsert(rows, { onConflict: 'slug' })

    if (error) throw error

    console.log(`\nIngest complete. Imported ${rows.length} restaurant deals.`)
    console.log(`Deals valid for: ${dates.today.dayName} and ${dates.tomorrow.dayName}`)
  } catch (error) {
    console.error('Ingest failed:', error)
    process.exit(1)
  }
}

run()
