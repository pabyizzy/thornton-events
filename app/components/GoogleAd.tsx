'use client'

import { useEffect, useRef } from 'react'

interface GoogleAdProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  responsive?: boolean
  style?: React.CSSProperties
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function GoogleAd({
  slot,
  format = 'auto',
  responsive = true,
  style,
  className = '',
}: GoogleAdProps) {
  const adRef = useRef<HTMLModElement>(null)
  const isAdLoaded = useRef(false)

  useEffect(() => {
    // Only run on client and if publisher ID is configured
    if (typeof window === 'undefined') return
    if (!process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID) return
    if (isAdLoaded.current) return

    try {
      // Push ad to adsbygoogle array
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      isAdLoaded.current = true
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  // Don't render if no publisher ID
  if (!process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID) {
    return (
      <div className={`bg-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center text-gray-500 text-sm mb-2">Advertisement</div>
        <div className="bg-white rounded-lg p-8 flex items-center justify-center min-h-[250px]">
          <p className="text-gray-400 text-sm">Ad Space</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="text-center text-gray-500 text-xs mb-1">Advertisement</div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          minHeight: '250px',
          ...style,
        }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}

// Predefined ad sizes for common placements
export function GoogleAdRectangle({ slot, className }: { slot: string; className?: string }) {
  return (
    <GoogleAd
      slot={slot}
      format="rectangle"
      className={className}
      style={{ width: '300px', height: '250px' }}
    />
  )
}

export function GoogleAdBanner({ slot, className }: { slot: string; className?: string }) {
  return (
    <GoogleAd
      slot={slot}
      format="horizontal"
      responsive
      className={className}
      style={{ minHeight: '90px' }}
    />
  )
}

export function GoogleAdResponsive({ slot, className }: { slot: string; className?: string }) {
  return (
    <GoogleAd
      slot={slot}
      format="auto"
      responsive
      className={className}
    />
  )
}
