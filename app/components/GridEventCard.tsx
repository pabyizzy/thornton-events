import Link from 'next/link';
import { EventRow } from './EventCard';

interface GridEventCardProps {
  e: EventRow;
}

export default function GridEventCard({ e }: GridEventCardProps) {
  const dt = e.start_time ? new Date(e.start_time) : null;
  const when = dt ? dt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }) : '';
  const where = [e.venue, e.city, e.state].filter(Boolean).join(', ');
  const price = e.price_text || 'Free';

  const isToday = dt && new Date().toDateString() === dt.toDateString();
  const isSoon = dt && dt.getTime() - new Date().getTime() < 86400000 * 2 && !isToday;

  return (
    <Link href={`/event-detail?id=${e.id}`} className="event-card group block">
      {/* Event Image */}
      <div className="event-card-image relative overflow-hidden">
        {e.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={e.image_url}
            alt={e.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {isToday && (
            <span className="event-badge badge-today shadow-lg">
              TODAY
            </span>
          )}
          {isSoon && (
            <span className="event-badge badge-soon shadow-lg">
              SOON
            </span>
          )}
          {price.toLowerCase().includes('free') && (
            <span className="event-badge badge-free shadow-lg">
              FREE
            </span>
          )}
        </div>
      </div>

      {/* Event Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {e.title}
        </h3>

        {/* Date & Time */}
        <div className="flex items-start gap-2 mb-2 text-gray-600">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{when}</span>
        </div>

        {/* Location */}
        {where && (
          <div className="flex items-start gap-2 mb-3 text-gray-600">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm line-clamp-1">{where}</span>
          </div>
        )}

        {/* Category & Price */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
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
    </Link>
  );
}
