import Link from 'next/link';
import { EventRow } from './EventCard';
import CustomIcon from './CustomIcon';

interface GridEventCardProps {
  e: EventRow;
}

export default function GridEventCard({ e }: GridEventCardProps) {
  const dt = e.start_time ? new Date(e.start_time) : null;
  const when = dt ? dt.toLocaleString() : '';
  const where = [e.venue, e.city, e.state].filter(Boolean).join(', ');
  const price = e.price_text || 'See site';
  

  return (
    <div className="theme-card-subtle overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <Link href={`/event-detail?id=${e.id}`} className="block">
        {/* Event Image */}
        <div className="relative h-48 overflow-hidden">
          {e.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={e.image_url} 
              alt={e.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
              <CustomIcon name="party" className="w-16 h-16 opacity-80" />
            </div>
          )}
          
        {/* Favorite button removed per request */}

          {/* Time-Sensitive Badge */}
          {dt && (
            <div className="absolute bottom-3 left-3">
              {new Date().toDateString() === dt.toDateString() && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                  <CustomIcon name="fire" className="w-3 h-3" />
                  TODAY
                </span>
              )}
              {dt.getTime() - new Date().getTime() < 86400000 * 2 && new Date().toDateString() !== dt.toDateString() && (
                <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <CustomIcon name="lightning" className="w-3 h-3" />
                  SOON
                </span>
              )}
            </div>
          )}
        </div>

        {/* Event Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold theme-text-primary mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {e.title}
          </h3>

          {/* Date & Time */}
          <div className="flex items-center gap-2 mb-2 theme-text-secondary">
            <CustomIcon name="clock" className="w-4 h-4" />
            <span className="font-medium text-sm">{when}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 mb-3 theme-text-secondary">
            <CustomIcon name="location" className="w-4 h-4" />
            <span className="font-medium text-sm truncate">{where}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {e.category && (
              <span className="theme-tag inline-flex items-center gap-1 text-xs">
                {e.category}
              </span>
            )}
            <span className="theme-tag-success inline-flex items-center gap-1 text-xs">
              {price}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <span 
              className="theme-btn-info flex-1 text-sm py-2 text-center"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                window.location.href = `/event-detail?id=${e.id}`;
              }}
            >
              Details
            </span>
            {e.url && (
              <span className="theme-btn-success flex-1 text-sm py-2 text-center" onClick={(event) => { event.preventDefault(); event.stopPropagation(); window.open(e.url as string, '_blank', 'noopener') }}>Tickets</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
