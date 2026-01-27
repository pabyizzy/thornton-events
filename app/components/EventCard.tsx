import Link from 'next/link';

export type EventRow = {
  id: string
  title: string
  start_time: string | null
  end_time: string | null
  city: string | null
  state: string | null
  venue: string | null
  url?: string | null
  image_url?: string | null
  price_text?: string | null
  category?: string | null
}

export default function EventCard({ e }: { e: EventRow }) {
  const dt = e.start_time ? new Date(e.start_time) : null
  const when = dt ? dt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }) : ''
  const where = [e.venue, e.city, e.state].filter(Boolean).join(', ')
  const price = e.price_text || 'Free'

  // Calculate time-sensitive badges
  const now = new Date()
  const isToday = dt && dt.toDateString() === now.toDateString()
  const hoursUntilEvent = dt ? (dt.getTime() - now.getTime()) / (1000 * 60 * 60) : null
  const isStartingSoon = hoursUntilEvent !== null && hoursUntilEvent > 0 && hoursUntilEvent <= 3

  return (
    <Link href={`/event-detail?id=${e.id}`} className="event-card group block">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-6">
        {/* Event Image */}
        <div className="flex-shrink-0 md:self-start relative">
          {e.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={e.image_url}
              alt={e.title}
              className="w-full h-48 md:h-32 md:w-32 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 md:h-32 md:w-32 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Time-Sensitive Badges */}
          {(isToday || isStartingSoon) && (
            <div className="absolute -top-2 -right-2 flex flex-col gap-1">
              {isToday && (
                <span className="event-badge badge-today shadow-lg">
                  TODAY
                </span>
              )}
              {isStartingSoon && (
                <span className="event-badge badge-soon shadow-lg">
                  SOON
                </span>
              )}
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            {e.title}
          </h3>

          {/* Date & Time */}
          <div className="flex items-start gap-2 mb-2 text-gray-600">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm" suppressHydrationWarning>{when}</span>
          </div>

          {/* Location */}
          {where && (
            <div className="flex items-start gap-2 mb-3 text-gray-600">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{where}</span>
            </div>
          )}

          {/* Category & Price Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {e.category && (
              <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded">
                {e.category}
              </span>
            )}
            <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded">
              {price}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
