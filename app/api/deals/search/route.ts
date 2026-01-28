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

// Search queries that find ACTUAL deals, not deal aggregator pages
const DEAL_SEARCH_QUERIES: Record<string, string[]> = {
  local: [
    '"% off" OR "$ off" OR "free" restaurant Thornton Colorado 2026',
    '"coupon" OR "promo code" Denver family activities discount',
    '"special offer" OR "deal" Thornton CO local business',
  ],
  groupon: [
    'site:groupon.com/deals Denver "% off" spa massage',
    'site:groupon.com/deals Colorado restaurant "$" price',
  ],
  retailmenot: [
    'site:retailmenot.com "code" restaurant Denver coupon',
    'site:retailmenot.com promo code Colorado stores',
  ],
  restaurants: [
    '"buy one get one" OR "BOGO" restaurant Thornton Denver',
    '"happy hour" OR "kids eat free" Denver restaurant special',
    '"% off" pizza burger Thornton Colorado coupon',
  ],
  activities: [
    '"% off" OR "discount" family activities Denver kids',
    '"free admission" OR "half price" museum zoo Denver',
    'bowling arcade trampoline Denver coupon deal',
  ],
  retail: [
    '"% off" OR "clearance" store Thornton shopping deal',
    '"coupon code" retail Denver Colorado savings',
  ],
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const source = searchParams.get('source') || 'all'
  const location = searchParams.get('location') || 'Thornton, CO'
  const query = searchParams.get('query') || 'deals'

  try {
    const tavilyClient = getTavilyClient()
    const openai = getOpenAI()

    // Build search queries based on source
    let queries: string[] = []

    if (source === 'all') {
      queries = [
        `"% off" OR "coupon code" OR "promo" ${location} restaurant family 2026`,
        `"free" OR "BOGO" OR "half price" Denver activities kids deal`,
        `"discount" OR "special offer" Colorado local business coupon`,
      ]
    } else if (DEAL_SEARCH_QUERIES[source]) {
      queries = DEAL_SEARCH_QUERIES[source]
    } else {
      queries = [`"% off" OR "coupon" OR "deal" ${query} ${location}`]
    }

    // Search with Tavily - use advanced depth to get more content
    console.log('Searching for actual deals with queries:', queries)

    const searchPromises = queries.slice(0, 2).map(async (searchQuery) => {
      try {
        const results = await tavilyClient.search(searchQuery, {
          searchDepth: 'advanced',
          maxResults: 8,
          includeAnswer: true,
        })
        return results
      } catch (err) {
        console.error(`Search error for "${searchQuery}":`, err)
        return { results: [], answer: '' }
      }
    })

    const searchResults = await Promise.all(searchPromises)

    // Combine all search content for AI processing
    const allContent: string[] = []
    const sourceUrls: string[] = []

    for (const search of searchResults) {
      if (search.answer) {
        allContent.push(`Summary: ${search.answer}`)
      }
      for (const result of search.results || []) {
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

    // Use OpenAI to extract SPECIFIC deals from the search results
    const prompt = `You are a deal extraction expert. Extract SPECIFIC, ACTIONABLE deals from the following web search results about deals in ${location}.

IMPORTANT RULES:
1. Only extract REAL deals with specific details (business name, discount amount, what you get)
2. Do NOT include generic "check this site for deals" - users can do that themselves
3. Each deal must have a SPECIFIC business name and SPECIFIC discount/offer
4. If you find a promo code, include it
5. Skip deals that are expired or don't have enough details
6. Focus on deals relevant to families in ${location} area

Web Search Results:
${allContent.join('\n')}

Extract up to 15 specific deals. Return as JSON array:
{
  "deals": [
    {
      "businessName": "Specific Business Name (e.g., 'Papa John's Thornton')",
      "title": "Short deal title (e.g., '50% Off Large Pizza')",
      "description": "What you get and any conditions (2-3 sentences max)",
      "discountAmount": "The discount (e.g., '50% Off', '$10 Off', 'Buy One Get One Free')",
      "promoCode": "CODE123 or null if none",
      "category": "Restaurants & Dining | Kids Activities | Retail & Shopping | Entertainment | Services | Local Deals",
      "expiresAt": "Expiration date if mentioned, or null",
      "originalUrl": "Source URL where this deal was found"
    }
  ]
}

Only return the JSON object, no other text.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You extract specific, actionable deals from web content. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
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
      }) => {
        // Determine source from URL
        let source = 'Local Deal'
        const url = deal.originalUrl || ''
        if (url.includes('groupon')) source = 'Groupon'
        else if (url.includes('retailmenot')) source = 'RetailMeNot'
        else if (url.includes('yelp')) source = 'Yelp'
        else if (url.includes('slickdeals')) source = 'Slickdeals'

        return {
          source,
          sourceUrl: url ? new URL(url).origin : '',
          title: deal.title || 'Deal',
          description: deal.description || '',
          businessName: deal.businessName || 'Local Business',
          discountAmount: deal.discountAmount,
          promoCode: deal.promoCode || undefined,
          category: deal.category || 'Local Deals',
          expiresAt: deal.expiresAt || undefined,
          originalUrl: deal.originalUrl || '',
        }
      })
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
    }

    // Filter out deals without specific business names or discounts
    const validDeals = extractedDeals.filter(deal =>
      deal.businessName &&
      deal.businessName !== 'Local Business' &&
      deal.businessName !== 'Various' &&
      (deal.discountAmount || deal.promoCode || deal.title.toLowerCase().includes('free'))
    )

    return NextResponse.json({
      success: true,
      deals: validDeals,
      count: validDeals.length,
      searchedQueries: queries,
      sourcesSearched: sourceUrls.length,
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
