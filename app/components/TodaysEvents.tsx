'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

type TodayEvent = {
  id: string;
  title: string;
  start_time: string;
  city: string;
  state: string;
  venue?: string;
};

export default function TodaysEvents() {
  const [todaysEvents, setTodaysEvents] = useState<TodayEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysEvents();
  }, []);

  const fetchTodaysEvents = async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_time, city, state, venue')
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString())
        .order('start_time', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Error fetching today\'s events:', error);
        return;
      }

      setTodaysEvents(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (todaysEvents.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-3xl mb-2">📅</div>
        <p className="text-gray-600 text-sm">No events scheduled for today</p>
        <p className="text-gray-500 text-xs mt-1">Check back tomorrow!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todaysEvents.map((event) => (
        <Link 
          key={event.id} 
          href={`/event-detail?id=${event.id}`}
          className="block p-2 rounded transition-colors duration-200 hover:bg-[color:var(--theme-card-bg-subtle)] hover:opacity-95"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-purple-600 mb-1">
                {formatTime(event.start_time)}
              </div>
              <h4 className="text-sm font-semibold theme-text-primary leading-tight mb-1 line-clamp-2">
                {event.title}
              </h4>
              <p className="text-xs theme-text-secondary truncate">
                📍 {event.venue ? `${event.venue}, ` : ''}{event.city}, {event.state}
              </p>
            </div>
          </div>
        </Link>
      ))}
      
      {todaysEvents.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <Link 
            href="/events"
            className="text-xs text-purple-600 hover:text-purple-800 font-medium block text-center"
          >
            SEE ALL →
          </Link>
        </div>
      )}
    </div>
  );
}
