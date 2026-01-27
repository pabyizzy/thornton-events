'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { type Deal } from './DealCard'

export default function FeaturedDealsCarousel() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      const now = new Date().toISOString()
      const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('status', 'active')
        .gte('end_date', now)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5)

      setDeals((data ?? []) as Deal[])
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = useCallback(() => {
    if (deals.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % deals.length)
    }
  }, [deals.length])

  const prevSlide = () => {
    if (deals.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + deals.length) % deals.length)
    }
  }

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (deals.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [deals.length, isPaused, nextSlide])

  if (loading) {
    return (
      <div className="relative h-64 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl overflow-hidden animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div className="relative h-64 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-2xl overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="text-5xl mb-3">🏷️</div>
          <h3 className="text-2xl font-bold mb-2">Local Deals Coming Soon!</h3>
          <p className="text-white/90 mb-4">
            Check back for exclusive discounts from Thornton businesses
          </p>
          <Link
            href="/deals/submit"
            className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full font-semibold transition-all hover:scale-105"
          >
            Submit Your Deal
          </Link>
        </div>
      </div>
    )
  }

  const currentDeal = deals[currentIndex]

  const dealTypeGradients: Record<string, string> = {
    discount: 'from-orange-500 via-red-500 to-pink-600',
    coupon: 'from-purple-500 via-indigo-500 to-blue-600',
    promotion: 'from-blue-500 via-cyan-500 to-teal-500',
    freebie: 'from-green-500 via-emerald-500 to-teal-500',
  }

  return (
    <div
      className="relative h-72 rounded-2xl overflow-hidden shadow-2xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {currentDeal.image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentDeal.image_url}
              alt={currentDeal.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${dealTypeGradients[currentDeal.deal_type] || dealTypeGradients.promotion} opacity-80`} />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${dealTypeGradients[currentDeal.deal_type] || dealTypeGradients.promotion}`} />
        )}
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6 text-white">
        {/* Top: Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentDeal.featured && (
              <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-lg">
                ⭐ FEATURED
              </span>
            )}
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-xs font-semibold rounded-full">
              {currentDeal.deal_type.toUpperCase()}
            </span>
          </div>
          {currentDeal.discount_amount && (
            <span className="px-4 py-2 bg-white text-gray-900 text-lg font-extrabold rounded-xl shadow-lg transform -rotate-2">
              {currentDeal.discount_amount}
            </span>
          )}
        </div>

        {/* Bottom: Title and CTA */}
        <div>
          <p className="text-sm text-white/80 font-medium mb-1">{currentDeal.business_name}</p>
          <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-tight drop-shadow-lg">
            {currentDeal.title}
          </h3>
          <div className="flex items-center gap-3">
            <Link
              href={`/deals/${currentDeal.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-0.5"
            >
              Get This Deal
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            {currentDeal.promo_code && (
              <span className="px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-mono text-sm">
                Code: {currentDeal.promo_code}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {deals.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Previous deal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Next deal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {deals.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {deals.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to deal ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {deals.length > 1 && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all ease-linear"
            style={{
              animation: 'progress 5s linear infinite',
              width: '100%',
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}
