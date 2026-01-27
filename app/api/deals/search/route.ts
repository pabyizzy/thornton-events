'use server'

import { NextRequest, NextResponse } from 'next/server'

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

// Helper to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...options.headers,
      },
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

// Extract text content from HTML
function extractText(html: string, startMarker: string, endMarker: string): string {
  const startIdx = html.indexOf(startMarker)
  if (startIdx === -1) return ''
  const endIdx = html.indexOf(endMarker, startIdx + startMarker.length)
  if (endIdx === -1) return ''
  return html.slice(startIdx + startMarker.length, endIdx).trim()
}

// Clean HTML tags from text
function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// ============================================================================
// SOURCE 1: GROUPON
// ============================================================================
async function searchGroupon(location: string): Promise<ExternalDeal[]> {
  const deals: ExternalDeal[] = []

  try {
    // Search Groupon for deals in the area
    const searchUrl = `https://www.groupon.com/local/denver/deals`
    const response = await fetchWithTimeout(searchUrl)

    if (!response.ok) return deals

    const html = await response.text()

    // Parse deal cards from HTML using regex patterns
    // Groupon uses JSON-LD for structured data
    const jsonLdMatches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)

    for (const match of jsonLdMatches) {
      try {
        const jsonData = JSON.parse(match[1])
        if (jsonData['@type'] === 'Product' || jsonData['@type'] === 'Offer') {
          deals.push({
            source: 'Groupon',
            sourceUrl: 'https://www.groupon.com',
            title: jsonData.name || 'Groupon Deal',
            description: jsonData.description || '',
            businessName: jsonData.seller?.name || jsonData.brand?.name || 'Local Business',
            discountAmount: jsonData.offers?.price ? `$${jsonData.offers.price}` : undefined,
            category: 'Local Deals',
            imageUrl: jsonData.image?.[0] || jsonData.image,
            originalUrl: jsonData.url || searchUrl,
          })
        }
      } catch {
        // Skip invalid JSON
      }
    }

    // Fallback: parse from HTML patterns if JSON-LD doesn't work
    if (deals.length === 0) {
      const dealPattern = /"dealTitle":"([^"]+)".*?"merchantName":"([^"]+)".*?"price":(\d+\.?\d*)/g
      let dealMatch
      while ((dealMatch = dealPattern.exec(html)) !== null && deals.length < 10) {
        deals.push({
          source: 'Groupon',
          sourceUrl: 'https://www.groupon.com',
          title: dealMatch[1],
          description: `Deal from ${dealMatch[2]}`,
          businessName: dealMatch[2],
          discountAmount: `$${dealMatch[3]}`,
          category: 'Local Deals',
          originalUrl: searchUrl,
        })
      }
    }
  } catch (error) {
    console.error('Groupon search error:', error)
  }

  return deals.slice(0, 10)
}

// ============================================================================
// SOURCE 2: RETAILMENOT
// ============================================================================
async function searchRetailMeNot(location: string): Promise<ExternalDeal[]> {
  const deals: ExternalDeal[] = []

  try {
    // Search for coupons - RetailMeNot has a browse by store page
    const searchUrl = `https://www.retailmenot.com/coupons/restaurants`
    const response = await fetchWithTimeout(searchUrl)

    if (!response.ok) return deals

    const html = await response.text()

    // Look for JSON data in the page
    const dataMatch = html.match(/window\.__PRELOADED_STATE__\s*=\s*({[\s\S]*?});/)
    if (dataMatch) {
      try {
        const data = JSON.parse(dataMatch[1])
        // Extract deals from preloaded state
        const coupons = data?.coupons?.items || data?.offers || []
        for (const coupon of coupons.slice(0, 10)) {
          deals.push({
            source: 'RetailMeNot',
            sourceUrl: 'https://www.retailmenot.com',
            title: coupon.title || coupon.description || 'Coupon',
            description: coupon.description || coupon.title || '',
            businessName: coupon.merchantName || coupon.store || 'Various Stores',
            discountAmount: coupon.discount || coupon.value,
            promoCode: coupon.code,
            category: 'Coupons',
            imageUrl: coupon.image,
            expiresAt: coupon.expirationDate,
            originalUrl: coupon.url || searchUrl,
          })
        }
      } catch {
        // Parse error
      }
    }

    // Fallback: simple HTML parsing
    if (deals.length === 0) {
      const couponPattern = /class="[^"]*offer[^"]*"[^>]*>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>[\s\S]*?<p[^>]*>([^<]+)<\/p>/gi
      let match
      while ((match = couponPattern.exec(html)) !== null && deals.length < 10) {
        deals.push({
          source: 'RetailMeNot',
          sourceUrl: 'https://www.retailmenot.com',
          title: cleanHtml(match[1]),
          description: cleanHtml(match[2]),
          businessName: 'Various Stores',
          category: 'Coupons',
          originalUrl: searchUrl,
        })
      }
    }
  } catch (error) {
    console.error('RetailMeNot search error:', error)
  }

  return deals.slice(0, 10)
}

// ============================================================================
// SOURCE 3: YELP DEALS
// ============================================================================
async function searchYelpDeals(location: string): Promise<ExternalDeal[]> {
  const deals: ExternalDeal[] = []

  try {
    // Yelp has a deals section
    const searchUrl = `https://www.yelp.com/search?find_desc=deals&find_loc=${encodeURIComponent(location)}`
    const response = await fetchWithTimeout(searchUrl)

    if (!response.ok) return deals

    const html = await response.text()

    // Look for business data in the page
    const businessPattern = /"name":"([^"]+)"[\s\S]*?"rating":([\d.]+)[\s\S]*?"reviewCount":(\d+)/g
    let match
    while ((match = businessPattern.exec(html)) !== null && deals.length < 10) {
      deals.push({
        source: 'Yelp',
        sourceUrl: 'https://www.yelp.com',
        title: `${match[1]} - Special Offer`,
        description: `Rated ${match[2]} stars with ${match[3]} reviews. Check Yelp for current deals and specials.`,
        businessName: match[1],
        category: 'Local Deals',
        originalUrl: searchUrl,
      })
    }
  } catch (error) {
    console.error('Yelp search error:', error)
  }

  return deals.slice(0, 10)
}

// ============================================================================
// SOURCE 4: SLICKDEALS
// ============================================================================
async function searchSlickdeals(query: string): Promise<ExternalDeal[]> {
  const deals: ExternalDeal[] = []

  try {
    const searchUrl = `https://slickdeals.net/newsearch.php?q=${encodeURIComponent(query)}&searcharea=deals&searchin=first`
    const response = await fetchWithTimeout(searchUrl)

    if (!response.ok) return deals

    const html = await response.text()

    // Parse deal listings
    const dealPattern = /<a[^>]*class="[^"]*dealTitle[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi
    let match
    while ((match = dealPattern.exec(html)) !== null && deals.length < 10) {
      const title = cleanHtml(match[2])
      const url = match[1].startsWith('http') ? match[1] : `https://slickdeals.net${match[1]}`

      deals.push({
        source: 'Slickdeals',
        sourceUrl: 'https://slickdeals.net',
        title: title,
        description: `Hot deal found on Slickdeals: ${title}`,
        businessName: 'Various Retailers',
        category: 'Retail & Shopping',
        originalUrl: url,
      })
    }

    // Alternative pattern
    if (deals.length === 0) {
      const altPattern = /"dealTitle":"([^"]+)".*?"dealLink":"([^"]+)"/g
      while ((match = altPattern.exec(html)) !== null && deals.length < 10) {
        deals.push({
          source: 'Slickdeals',
          sourceUrl: 'https://slickdeals.net',
          title: match[1],
          description: `Deal from Slickdeals`,
          businessName: 'Various Retailers',
          category: 'Retail & Shopping',
          originalUrl: match[2],
        })
      }
    }
  } catch (error) {
    console.error('Slickdeals search error:', error)
  }

  return deals.slice(0, 10)
}

// ============================================================================
// SOURCE 5: DEALSPLUS
// ============================================================================
async function searchDealsPlus(query: string): Promise<ExternalDeal[]> {
  const deals: ExternalDeal[] = []

  try {
    const searchUrl = `https://www.dealsplus.com/search?q=${encodeURIComponent(query)}`
    const response = await fetchWithTimeout(searchUrl)

    if (!response.ok) return deals

    const html = await response.text()

    // Parse deal cards
    const dealPattern = /<div[^>]*class="[^"]*deal-card[^"]*"[\s\S]*?<h3[^>]*>([^<]+)<\/h3>[\s\S]*?<span[^>]*class="[^"]*store[^"]*"[^>]*>([^<]+)<\/span>/gi
    let match
    while ((match = dealPattern.exec(html)) !== null && deals.length < 10) {
      deals.push({
        source: 'DealsPlus',
        sourceUrl: 'https://www.dealsplus.com',
        title: cleanHtml(match[1]),
        description: `Deal from ${cleanHtml(match[2])}`,
        businessName: cleanHtml(match[2]),
        category: 'Retail & Shopping',
        originalUrl: searchUrl,
      })
    }
  } catch (error) {
    console.error('DealsPlus search error:', error)
  }

  return deals.slice(0, 10)
}

// ============================================================================
// SOURCE 6: LOCAL NEWS / DENVER POST DEALS
// ============================================================================
async function searchLocalNews(location: string): Promise<ExternalDeal[]> {
  const deals: ExternalDeal[] = []

  try {
    // Search for local deals in news
    const searchUrl = `https://www.9news.com/search?q=${encodeURIComponent(location + ' deals coupons')}`
    const response = await fetchWithTimeout(searchUrl)

    if (!response.ok) return deals

    const html = await response.text()

    // Look for article titles about deals
    const articlePattern = /<h\d[^>]*class="[^"]*headline[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi
    let match
    while ((match = articlePattern.exec(html)) !== null && deals.length < 10) {
      const title = cleanHtml(match[2])
      if (title.toLowerCase().includes('deal') || title.toLowerCase().includes('discount') || title.toLowerCase().includes('coupon') || title.toLowerCase().includes('free')) {
        deals.push({
          source: '9News Denver',
          sourceUrl: 'https://www.9news.com',
          title: title,
          description: `Local news about deals and discounts in the Denver/Thornton area`,
          businessName: 'Local News',
          category: 'Local Deals',
          originalUrl: match[1].startsWith('http') ? match[1] : `https://www.9news.com${match[1]}`,
        })
      }
    }
  } catch (error) {
    console.error('Local news search error:', error)
  }

  return deals.slice(0, 10)
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const source = searchParams.get('source') || 'all'
  const location = searchParams.get('location') || 'Thornton, CO'
  const query = searchParams.get('query') || 'deals'

  let allDeals: ExternalDeal[] = []

  try {
    if (source === 'all' || source === 'groupon') {
      const grouponDeals = await searchGroupon(location)
      allDeals = [...allDeals, ...grouponDeals]
    }

    if (source === 'all' || source === 'retailmenot') {
      const retailMeNotDeals = await searchRetailMeNot(location)
      allDeals = [...allDeals, ...retailMeNotDeals]
    }

    if (source === 'all' || source === 'yelp') {
      const yelpDeals = await searchYelpDeals(location)
      allDeals = [...allDeals, ...yelpDeals]
    }

    if (source === 'all' || source === 'slickdeals') {
      const slickDeals = await searchSlickdeals(query)
      allDeals = [...allDeals, ...slickDeals]
    }

    if (source === 'all' || source === 'dealsplus') {
      const dealsPlusDeals = await searchDealsPlus(query)
      allDeals = [...allDeals, ...dealsPlusDeals]
    }

    if (source === 'all' || source === 'localnews') {
      const localNewsDeals = await searchLocalNews(location)
      allDeals = [...allDeals, ...localNewsDeals]
    }

    return NextResponse.json({
      success: true,
      deals: allDeals,
      count: allDeals.length,
      sources: ['Groupon', 'RetailMeNot', 'Yelp', 'Slickdeals', 'DealsPlus', '9News Denver'],
    })
  } catch (error) {
    console.error('Deal search error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search for deals', deals: [] },
      { status: 500 }
    )
  }
}
