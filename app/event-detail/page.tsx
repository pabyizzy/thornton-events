'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { downloadIcs, type IcsEvent } from '../../lib/ics';
import ThemeSwitcher from '../components/ThemeSwitcher';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Event = {
  id: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  timezone: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  cost: string | null;
  url: string | null;
  description: string | null;
  image_url: string | null;
  category: string | null;
};

function EventDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [evt, setEvt] = useState<Event | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setErr('Event ID not provided');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) {
          setErr(error.message);
        } else {
          setEvt(data as Event | null);
        }
      } catch {
        setErr('Failed to load event');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen theme-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <div className="text-2xl font-bold theme-text-primary">Loading your amazing event...</div>
      </div>
    </div>
  );
  
  if (err) return (
    <div className="min-h-screen theme-bg flex items-center justify-center">
      <div className="text-center theme-card p-8">
        <div className="text-6xl mb-4">😅</div>
        <div className="text-2xl font-bold theme-text-primary mb-2">Oops! Something went wrong</div>
        <div className="theme-text-secondary">{err}</div>
      </div>
    </div>
  );
  
  if (!evt) return (
    <div className="min-h-screen theme-bg flex items-center justify-center">
      <div className="text-center theme-card p-8">
        <div className="text-6xl mb-4">🔍</div>
        <div className="text-2xl font-bold theme-text-primary mb-2">Event not found</div>
        <div className="theme-text-secondary">This event might have been moved or doesn&apos;t exist.</div>
      </div>
    </div>
  );

  const start = evt.start_time ? new Date(evt.start_time) : null;
  const end = evt.end_time ? new Date(evt.end_time) : null;

  const handleAddToCalendar = () => {
    const icsEvent: IcsEvent = {
      id: evt.id,
      title: evt.title,
      description: evt.description,
      url: evt.url,
      venue: evt.venue,
      city: evt.city,
      state: evt.state,
      start_time: evt.start_time,
      end_time: evt.end_time,
      timezone: evt.timezone
    };
    
    const filename = `${evt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    downloadIcs(icsEvent, filename);
  };

  return (
    <div className="min-h-screen theme-bg">
      <main className="max-w-4xl mx-auto p-6">
        {/* Theme Switcher */}
        <div className="flex justify-end mb-4">
          <ThemeSwitcher />
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/events" 
            className="theme-btn-outline inline-flex items-center gap-2 px-4 py-2"
          >
            <span className="text-xl">←</span>
            Back to Events
          </Link>
        </div>

        {/* Main Event Card */}
        <div className="theme-card overflow-hidden mb-8">
          {/* Event Image */}
          {evt.image_url && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={evt.image_url}
                alt={evt.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          )}

          <div className="p-8">
            {/* Event Title */}
            <h1 className="text-4xl md:text-5xl font-bold theme-text-primary mb-4 leading-tight">
              {evt.title}
            </h1>

            {/* Location Info */}
            <div className="flex items-center gap-2 mb-4 text-lg theme-text-secondary">
              <span className="text-2xl">📍</span>
              <span>
                {evt.venue ? `${evt.venue}, ` : ''}
                {evt.city}{evt.city ? ', ' : ''}{evt.state}
              </span>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-2 mb-6 text-lg theme-text-secondary">
              <span className="text-2xl">📅</span>
              <span>
                {start?.toLocaleString()} {evt.timezone ? `(${evt.timezone})` : ''}
                {end ? ` – ${end.toLocaleString()}` : ''}
              </span>
            </div>

            {/* Cost */}
            {evt.cost && (
              <div className="inline-block theme-tag-success px-6 py-3 text-lg font-bold mb-6">
                💰 {evt.cost}
              </div>
            )}

            {/* Description */}
            {evt.description && (
              <div className="theme-card-sm p-6 mb-8">
                <h3 className="text-xl font-bold theme-text-primary mb-3">
                  About This Event
                </h3>
                <div className="prose prose-lg theme-text-secondary whitespace-pre-wrap leading-relaxed">
                  {evt.description}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {evt.url && (
                <a
                  href={evt.url}
                  target="_blank"
                  rel="noreferrer"
                  className="theme-btn-primary flex-1 text-center px-8 py-4 text-lg font-bold"
                >
                  🎫 Get Tickets / Official Page
                </a>
              )}
              <button
                onClick={handleAddToCalendar}
                className="theme-btn-secondary flex-1 px-8 py-4 text-lg font-bold"
              >
                📅 Add to Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Fun decorative elements */}
        <div className="flex justify-center gap-4 text-4xl opacity-20">
          <span>🎉</span>
          <span>✨</span>
          <span>🎊</span>
          <span>🎈</span>
          <span>🎁</span>
        </div>
      </main>
    </div>
  );
}

export default function EventDetail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <div className="text-2xl font-bold theme-text-primary">Loading your amazing event...</div>
        </div>
      </div>
    }>
      <EventDetailContent />
    </Suspense>
  );
}
