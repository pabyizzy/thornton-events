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

    // Build search queries
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

    // Build content with VERIFIED source URLs for each result
    // We'll pass the exact URL to the AI and tell it to use THAT URL
    const contentWithSources: Array<{ url: string; title: string; content: string }> = []

    for (const search of searchResults) {
      for (const result of search.results || []) {
        // Skip excluded aggregator sites
        const isExcluded = EXCLUDED_SITES.some(site => result.url.includes(site))
        if (isExcluded) continue

        contentWithSources.push({
          url: result.url,
          title: result.title,
          content: result.content,
        })
      }
    }

    if (contentWithSources.length === 0) {
      return NextResponse.json({
        success: true,
        deals: [],
        count: 0,
        message: 'No deals found. Try a different search.',
      })
    }

    // Format content for AI - include the EXACT URL with each entry
    const formattedContent = contentWithSources.map((item, index) =>
      `[SOURCE ${index + 1}]
URL: ${item.url}
Title: ${item.title}
Content: ${item.content}
---`
    ).join('\n\n')

    // AI prompt - extract deals and use the EXACT source URL provided
    const prompt = `Extract specific deals from these local family blog articles about ${location}.

CRITICAL: For each deal, use the EXACT "URL" from the source where you found it. Do NOT make up or guess business websites.

Example: If you find "Kids Eat Free at Denny's" in [SOURCE 3] with URL "https://milehighonthecheap.com/kids-eat-free-denver/",
then originalUrl should be "https://milehighonthecheap.com/kids-eat-free-denver/" (the exact source URL, NOT dennys.com)

RULES:
1. Extract deals with specific business names and discount amounts
2. originalUrl MUST be the exact URL from the [SOURCE] block where you found the deal
3. Include business address/location if mentioned
4. Skip vague deals without specific business names

Blog Articles:
${formattedContent}

Return up to 15 deals as JSON:
{
  "deals": [
    {
      "businessName": "Exact Business Name (e.g., 'Denny's')",
      "title": "Short deal title (e.g., 'Kids Eat Free Tuesdays')",
      "description": "What you get, conditions, times (2-3 sentences)",
      "discountAmount": "The discount (e.g., 'Kids Eat Free', '50% Off')",
      "promoCode": "CODE or null",
      "category": "Restaurants & Dining | Kids Activities | Entertainment | Free Events",
      "expiresAt": "Expiration if known, or null",
      "originalUrl": "EXACT URL from the source where you found this deal",
      "businessAddress": "Address or city if mentioned"
    }
  ]
}

Return ONLY valid JSON.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You extract deals from blog articles. Always use the EXACT source URL provided - never make up or guess business website URLs.'
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

        // Determine source label from URL
        let sourceLabel = 'Local Blog'
        if (url.includes('milehighonthecheap')) sourceLabel = 'Mile High on the Cheap'
        else if (url.includes('macaronikid')) sourceLabel = 'Macaroni KID'
        else if (url.includes('coloradoparent')) sourceLabel = 'Colorado Parent'
        else if (url.includes('denverparent')) sourceLabel = 'Denver Parent'
        else if (url.includes('303magazine')) sourceLabel = '303 Magazine'
        else if (url.includes('5280')) sourceLabel = '5280 Magazine'
        else if (url.includes('westword')) sourceLabel = 'Westword'

        return {
          source: sourceLabel,
          sourceUrl: url,
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

    // Filter out invalid deals
    const validDeals = extractedDeals.filter(deal => {
      // Must have specific business name
      if (!deal.businessName ||
          deal.businessName === 'Local Business' ||
          deal.businessName === 'Various' ||
          deal.businessName.toLowerCase().includes('various')) {
        return false
      }

      // Must have discount info
      if (!deal.discountAmount && !deal.promoCode && !deal.title.toLowerCase().includes('free')) {
        return false
      }

      // Must have a valid source URL (not made up business URLs)
      if (!deal.originalUrl || deal.originalUrl.length < 10) {
        return false
      }

      // Exclude aggregator sites
      const url = deal.originalUrl.toLowerCase()
      if (EXCLUDED_SITES.some(site => url.includes(site))) {
        return false
      }

      return true
    })

    return NextResponse.json({
      success: true,
      deals: validDeals,
      count: validDeals.length,
      searchedQueries: queries,
      sourcesSearched: contentWithSources.length,
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
