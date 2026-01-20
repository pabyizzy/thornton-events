import { EventRow } from './EventCard';
import Link from 'next/link';

interface CalendarViewProps {
  events: EventRow[];
}

export default function CalendarView({ events }: CalendarViewProps) {
  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    if (!event.start_time) return acc;
    const date = new Date(event.start_time).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, EventRow[]>);

  const sortedDates = Object.keys(eventsByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <p className="text-2xl theme-text-secondary font-bold">No events to display in calendar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((dateString, index) => {
        const date = new Date(dateString);
        const dayEvents = eventsByDate[dateString];
        const isToday = date.toDateString() === new Date().toDateString();
        const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();
        
        return (
          <div 
            key={dateString} 
            className={`theme-card-subtle p-6 animate-slideInUp ${isToday ? 'ring-2 ring-blue-400' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
              <div className={`text-center ${isToday ? 'text-blue-600' : 'theme-text-primary'}`}>
                <div className="text-2xl font-bold">
                  {date.getDate()}
                </div>
                <div className="text-sm font-medium">
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isToday ? 'text-blue-600' : 'theme-text-primary'}`}>
                  {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <p className="text-sm theme-text-secondary">
                  {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Events for this date */}
            <div className="space-y-3">
              {dayEvents.map((event) => {
                const eventTime = event.start_time ? new Date(event.start_time) : null;
                const timeString = eventTime?.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                });

                return (
                  <Link
                    key={event.id}
                    href={`/event-detail?id=${event.id}`}
                    className="block p-4 bg-white/50 rounded-lg hover:bg-white/80 transition-colors duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                            {timeString}
                          </span>
                          {event.category && (
                            <span className="theme-tag text-xs">
                              {event.category}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold theme-text-primary group-hover:text-purple-600 transition-colors mb-1">
                          {event.title}
                        </h4>
                        <p className="text-sm theme-text-secondary">
                          📍 {[event.venue, event.city, event.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {event.price_text && (
                          <span className="theme-tag-success text-xs whitespace-nowrap">
                            💰 {event.price_text}
                          </span>
                        )}
                        <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
