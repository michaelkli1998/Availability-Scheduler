'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft, Users } from 'lucide-react';
import { useEvent } from '@/lib/hooks/useEvent';
import { useAvailabilities } from '@/lib/hooks/useAvailability';
import { generateTimeSlots } from '@/lib/utils/date';
import { calculateHeatmap } from '@/lib/utils/heatmap';
import { getEventUrl } from '@/lib/utils/url';
import { TimeSlot, HeatmapData } from '@/types/event';
import EventHeader from '@/components/event/EventHeader';
import AvailabilityHeatmap from '@/components/availability/AvailabilityHeatmap';
import ParticipantList from '@/components/availability/ParticipantList';
import ShareableLink from '@/components/event/ShareableLink';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FadeIn from '@/components/animations/FadeIn';

export default function ResultsPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const { event, loading: eventLoading, error: eventError } = useEvent(eventId);
  const { availabilities, loading: availabilitiesLoading } = useAvailabilities(eventId);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [eventUrl, setEventUrl] = useState('');

  useEffect(() => {
    if (event) {
      const slots = generateTimeSlots(
        event.dateRange.start.toDate(),
        event.dateRange.end.toDate(),
        event.settings.startTime,
        event.settings.endTime,
        event.settings.intervalMinutes
      );
      setTimeSlots(slots);
      setEventUrl(getEventUrl(eventId));
    }
  }, [event, eventId]);

  useEffect(() => {
    if (timeSlots.length > 0) {
      const slotIds = timeSlots.map((slot) => slot.id);
      const heatmap = calculateHeatmap(availabilities, slotIds);
      setHeatmapData(heatmap);
    }
  }, [availabilities, timeSlots]);

  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading event..." />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600 mb-4">
            The event you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">meet2when</span>
            </Link>
            <Link
              href="/events"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View Events
            </Link>
            <Link href={`/event/${eventId}`}>
              <Button variant="ghost" size="sm">
                Submit Response
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <EventHeader event={event} participantCount={availabilities.length} />
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mb-6">
              <ShareableLink url={eventUrl} />
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Availability Heatmap
                </h2>
                {availabilities.length === 0 && (
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Waiting for responses...
                  </div>
                )}
              </div>

              {availabilities.length > 0 ? (
                <>
                  <AvailabilityHeatmap timeSlots={timeSlots} heatmapData={heatmapData} />
                  <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-sm text-indigo-900">
                      <strong>Tip:</strong> Hover over any time slot to see who is available. Times marked with ⭐ are the top 3 most popular slots.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">No responses yet</p>
                  <p className="text-sm mb-4">
                    Share the link above to start collecting availability
                  </p>
                  <Link href={`/event/${eventId}`}>
                    <Button>Be the first to respond</Button>
                  </Link>
                </div>
              )}
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <ParticipantList availabilities={availabilities} eventId={eventId} />
            </div>
          </FadeIn>
        </div>
      </main>
    </div>
  );
}
