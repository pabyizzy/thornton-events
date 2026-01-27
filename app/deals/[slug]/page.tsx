'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'
import PageLayout from '../../components/PageLayout'
import { type Deal } from '../../components/DealCard'

export default function DealDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchDeal()
    }
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDeal = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setDeal(data as Deal)
      }
    } catch {
      setError('Failed to fetch deal')
    } finally {
      setLoading(false)
    }
  }

  const copyPromoCode = () => {
    if (deal?.promo_code) {
      navigator.clipboard.writeText(deal.promo_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error || !deal) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Deal Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "This deal may have expired or been removed."}
          </p>
          <Link href="/deals" className="text-orange-600 hover:text-orange-700 font-semibold">
            ← Browse All Deals
          </Link>
        </div>
      </PageLayout>
    )
  }

  const endDate = new Date(deal.end_date)
  const startDate = new Date(deal.start_date)
  const now = new Date()
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isExpired = daysLeft <= 0
  const isExpiringSoon = daysLeft <= 3 && daysLeft > 0

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-gray-500">
            <li>
              <Link href="/" className="hover:text-orange-600">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/deals" className="hover:text-orange-600">Deals</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium truncate">{deal.title}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Hero Image */}
          {deal.image_url && (
            <div className="relative h-64 md:h-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={deal.image_url}
                alt={deal.title}
                className="w-full h-full object-cover"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {deal.featured && (
                  <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-bold rounded shadow">
                    FEATURED
                  </span>
                )}
                {isExpiringSoon && !isExpired && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded shadow animate-pulse">
                    {daysLeft} DAY{daysLeft !== 1 ? 'S' : ''} LEFT
                  </span>
                )}
                {isExpired && (
                  <span className="px-3 py-1 bg-gray-500 text-white text-sm font-bold rounded shadow">
                    EXPIRED
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Business Name */}
            <div className="flex items-center gap-3 mb-4">
              {deal.business_logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={deal.business_logo_url}
                  alt={deal.business_name}
                  className="w-12 h-12 object-contain rounded"
                />
              )}
              <span className="text-lg font-medium text-gray-600">{deal.business_name}</span>
            </div>

            {/* Title & Discount */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{deal.title}</h1>

            {deal.discount_amount && (
              <div className="text-4xl font-extrabold text-orange-600 mb-6">
                {deal.discount_amount}
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`px-3 py-1 text-sm font-semibold rounded ${dealTypeColors[deal.deal_type]}`}>
                {dealTypeLabels[deal.deal_type]}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded">
                {deal.category}
              </span>
            </div>

            {/* Promo Code */}
            {deal.promo_code && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 mb-2">Use this promo code:</p>
                <div className="flex items-center gap-3">
                  <code className="text-2xl font-mono font-bold text-gray-900 bg-white px-4 py-2 rounded border">
                    {deal.promo_code}
                  </code>
                  <button
                    onClick={copyPromoCode}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">About This Deal</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{deal.description}</p>
            </div>

            {/* Terms & Conditions */}
            {deal.terms && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Terms & Conditions</h2>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{deal.terms}</p>
              </div>
            )}

            {/* Validity Period */}
            <div className="mb-6 text-sm text-gray-600">
              <p>
                <strong>Valid:</strong>{' '}
                {startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                {' - '}
                {endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              {deal.url && !isExpired && (
                <a
                  href={deal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Redeem This Deal
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              <Link
                href="/deals"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                ← Browse More Deals
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
