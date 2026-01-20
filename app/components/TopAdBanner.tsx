'use client'

export default function TopAdBanner() {
  return (
    <div className="w-full bg-white border-b border-[var(--theme-card-border)]">
      <div className="relative w-full h-16 md:h-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/herocollage/pexels-mero-ghar-2155149414-33981160.jpg"
          alt="Advertise to Thornton locals"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="text-white text-xs sm:text-sm md:text-base font-semibold">
            Reach Thornton locals — advertise your business on Thornton Events
          </div>
          <a
            href="mailto:thorntoncoevents@gmail.com"
            className="hidden sm:inline-block theme-btn-primary py-2 px-3 text-xs md:text-sm"
          >
            Advertise Now
          </a>
        </div>
      </div>
    </div>
  )
}


