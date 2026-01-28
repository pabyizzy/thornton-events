import { NextRequest, NextResponse } from 'next/server'
import { tavily } from '@tavily/core'
import OpenAI from 'openai'

export interface ExternalDeal {
  source: string
  sourceUrl: string
  title: string
  description: string
  businessName: string
  discountAmount?: string
  promoCode?: string
  category: string
  imageUrl?: string
  expiresAt?: string
  originalUrl: string
  businessAddress?: string
}

// Lazy initialization
function getTavilyClient() {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error('TAVILY_API_KEY is not configured')
  }
  return tavily({ apiKey: process.env.TAVILY_API_KEY })
}

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// LOCAL family deal sites to search - NOT aggregators like Groupon/Valpak
const LOCAL_DEAL_SITES = [
  'milehighonthecheap.com',
  'macaronikid.com',
  'coloradoparent.com',
  'denverparent.net',
  'coloradokids.com',
  '303magazine.com',
  '5280.com',
  'westword.com',
]

// Sites to EXCLUDE from results
const EXCLUDED_SITES = [
  'groupon.com',
  'valpak.com',
  'retailmenot.com',
  'coupons.com',
  'slickdeals.net',
  'dealsplus.com',
  'honey.com',
]

// Search queries focused on LOCAL family deal blogs
const DEAL_SEARCH_QUERIES: Record<string, string[]> = {
  restaurants: [
    'site:milehighonthecheap.com kids eat free Denver',
    'site:coloradoparent.com kids eat free restaurant',
    'site:macaronikid.com Denver restaurant deals specials',
  ],
  activities: [
    'site:milehighonthecheap.com free admission Denver museum zoo',
    'site:macaronikid.com Denver kids activities deals',
    'site:coloradoparent.com family fun discount Denver',
  ],
  local: [
    'site:milehighonthecheap.com Thornton deals',
    'site:303magazine.com Denver deals discounts',
    '"kids eat free" OR "free admission" Denver Thornton 2026',
  ],
  freebie: [
    'site:milehighonthecheap.com free things to do Denver',
    'site:macaronikid.com free events Denver kids',
    'free admission museum Denver 2026',
  ],
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const source = searchParams.get('source') || 'all'
  const location = searchParams.get('location') || 'Thornton, CO'

  try {
    const tavilyClient = getTavilyClient()
    const openai = getOpenAI()

    // Build search queries - focus on local family deal sites
    let queries: string[] = []

    if (source === 'all') {
      queries = [
        'site:milehighonthecheap.com kids eat free OR restaurant deals Denver',
        'site:coloradoparent.com kids eat free restaurant deals',
        'site:macaronikid.com Denver family deals discounts',
      ]
    } else if (DEAL_SEARCH_QUERIES[source]) {
      queries = DEAL_SEARCH_QUERIES[source]
    } else {
      queries = [
        `site:milehighonthecheap.com ${source} deals Denver`,
        `site:macaronikid.com ${source} Denver family`,
      ]
    }

    console.log('Searching local deal sites:', queries)

    const searchPromises = queries.slice(0, 3).map(async (searchQuery) => {
      try {
        const results = await tavilyClient.search(searchQuery, {
          searchDepth: 'advanced',
          maxResults: 10,
          includeAnswer: true,
        })
        return results
      } catch (err) {
        console.error(`Search error for "${searchQuery}":`, err)
        return { results: [], answer: '' }
      }
    })

    const searchResults = await Promise.all(searchPromises)

    // Combine content, EXCLUDING aggregator sites
    const allContent: string[] = []
    const sourceUrls: string[] = []

    for (const search of searchResults) {
      if (search.answer) {
        allContent.push(`Summary: ${search.answer}`)
      }
      for (const result of search.results || []) {
        // Skip excluded aggregator sites
        const isExcluded = EXCLUDED_SITES.some(site => result.url.includes(site))
        if (isExcluded) {
          console.log('Skipping excluded site:', result.url)
          continue
        }

        allContent.push(`
Source: ${result.url}
Title: ${result.title}
Content: ${result.content}
---`)
        sourceUrls.push(result.url)
      }
    }

    if (allContent.length === 0) {
      return NextResponse.json({
        success: true,
        deals: [],
        count: 0,
        message: 'No deals found. Try a different search.',
      })
    }

    // AI prompt that extracts deals AND finds the ORIGINAL business URL
    const prompt = `You are a deal extraction expert. Extract SPECIFIC deals from these local Denver/Colorado family blog posts.

CRITICAL RULES:
1. Extract REAL deals with specific business names and discount amounts
2. For "originalUrl" - find the ACTUAL BUSINESS WEBSITE, not the blog that listed the deal
   - If a restaurant is mentioned, search your knowledge for their website (e.g., "3 Margaritas" -> "https://3margaritas.com")
   - If you can't find the business website, use a Google search URL like "https://www.google.com/search?q=3+Margaritas+Thornton+CO"
3. Do NOT return the blog URL (milehighonthecheap.com, macaronikid.com) as the originalUrl
4. Include the business address/location if mentioned
5. Skip vague deals without specific business names
6. Focus on ${location} area but include Denver metro deals

Web Search Results from Local Family Blogs:
${allContent.join('\n')}

Extract up to 15 specific deals. Return as JSON:
{
  "deals": [
    {
      "businessName": "Exact Business Name (e.g., '3 Margaritas - Thornton')",
      "title": "Short deal title (e.g., 'Kids Eat Free Wednesdays')",
      "description": "What you get, conditions, times (2-3 sentences)",
      "discountAmount": "The discount (e.g., 'Kids Eat Free', '50% Off', 'BOGO')",
      "promoCode": "CODE or null",
      "category": "Restaurants & Dining | Kids Activities | Entertainment | Free Events",
      "expiresAt": "Expiration if known, or null",
      "originalUrl": "BUSINESS WEBSITE URL (NOT the blog) - e.g., https://3margaritas.com or Google search if unknown",
      "businessAddress": "Address if mentioned, or city/area"
    }
  ]
}

Return ONLY valid JSON.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You extract deals from family blogs and find the ORIGINAL business websites. Never return blog URLs as the deal source - always find or construct the actual business URL.'
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0].message.content || '{}'
    let extractedDeals: ExternalDeal[] = []

    try {
      const parsed = JSON.parse(responseText)
      extractedDeals = (parsed.deals || []).map((deal: {
        businessName?: string
        title?: string
        description?: string
        discountAmount?: string
        promoCode?: string
        category?: string
        expiresAt?: string
        originalUrl?: string
        businessAddress?: string
      }) => {
        const url = deal.originalUrl || ''

        // Determine source label
        let sourceLabel = 'Local Deal'
        if (url.includes('google.com/search')) {
          sourceLabel = 'Search'
        }

        return {
          source: sourceLabel,
          sourceUrl: url ? (url.includes('google.com') ? '' : new URL(url).origin) : '',
          title: deal.title || 'Deal',
          description: deal.description || '',
          businessName: deal.businessName || 'Local Business',
          discountAmount: deal.discountAmount,
          promoCode: deal.promoCode || undefined,
          category: deal.category || 'Local Deals',
          expiresAt: deal.expiresAt || undefined,
          originalUrl: url,
          businessAddress: deal.businessAddress,
        }
      })
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
    }

    // Filter out invalid deals and any that still have blog URLs
    const validDeals = extractedDeals.filter(deal => {
      // Must have specific business name
      if (!deal.businessName ||
          deal.businessName === 'Local Business' ||
          deal.businessName === 'Various' ||
          deal.businessName.toLowerCase().includes('various')) {
        return false
      }

      // Must have some discount info
      if (!deal.discountAmount && !deal.promoCode && !deal.title.toLowerCase().includes('free')) {
        return false
      }

      // Filter out if URL is still a blog/aggregator
      const url = deal.originalUrl.toLowerCase()
      if (EXCLUDED_SITES.some(site => url.includes(site))) {
        return false
      }
      if (url.includes('milehighonthecheap') ||
          url.includes('macaronikid') ||
          url.includes('coloradoparent')) {
        return false
      }

      return true
    })

    return NextResponse.json({
      success: true,
      deals: validDeals,
      count: validDeals.length,
      searchedQueries: queries,
      sourcesSearched: sourceUrls.length,
      localSitesUsed: LOCAL_DEAL_SITES.slice(0, 3),
    })

  } catch (error) {
    console.error('Deal search error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    if (errorMessage.includes('TAVILY_API_KEY')) {
      return NextResponse.json(
        { success: false, error: 'Tavily API key not configured.', deals: [] },
        { status: 500 }
      )
    }

    if (errorMessage.includes('OPENAI_API_KEY')) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured.', deals: [] },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to search for deals', deals: [] },
      { status: 500 }
    )
  }
}
