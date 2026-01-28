'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import PageLayout from '../../../components/PageLayout'

interface ExternalDeal {
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

const SOURCES = [
  { id: 'all', name: 'All Deals', icon: '🔍' },
  { id: 'restaurants', name: 'Restaurants', icon: '🍔', color: 'bg-orange-100 text-orange-700' },
  { id: 'activities', name: 'Family Activities', icon: '🎮', color: 'bg-purple-100 text-purple-700' },
  { id: 'retail', name: 'Shopping', icon: '🛍️', color: 'bg-pink-100 text-pink-700' },
  { id: 'local', name: 'Local Businesses', icon: '📍', color: 'bg-teal-100 text-teal-700' },
  { id: 'groupon', name: 'Groupon', icon: '🎫', color: 'bg-green-100 text-green-700' },
  { id: 'retailmenot', name: 'RetailMeNot', icon: '🏷️', color: 'bg-red-100 text-red-700' },
]

const CATEGORY_MAP: Record<string, string> = {
  'Local Deals': 'Local Deals',
  'Coupons': 'Retail & Shopping',
  'Retail & Shopping': 'Retail & Shopping',
  'Restaurants': 'Restaurants & Dining',
  'Restaurants & Dining': 'Restaurants & Dining',
  'Kids Activities': 'Kids Activities',
}

export default function ImportDealsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [selectedSource, setSelectedSource] = useState('all')
  const [location, setLocation] = useState('Thornton, CO')
  const [query, setQuery] = useState('deals')
  const [deals, setDeals] = useState<ExternalDeal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState<string | null>(null)
  const [importedDeals, setImportedDeals] = useState<Set<string>>(new Set())

  // Check admin access
  if (authLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    )
  }

  if (!user || profile?.role !== 'admin') {
    router.push('/auth/login?redirect=/admin/deals/import')
    return null
  }

  const searchDeals = async () => {
    setLoading(true)
    setError(null)
    setDeals([])

    try {
      const params = new URLSearchParams({
        source: selectedSource,
        location: location,
        query: query,
      })

      const response = await fetch(`/api/deals/search?${params}`)
      const data = await response.json()

      if (data.success) {
        setDeals(data.deals)
        if (data.deals.length === 0) {
          setError('No deals found. Try a different search or source.')
        }
      } else {
        setError(data.error || 'Failed to search for deals')
      }
    } catch (err) {
      setError('Failed to connect to deal sources. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const importDeal = async (deal: ExternalDeal) => {
    const dealKey = `${deal.source}-${deal.title}`
    setImporting(dealKey)

    try {
      // Generate slug from title
      const slug = deal.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50) + '-' + Date.now().toString(36)

      // Map category
      const category = CATEGORY_MAP[deal.category] || 'Local Deals'

      // Calculate dates
      const startDate = new Date().toISOString()
      const endDate = deal.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      // Determine deal type based on content
      let dealType: 'discount' | 'coupon' | 'promotion' | 'freebie' = 'promotion'
      const lowerTitle = deal.title.toLowerCase()
      const lowerDesc = deal.description.toLowerCase()

      if (lowerTitle.includes('free') || lowerDesc.includes('free')) {
        dealType = 'freebie'
      } else if (deal.promoCode || lowerTitle.includes('code') || lowerDesc.includes('code')) {
        dealType = 'coupon'
      } else if (lowerTitle.includes('%') || lowerTitle.includes('off') || lowerDesc.includes('% off')) {
        dealType = 'discount'
      }

      const { error: insertError } = await supabase.from('deals').insert({
        slug,
        title: deal.title,
        description: deal.description + `\n\nSource: ${deal.source}`,
        business_name: deal.businessName,
        deal_type: dealType,
        discount_amount: deal.discountAmount,
        promo_code: deal.promoCode,
        category: category,
        terms: `Originally found on ${deal.source}. Visit ${deal.originalUrl} for full terms and conditions.`,
        start_date: startDate,
        end_date: endDate,
        url: deal.originalUrl,
        image_url: deal.imageUrl,
        status: 'active',
        featured: false,
      })

      if (insertError) {
        throw insertError
      }

      setImportedDeals(prev => new Set([...prev, dealKey]))
    } catch (err) {
      console.error('Import error:', err)
      alert('Failed to import deal. It may already exist or there was a database error.')
    } finally {
      setImporting(null)
    }
  }

  const getSourceColor = (source: string) => {
    const found = SOURCES.find(s => s.name === source || s.id === source.toLowerCase())
    return found?.color || 'bg-gray-100 text-gray-700'
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link href="/admin" className="hover:text-blue-600">Admin</Link>
              <span>/</span>
              <Link href="/admin/deals" className="hover:text-blue-600">Deals</Link>
              <span>/</span>
              <span className="text-gray-900">Import</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Import Deals from Web</h1>
            <p className="text-gray-600">AI extracts specific deals with real discounts, promo codes, and business names - ready to import</p>
          </div>

          {/* Source Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Category</h2>
            <div className="flex flex-wrap gap-3">
              {SOURCES.map((source) => (
                <button
                  key={source.id}
                  onClick={() => setSelectedSource(source.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedSource === source.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{source.icon}</span>
                  {source.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Thornton, CO"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Query</label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="deals, coupons, discounts..."
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={searchDeals}
                  disabled={loading}
                  className="w-full px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    'Search for Deals'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Results */}
          {deals.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Found {deals.length} Deals
                </h2>
                <span className="text-sm text-gray-500">
                  Click &quot;Import&quot; to add a deal to your site
                </span>
              </div>

              <div className="space-y-4">
                {deals.map((deal, index) => {
                  const dealKey = `${deal.source}-${deal.title}`
                  const isImported = importedDeals.has(dealKey)
                  const isImporting = importing === dealKey

                  return (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 transition-all ${
                        isImported ? 'bg-green-50 border-green-200' : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Image */}
                        {deal.imageUrl && (
                          <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={deal.imageUrl}
                              alt={deal.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getSourceColor(deal.source)}`}>
                              {deal.source}
                            </span>
                            {deal.discountAmount && (
                              <span className="px-2 py-0.5 text-xs font-bold bg-orange-100 text-orange-700 rounded">
                                {deal.discountAmount}
                              </span>
                            )}
                            {deal.promoCode && (
                              <span className="px-2 py-0.5 text-xs font-mono bg-gray-100 text-gray-700 rounded">
                                CODE: {deal.promoCode}
                              </span>
                            )}
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-1 truncate">
                            {deal.title}
                          </h3>

                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {deal.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{deal.businessName}</span>
                            <a
                              href={deal.originalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Original →
                            </a>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0">
                          {isImported ? (
                            <span className="inline-flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Imported
                            </span>
                          ) : (
                            <button
                              onClick={() => importDeal(deal)}
                              disabled={isImporting}
                              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isImporting ? (
                                <span className="flex items-center gap-2">
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Importing...
                                </span>
                              ) : (
                                'Import'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && deals.length === 0 && !error && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Specific Deals</h3>
              <p className="text-gray-600 mb-6">
                AI will search the web and extract actual deals with specific discounts, promo codes, and business names - not just links to deal sites.
              </p>
              <div className="text-sm text-gray-500">
                <p className="font-medium mb-2">Search by category:</p>
                <ul className="space-y-1">
                  <li>🍔 <strong>Restaurants</strong> - BOGO, happy hours, kids eat free deals</li>
                  <li>🎮 <strong>Family Activities</strong> - Museums, bowling, arcades discounts</li>
                  <li>🛍️ <strong>Shopping</strong> - Store coupons and clearance deals</li>
                  <li>📍 <strong>Local Businesses</strong> - Thornton/Denver area specials</li>
                  <li>🎫 <strong>Groupon</strong> - Verified Groupon deals</li>
                </ul>
                <p className="mt-4 text-gray-400 text-xs">
                  Powered by AI - extracts real deals with specific prices and promo codes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
