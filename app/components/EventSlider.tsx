'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';
import { type EventRow } from './EventCard';

interface EventSliderProps {
  className?: string;
}

export default function EventSlider({ className = '' }: EventSliderProps) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchNext7DaysEvents();
  }, []);

  const fetchNext7DaysEvents = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 7);

      // First, get all events for the next 7 days
      const { data: allEvents, error: allEventsError } = await supabase
        .from('events')
        .select('id,title,start_time,end_time,city,state,venue,url,image_url,price_text,category')
        .gte('start_time', now.toISOString())
        .lt('start_time', endDate.toISOString())
        .order('start_time', { ascending: true });

      if (allEventsError) {
        console.error('Error fetching events:', allEventsError);
        return;
      }

      if (!allEvents || allEvents.length === 0) {
        setEvents([]);
        return;
      }

      // Group events by category
      const eventsByCategory = allEvents.reduce((acc, event) => {
        const category = event.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(event);
        return acc;
      }, {} as Record<string, EventRow[]>);

      // Select 1-2 events from each category
      const selectedEvents: EventRow[] = [];
      const maxPerCategory = 2;
      
      Object.entries(eventsByCategory).forEach(([, events]) => {
        // Shuffle the events in this category to get variety
        const shuffled = [...events].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, maxPerCategory);
        selectedEvents.push(...selected);
      });

      // Shuffle the final selection to mix up the order
      const finalEvents = selectedEvents.sort(() => Math.random() - 0.5);
      
      // Limit to 8 events max for the slider
      setEvents((finalEvents.slice(0, 8) as EventRow[]));
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-advance slider
  useEffect(() => {
    if (events.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [events.length, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? events.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  if (loading) {
    return (
      <div className={`theme-card p-8 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-2xl font-bold theme-text-primary mb-2">Loading Featured Events</h2>
          <p className="theme-text-secondary">Finding amazing events for the next 7 days...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`theme-card p-8 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📅</div>
          <h2 className="text-2xl font-bold theme-text-primary mb-2">No Events This Week</h2>
          <p className="theme-text-secondary">Check back soon for exciting events!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`theme-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold theme-text-primary flex items-center gap-3">
          <span className="text-4xl">⭐</span>
          Featured Events - Next 7 Days
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="theme-btn-outline px-3 py-1 text-sm"
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
        </div>
      </div>

      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Slider Container */}
        <div className="overflow-hidden rounded-2xl">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {events.map((event) => (
              <div key={event.id} className="w-full flex-shrink-0">
        <Link
          href={`/event-detail?id=${event.id}`}
          className="block theme-card-subtle p-6 theme-hover-scale cursor-pointer"
        >
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {/* Event Image */}
                    <div className="flex-shrink-0 md:self-start">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-48 md:h-32 md:w-32 rounded-2xl object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-full h-48 md:h-32 md:w-32 rounded-2xl bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center text-4xl">
                          🎉
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold theme-text-primary mb-2">
                        {event.title}
                      </h3>

                      {/* Date & Time */}
                      <div className="flex items-center gap-2 mb-2 theme-text-secondary">
                        <span className="text-lg">🕒</span>
                        <span className="font-medium">
                          {event.start_time ? new Date(event.start_time).toLocaleString() : 'TBD'}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 mb-3 theme-text-secondary">
                        <span className="text-lg">📍</span>
                        <span className="font-medium">
                          {[event.venue, event.city, event.state].filter(Boolean).join(', ')}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {event.category && (
                          <span className="theme-tag inline-flex items-center gap-1">
                            <span className="text-xs">🏷️</span>
                            {event.category}
                          </span>
                        )}
                        <span className="theme-tag-success inline-flex items-center gap-1">
                          <span className="text-xs">💰</span>
                          {event.price_text || 'See site'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
              <button
                className="theme-btn-info"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/event-detail?id=${event.id}`;
                }}
              >
                📖 More Info
              </button>
                        {event.url && (
                          <a 
                            href={event.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="theme-btn-success"
                            onClick={(e) => e.stopPropagation()}
                          >
                            🎫 Get Tickets
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows - straddling outside edges */}
        {events.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute -left-6 md:-left-8 top-1/2 -translate-y-1/2 z-10 theme-btn-outline w-12 h-12 rounded-full flex items-center justify-center text-xl hover:scale-110 transition-transform duration-200"
            >
              ‹
            </button>
            <button
              onClick={goToNext}
              className="absolute -right-6 md:-right-8 top-1/2 -translate-y-1/2 z-10 theme-btn-outline w-12 h-12 rounded-full flex items-center justify-center text-xl hover:scale-110 transition-transform duration-200"
            >
              ›
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {events.length > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
