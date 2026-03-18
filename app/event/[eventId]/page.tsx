'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { useEvent } from '@/lib/hooks/useEvent';
import { useAvailabilities } from '@/lib/hooks/useAvailability';
import { submitAvailability, updateAvailability, findAvailabilityByName } from '@/lib/firebase/firestore';
import { generateTimeSlots } from '@/lib/utils/date';
import { TimeSlot } from '@/types/event';
import EventHeader from '@/components/event/EventHeader';
import TimeSlotGrid from '@/components/calendar/TimeSlotGrid';
import QuickSelectButtons from '@/components/calendar/QuickSelectButtons';
import SelectionSummary from '@/components/calendar/SelectionSummary';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FadeIn from '@/components/animations/FadeIn';
import toast from 'react-hot-toast';

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const { event, loading: eventLoading, error: eventError } = useEvent(eventId);
  const { availabilities, loading: availabilitiesLoading } = useAvailabilities(eventId);

  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [participantName, setParticipantName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [existingSubmissionId, setExistingSubmissionId] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);

  useEffect(() => {
    if (event) {
      console.log('Event loaded:', event);

      try {
        // Check if dateRange exists and has the required properties
        if (!event.dateRange || !event.dateRange.start || !event.dateRange.end) {
          console.error('Event missing dateRange:', event);
          toast.error('Event data is incomplete');
          return;
        }

        // Check if settings exist
        if (!event.settings) {
          console.error('Event missing settings:', event);
          toast.error('Event settings are missing');
          return;
        }

        const startDate = event.dateRange.start.toDate();
        const endDate = event.dateRange.end.toDate();

        console.log('Date range:', { start: startDate, end: endDate });
        console.log('Settings:', event.settings);

        const slots = generateTimeSlots(
          startDate,
          endDate,
          event.settings.startTime,
          event.settings.endTime,
          event.settings.intervalMinutes
        );

        console.log('Generated time slots:', slots.length);
        if (slots.length > 0) {
          console.log('First 3 slots:', slots.slice(0, 3));
        } else {
          console.error('No time slots generated!');
        }

        setTimeSlots(slots);
      } catch (error) {
        console.error('Error generating time slots:', error);
        toast.error('Failed to generate time slots');
      }
    } else {
      console.log('Event is null or undefined');
    }
  }, [event]);

  // Check for existing submission when name changes
  useEffect(() => {
    if (!participantName.trim() || participantName.length < 2) {
      setExistingSubmissionId(null);
      return;
    }

    const checkExisting = async () => {
      setIsCheckingName(true);
      try {
        const existing = await findAvailabilityByName(eventId, participantName.trim());
        if (existing) {
          setExistingSubmissionId(existing.id);
          setSelectedSlots(existing.selectedSlots);
          toast.success('Found your previous submission! You can update it now.', {
            duration: 4000,
          });
        } else {
          setExistingSubmissionId(null);
        }
      } catch (error) {
        console.error('Error checking for existing submission:', error);
      } finally {
        setIsCheckingName(false);
      }
    };

    // Debounce the check
    const timeoutId = setTimeout(checkExisting, 500);
    return () => clearTimeout(timeoutId);
  }, [participantName, eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!participantName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (selectedSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingSubmissionId) {
        // Update existing submission
        await updateAvailability(existingSubmissionId, selectedSlots);
        toast.success('Your availability has been updated!');
      } else {
        // Create new submission
        await submitAvailability(eventId, participantName.trim(), selectedSlots);
        toast.success('Your availability has been submitted!');
      }

      // Redirect to results page after a short delay
      setTimeout(() => {
        router.push(`/event/${eventId}/results`);
      }, 1000);
    } catch (error) {
      console.error('Error submitting availability:', error);
      toast.error('Failed to submit availability. Please try again.');
      setIsSubmitting(false);
    }
  };

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
            <Link href={`/event/${eventId}/results`}>
              <Button variant="ghost" size="sm">
                View Results
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Select Your Availability
              </h2>

              {timeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">Loading time slots...</p>
                  {event && (
                    <p className="text-sm text-gray-400">
                      Event settings: {event.settings.startTime} - {event.settings.endTime}, {event.settings.intervalMinutes} min intervals
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <QuickSelectButtons
                    timeSlots={timeSlots}
                    selectedSlots={selectedSlots}
                    onSelectionChange={setSelectedSlots}
                  />

                  <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-2">
                      Click or drag to select • Click date headers to select entire day
                    </div>
                    <TimeSlotGrid
                      timeSlots={timeSlots}
                      selectedSlots={selectedSlots}
                      onSelectionChange={setSelectedSlots}
                    />
                  </div>

                  {selectedSlots.length > 0 && (
                    <div className="mb-6">
                      <SelectionSummary
                        timeSlots={timeSlots}
                        selectedSlots={selectedSlots}
                      />
                    </div>
                  )}
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    label="Your Name"
                    placeholder="Enter your name"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    required
                  />
                  {isCheckingName && (
                    <p className="mt-1 text-xs text-gray-500">Checking for existing submission...</p>
                  )}
                  {existingSubmissionId && (
                    <p className="mt-1 text-xs text-indigo-600">
                      ✓ Editing your previous submission
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    isLoading={isSubmitting}
                  >
                    {existingSubmissionId ? 'Update Availability' : 'Submit Availability'}
                  </Button>
                  <Link href={`/event/${eventId}/results`} className="flex-1">
                    <Button type="button" variant="secondary" size="lg" className="w-full">
                      View Results
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          </FadeIn>
        </div>
      </main>
    </div>
  );
}
