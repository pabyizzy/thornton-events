'use client'

export default function LogoBanner() {
  return (
    <div className="w-full py-4 md:py-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/MainLogo.png"
        alt="Thornton Events"
        className="h-[7.5rem] md:h-36 mx-auto object-contain"
      />
    </div>
  )
}


