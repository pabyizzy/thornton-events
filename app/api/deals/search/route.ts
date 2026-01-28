import { NextRequest, NextResponse } from 'next/server'
import { tavily } from '@tavily/core'

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

// Lazy initialization - only create client when needed
function getTavilyClient() {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error('TAVILY_API_KEY is not configured')
  }
  return tavily({ apiKey: process.env.TAVILY_API_KEY })
}

// Extract deal info from search result using heuristics
function extractDealInfo(result: {
  title: string
  url: string
  content: string
  score: number
}): ExternalDeal | null {
  const { title, url, content } = result

  // Skip non-deal results
  const lowerTitle = title.toLowerCase()
  const lowerContent = content.toLowerCase()
  const isDeal =
    lowerTitle.includes('deal') ||
    lowerTitle.includes('coupon') ||
    lowerTitle.includes('discount') ||
    lowerTitle.includes('% off') ||
    lowerTitle.includes('$ off') ||
    lowerTitle.includes('sale') ||
    lowerTitle.includes('promo') ||
    lowerTitle.includes('free') ||
    lowerContent.includes('deal') ||
    lowerContent.includes('coupon') ||
    lowerContent.includes('discount')

  if (!isDeal) return null

  // Extract source from URL
  let source = 'Web'
  let category = 'Local Deals'
  const hostname = new URL(url).hostname.replace('www.', '')

  if (hostname.includes('groupon')) {
    source = 'Groupon'
    category = 'Local Deals'
  } else if (hostname.includes('retailmenot')) {
    source = 'RetailMeNot'
    category = 'Coupons'
  } else if (hostname.includes('yelp')) {
    source = 'Yelp'
    category = 'Local Deals'
  } else if (hostname.includes('slickdeals')) {
    source = 'Slickdeals'
    category = 'Retail & Shopping'
  } else if (hostname.includes('dealsplus')) {
    source = 'DealsPlus'
    category = 'Retail & Shopping'
  } else if (hostname.includes('coupons.com')) {
    source = 'Coupons.com'
    category = 'Coupons'
  } else if (hostname.includes('honey') || hostname.includes('joinhoney')) {
    source = 'Honey'
    category = 'Coupons'
  } else if (hostname.includes('restaurant') || hostname.includes('food')) {
    category = 'Restaurants & Dining'
  } else if (hostname.includes('target') || hostname.includes('walmart') || hostname.includes('costco')) {
    source = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1)
    category = 'Retail & Shopping'
  }

  // Try to extract discount amount
  let discountAmount: string | undefined
  const percentMatch = content.match(/(\d+)%\s*(off|discount)/i) || title.match(/(\d+)%\s*(off|discount)/i)
  const dollarMatch = content.match(/\$(\d+(?:\.\d{2})?)\s*(off|discount)/i) || title.match(/\$(\d+(?:\.\d{2})?)\s*(off|discount)/i)

  if (percentMatch) {
    discountAmount = `${percentMatch[1]}% Off`
  } else if (dollarMatch) {
    discountAmount = `$${dollarMatch[1]} Off`
  }

  // Try to extract promo code
  let promoCode: string | undefined
  const codeMatch = content.match(/(?:code|promo|coupon)[:\s]+["']?([A-Z0-9]{4,20})["']?/i)
  if (codeMatch) {
    promoCode = codeMatch[1].toUpperCase()
  }

  // Extract business name (use source or parse from title)
  let businessName = source
  const titleParts = title.split(/[:\-|–]/)
  if (titleParts.length > 1) {
    businessName = titleParts[0].trim()
  }

  return {
    source,
    sourceUrl: `https://${hostname}`,
    title: title.slice(0, 150),
    description: content.slice(0, 300),
    businessName,
    discountAmount,
    promoCode,
    category,
    originalUrl: url,
  }
}

// Search categories with specific queries
const SEARCH_QUERIES: Record<string, string[]> = {
  groupon: [
    'site:groupon.com Denver Colorado deals',
    'site:groupon.com Thornton Colorado local deals',
  ],
  retailmenot: [
    'site:retailmenot.com Denver restaurant coupons',
    'site:retailmenot.com Colorado deals',
  ],
  yelp: [
    'site:yelp.com Thornton Colorado deals offers',
  ],
  slickdeals: [
    'site:slickdeals.net frontpage deals',
    'site:slickdeals.net popular deals today',
  ],
  dealsplus: [
    'site:dealsplus.com coupons deals',
  ],
  local: [
    'Thornton Colorado local business deals discounts 2026',
    'Denver metro area family deals coupons 2026',
    'Colorado front range restaurant deals specials',
  ],
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const source = searchParams.get('source') || 'all'
  const location = searchParams.get('location') || 'Thornton, CO'
  const query = searchParams.get('query') || 'deals'

  const allDeals: ExternalDeal[] = []
  const seenUrls = new Set<string>()

  try {
    const tavilyClient = getTavilyClient()

    // Determine which queries to run
    let queries: string[] = []

    if (source === 'all') {
      // Run a mix of queries
      queries = [
        `${location} local business deals coupons discounts 2026`,
        `Denver metro family deals discounts restaurants activities`,
        'site:groupon.com Denver Colorado deals',
        'site:retailmenot.com Colorado restaurant coupons',
        'site:slickdeals.net frontpage deals',
      ]
    } else if (SEARCH_QUERIES[source]) {
      queries = SEARCH_QUERIES[source]
    } else {
      // Custom query
      queries = [`${query} ${location} deals coupons discounts`]
    }

    // Run searches (limit to avoid rate limits)
    const searchPromises = queries.slice(0, 3).map(async (searchQuery) => {
      try {
        const results = await tavilyClient.search(searchQuery, {
          searchDepth: 'basic',
          maxResults: 10,
          includeAnswer: false,
        })
        return results.results || []
      } catch (err) {
        console.error(`Search error for "${searchQuery}":`, err)
        return []
      }
    })

    const searchResults = await Promise.all(searchPromises)

    // Process all results
    for (const results of searchResults) {
      for (const result of results) {
        // Skip duplicates
        if (seenUrls.has(result.url)) continue
        seenUrls.add(result.url)

        const deal = extractDealInfo(result)
        if (deal) {
          allDeals.push(deal)
        }
      }
    }

    // Sort by relevance (deals with discount amounts first, then by title length)
    allDeals.sort((a, b) => {
      if (a.discountAmount && !b.discountAmount) return -1
      if (!a.discountAmount && b.discountAmount) return 1
      if (a.promoCode && !b.promoCode) return -1
      if (!a.promoCode && b.promoCode) return 1
      return a.title.length - b.title.length
    })

    return NextResponse.json({
      success: true,
      deals: allDeals.slice(0, 30),
      count: allDeals.length,
      sources: ['Groupon', 'RetailMeNot', 'Yelp', 'Slickdeals', 'DealsPlus', 'Local Sources'],
      searchedQueries: queries,
    })
  } catch (error) {
    console.error('Deal search error:', error)

    // Check if it's an API key error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage.includes('TAVILY_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tavily API key not configured. Please add TAVILY_API_KEY to your environment variables.',
          deals: []
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to search for deals', deals: [] },
      { status: 500 }
    )
  }
}
