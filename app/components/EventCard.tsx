import Link from 'next/link';
import CustomIcon from './CustomIcon';

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
  const when = dt ? dt.toLocaleString() : ''
  const where = [e.venue, e.city, e.state].filter(Boolean).join(', ')
  const price = e.price_text || 'See site'

  // Calculate time-sensitive badges
  const now = new Date()
  const isToday = dt && dt.toDateString() === now.toDateString()
  const hoursUntilEvent = dt ? (dt.getTime() - now.getTime()) / (1000 * 60 * 60) : null
  const isStartingSoon = hoursUntilEvent !== null && hoursUntilEvent > 0 && hoursUntilEvent <= 3

  return (
    <Link href={`/event-detail?id=${e.id}`} className="block">
      <div className="theme-card-subtle p-6 cursor-pointer">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Event Image */}
          <div className="flex-shrink-0 md:self-start">
            {e.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={e.image_url} 
                alt={e.title} 
                className="w-full h-48 md:h-32 md:w-32 rounded-2xl object-cover shadow-md" 
              />
              ) : (
                <div className="w-full h-48 md:h-32 md:w-32 rounded-2xl bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                  <CustomIcon name="party" className="w-12 h-12 opacity-80" />
                </div>
              )}
          </div>

          {/* Event Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold theme-text-primary flex-1">
                  {e.title}
                </h3>
                {/* Time-Sensitive Badges */}
                <div className="flex flex-col gap-1 ml-3">
                  {isToday && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse whitespace-nowrap flex items-center gap-1">
                      <CustomIcon name="fire" className="w-3 h-3" />
                      TODAY
                    </span>
                  )}
                  {isStartingSoon && (
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1">
                      <CustomIcon name="lightning" className="w-3 h-3" />
                      STARTING SOON
                    </span>
                  )}
                </div>
              </div>

            {/* Date & Time */}
            <div className="flex items-center gap-2 mb-2 theme-text-secondary">
              <CustomIcon name="clock" className="w-4 h-4" />
              <span className="font-medium" suppressHydrationWarning>{when}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 mb-3 theme-text-secondary">
              <CustomIcon name="location" className="w-4 h-4" />
              <span className="font-medium">{where}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {e.category ? (
                <span className="theme-tag inline-flex items-center gap-1">
                  {e.category}
                </span>
              ) : null}
              <span className="theme-tag-success inline-flex items-center gap-1">
                {price}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <span
                className="theme-btn-info"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  window.location.href = `/event-detail?id=${e.id}`
                }}
              >
                More Info
              </span>
              {e.url ? (
                <span
                  className="theme-btn-success"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    window.open(e.url as string, '_blank', 'noopener')
                  }}
                >
                  Get Tickets
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}