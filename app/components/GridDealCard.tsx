'use client'

import Link from 'next/link'
import { type Deal } from './DealCard'

interface GridDealCardProps {
  deal: Deal
}

export default function GridDealCard({ deal }: GridDealCardProps) {
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
    }
  }

  return (
    <Link href={`/deals/${deal.slug}`} className="group block h-full">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {deal.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={deal.image_url}
              alt={deal.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : deal.business_logo_url ? (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={deal.business_logo_url}
                alt={deal.business_name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              <svg className="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {deal.featured && (
              <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded shadow">
                FEATURED
              </span>
            )}
            {isExpiringSoon && !isExpired && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded shadow animate-pulse">
                {daysLeft} DAY{daysLeft !== 1 ? 'S' : ''} LEFT
              </span>
            )}
          </div>

          {/* Discount Amount Overlay */}
          {deal.discount_amount && (
            <div className="absolute bottom-0 right-0 bg-orange-600 text-white px-3 py-1.5 font-extrabold text-lg rounded-tl-lg">
              {deal.discount_amount}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Business Name */}
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{deal.business_name}</p>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
            {deal.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{deal.description}</p>

          {/* Promo Code */}
          {deal.promo_code && (
            <button
              onClick={copyPromoCode}
              className="w-full mb-3 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-md transition-colors"
            >
              <span className="font-mono font-bold text-gray-800">{deal.promo_code}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-auto">
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
    </Link>
  )
}
