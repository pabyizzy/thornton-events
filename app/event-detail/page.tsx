'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { downloadIcs, type IcsEvent } from '../../lib/ics';
import PageLayout from '../components/PageLayout';
import SimilarEvents from '../components/SimilarEvents';

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
  source_name: string | null;
  price_text: string | null;
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
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">Loading event...</div>
        </div>
      </div>
    </PageLayout>
  );

  if (err) return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md mx-auto">
          <div className="text-6xl mb-4">😅</div>
          <div className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</div>
          <div className="text-gray-600">{err}</div>
          <Link href="/events" className="btn-primary inline-block mt-4">
            Back to Events
          </Link>
        </div>
      </div>
    </PageLayout>
  );

  if (!evt) return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <div className="text-2xl font-bold text-gray-900 mb-2">Event not found</div>
          <div className="text-gray-600">This event might have been moved or doesn&apos;t exist.</div>
          <Link href="/events" className="btn-primary inline-block mt-4">
            Browse Events
          </Link>
        </div>
      </div>
    </PageLayout>
  );

  const start = evt.start_time ? new Date(evt.start_time) : null;
  const end = evt.end_time ? new Date(evt.end_time) : null;
  const price = evt.price_text || evt.cost || 'Free';

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
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-blue-600">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/events" className="hover:text-blue-600">Events</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium truncate max-w-xs">{evt.title}</li>
          </ol>
        </nav>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Event Image */}
              {evt.image_url && (
                <div className="relative h-64 md:h-80 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={evt.image_url}
                    alt={evt.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                  {/* Price Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-lg ${
                      price.toLowerCase().includes('free')
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-900'
                    }`}>
                      {price}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Category Badge */}
                {evt.category && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
                    {evt.category}
                  </span>
                )}

                {/* Event Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {evt.title}
                </h1>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Date & Time */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Date & Time</p>
                      <p className="text-gray-900">
                        {start?.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-600">
                        {start?.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                        {end && ` - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Location</p>
                      {evt.venue && <p className="text-gray-900">{evt.venue}</p>}
                      <p className="text-gray-600">
                        {[evt.city, evt.state].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price (if no image to show badge) */}
                {!evt.image_url && (
                  <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold mb-6">
                    {price}
                  </div>
                )}

                {/* Description */}
                {evt.description && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">About This Event</h2>
                    <div className="prose prose-gray max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {evt.description}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                  {evt.url && (
                    <a
                      href={evt.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary flex-1 text-center flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Get Tickets / More Info
                    </a>
                  )}
                  <button
                    onClick={handleAddToCalendar}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Add to Calendar
                  </button>
                </div>
              </div>
            </div>

            {/* Source Attribution */}
            {evt.source_name && (
              <p className="text-sm text-gray-400 mt-4 text-center">
                Event data provided by {evt.source_name}
              </p>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Similar Events */}
            <SimilarEvents
              currentEventId={evt.id}
              category={evt.category}
              city={evt.city}
            />

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Share This Event</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const text = `Check out ${evt.title}!`;
                    const url = window.location.href;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                  }}
                  className="flex-1 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Share on Twitter"
                >
                  <svg className="w-5 h-5 mx-auto text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                  }}
                  className="flex-1 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Share on Facebook"
                >
                  <svg className="w-5 h-5 mx-auto text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                  className="flex-1 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copy Link"
                >
                  <svg className="w-5 h-5 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm p-6 border-2 border-blue-200">
              <div className="text-center">
                <svg className="w-10 h-10 mx-auto text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Never Miss an Event</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get weekly updates on the best events in Thornton
                </p>
                <Link href="/subscribe" className="btn-primary w-full text-center block">
                  Subscribe
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}

export default function EventDetail() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">Loading event...</div>
          </div>
        </div>
      </PageLayout>
    }>
      <EventDetailContent />
    </Suspense>
  );
}
