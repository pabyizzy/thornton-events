'use client'

import Link from 'next/link'

export type Deal = {
  id: string
  slug: string
  title: string
  description: string
  business_name: string
  business_logo_url?: string | null
  deal_type: 'discount' | 'coupon' | 'promotion' | 'freebie'
  discount_amount?: string | null
  promo_code?: string | null
  category: string
  terms?: string | null
  start_date: string
  end_date: string
  url?: string | null
  image_url?: string | null
  status: 'active' | 'expired' | 'paused'
  featured: boolean
}

interface DealCardProps {
  deal: Deal
}

export default function DealCard({ deal }: DealCardProps) {
  const endDate = new Date(deal.end_date)
  const now = new Date()
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isExpiringSoon = daysLeft <= 3 && daysLeft > 0
  const isExpired = daysLeft <= 0

  const dealTypeColors = {
    discount: 'bg-orange-100 text-orange-700',
    coupon: 'bg-purple-100 text-purple-700',
    promotion: 'bg-blue-100 text-blue-700',
    freebie: 'bg-green-100 text-green-700',
  }

  const dealTypeLabels = {
    discount: 'Discount',
    coupon: 'Coupon',
    promotion: 'Promotion',
    freebie: 'Freebie',
  }

  const copyPromoCode = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (deal.promo_code) {
      navigator.clipboard.writeText(deal.promo_code)
      // Could add a toast notification here
    }
  }

  return (
    <Link href={`/deals/${deal.slug}`} className="deal-card group block">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-6">
          {/* Deal Image or Business Logo */}
          <div className="flex-shrink-0 md:self-start relative">
            {deal.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={deal.image_url}
                alt={deal.title}
                className="w-full h-48 md:h-32 md:w-32 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : deal.business_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={deal.business_logo_url}
                alt={deal.business_name}
                className="w-full h-48 md:h-32 md:w-32 rounded-lg object-contain bg-gray-50 p-2"
              />
            ) : (
              <div className="w-full h-48 md:h-32 md:w-32 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            )}

            {/* Badges */}
            <div className="absolute -top-2 -right-2 flex flex-col gap-1">
              {deal.featured && (
                <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded shadow-lg">
                  FEATURED
                </span>
              )}
              {isExpiringSoon && !isExpired && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded shadow-lg animate-pulse">
                  {daysLeft} DAY{daysLeft !== 1 ? 'S' : ''} LEFT
                </span>
              )}
            </div>
          </div>

          {/* Deal Details */}
          <div className="flex-1 min-w-0">
            {/* Business Name */}
            <p className="text-sm font-medium text-gray-500 mb-1">{deal.business_name}</p>

            {/* Deal Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
              {deal.title}
            </h3>

            {/* Discount Amount */}
            {deal.discount_amount && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-extrabold text-orange-600">{deal.discount_amount}</span>
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{deal.description}</p>

            {/* Promo Code */}
            {deal.promo_code && (
              <div className="mb-3">
                <button
                  onClick={copyPromoCode}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-md transition-colors"
                >
                  <span className="font-mono font-bold text-gray-800">{deal.promo_code}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${dealTypeColors[deal.deal_type]}`}>
                {dealTypeLabels[deal.deal_type]}
              </span>
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                {deal.category}
              </span>
              {isExpired && (
                <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                  Expired
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
