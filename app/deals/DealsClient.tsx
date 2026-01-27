'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import DealCard, { type Deal } from '../components/DealCard'
import GridDealCard from '../components/GridDealCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import CustomIcon from '../components/CustomIcon'
import Link from 'next/link'

const DEAL_CATEGORIES = [
  'Kids Activities',
  'Restaurants & Dining',
  'Retail & Shopping',
  'Services',
  'Entertainment',
  'Classes & Lessons',
  'Health & Wellness',
  'Home & Garden',
]

const DEAL_TYPES = [
  { value: 'discount', label: 'Discounts' },
  { value: 'coupon', label: 'Coupons' },
  { value: 'promotion', label: 'Promotions' },
  { value: 'freebie', label: 'Freebies' },
]

export default function DealsClient() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  useEffect(() => {
    fetchDeals()
  }, [categoryFilter, typeFilter, showFeaturedOnly])

  const fetchDeals = async () => {
    try {
      setLoading(true)
      const now = new Date().toISOString()

      let query = supabase
        .from('deals')
        .select('*')
        .eq('status', 'active')
        .gte('end_date', now)
        .order('featured', { ascending: false })
        .order('end_date', { ascending: true })

      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }
      if (typeFilter) {
        query = query.eq('deal_type', typeFilter)
      }
      if (showFeaturedOnly) {
        query = query.eq('featured', true)
      }

      const { data, error } = await query.limit(50)

      if (error) {
        setError(error.message)
      } else {
        setDeals((data ?? []) as Deal[])
        setError(null)
      }
    } catch {
      setError('Failed to fetch deals')
    } finally {
      setLoading(false)
    }
  }

  // Filter deals by search term
  const filteredDeals = deals.filter((deal) => {
    if (!searchTerm.trim()) return true
    const search = searchTerm.toLowerCase()
    return (
      deal.title.toLowerCase().includes(search) ||
      deal.business_name.toLowerCase().includes(search) ||
      deal.description.toLowerCase().includes(search) ||
      deal.category.toLowerCase().includes(search)
    )
  })

  const featuredDeals = filteredDeals.filter((d) => d.featured)
  const regularDeals = filteredDeals.filter((d) => !d.featured)

  if (loading) {
    return (
      <div className="min-h-screen theme-bg">
        <main className="max-w-6xl mx-auto p-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold theme-text-primary mb-4">
              Local Deals & Discounts
            </h1>
            <p className="text-xl theme-text-secondary mb-8">
              Finding the best deals for you...
            </p>
          </div>
          <div className="theme-content-area p-8">
            <LoadingSkeleton viewMode={viewMode} />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen theme-bg">
      <main className="max-w-6xl mx-auto p-6 pt-0">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Local Deals & Discounts
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Save money at Thornton-area businesses with exclusive deals and coupons
          </p>
          <Link
            href="/deals/submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Submit Your Business Deal
          </Link>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="theme-content-area p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search deals..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">All Categories</option>
                  {DEAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Deal Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">All Types</option>
                  {DEAL_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Featured Only */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFeaturedOnly}
                    onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured deals only</span>
                </label>
              </div>

              {/* Clear Filters */}
              {(categoryFilter || typeFilter || searchTerm || showFeaturedOnly) && (
                <button
                  onClick={() => {
                    setCategoryFilter('')
                    setTypeFilter('')
                    setSearchTerm('')
                    setShowFeaturedOnly(false)
                  }}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* View Toggle & Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} available
              </p>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <CustomIcon name="grid" className="w-4 h-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <CustomIcon name="list" className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>

            {error && (
              <div className="text-center py-8 mb-6">
                <div className="text-6xl mb-4">😅</div>
                <p className="text-2xl text-red-600 font-bold">Oops! Something went wrong</p>
                <p className="text-lg text-gray-500 mt-2">Error: {error}</p>
              </div>
            )}

            {filteredDeals.length === 0 ? (
              <div className="text-center py-16 theme-content-area">
                <CustomIcon name="search" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-2xl text-gray-600 font-bold">No deals found</p>
                <p className="text-lg text-gray-500 mt-2">
                  Try adjusting your filters or check back soon for new deals!
                </p>
              </div>
            ) : (
              <>
                {/* Featured Deals Section */}
                {featuredDeals.length > 0 && !showFeaturedOnly && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-yellow-500">★</span> Featured Deals
                    </h2>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {featuredDeals.map((deal) => (
                          <GridDealCard key={deal.id} deal={deal} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {featuredDeals.map((deal) => (
                          <DealCard key={deal.id} deal={deal} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* All/Regular Deals */}
                {(showFeaturedOnly ? filteredDeals : regularDeals).length > 0 && (
                  <div>
                    {!showFeaturedOnly && featuredDeals.length > 0 && (
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">All Deals</h2>
                    )}
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(showFeaturedOnly ? filteredDeals : regularDeals).map((deal) => (
                          <GridDealCard key={deal.id} deal={deal} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(showFeaturedOnly ? filteredDeals : regularDeals).map((deal) => (
                          <DealCard key={deal.id} deal={deal} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
