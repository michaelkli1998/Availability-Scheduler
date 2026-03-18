'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { Event } from '@/types/event';
import { getAllEvents } from '@/lib/firebase/firestore';
import { formatDate } from '@/lib/utils/date';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FadeIn from '@/components/animations/FadeIn';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await getAllEvents(50);
        setEvents(fetchedEvents);
      } catch (err) {
        setError('Failed to load events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">meet2when</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <FadeIn>
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">All Events</h1>
              <p className="text-gray-600">
                Browse recent scheduling polls and find your event
              </p>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No events found</p>
                <Link
                  href="/create"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Create the first event →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => {
                  const startDate = event.dateRange.start.toDate();
                  const endDate = event.dateRange.end.toDate();

                  return (
                    <Link
                      key={event.id}
                      href={`/event/${event.id}/results`}
                      className="block"
                    >
                      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                              {event.title}
                            </h2>
                            {event.description && (
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>Organized by {event.organizerName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDate(startDate.toISOString().split('T')[0])} -{' '}
                                  {formatDate(endDate.toISOString().split('T')[0])}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
