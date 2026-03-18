'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import { createEvent } from '@/lib/firebase/firestore';
import { EventFormData } from '@/types/event';
import { generateTimeSlots } from '@/lib/utils/date';
import { getResultsUrl } from '@/lib/utils/url';
import EventForm from '@/components/event/EventForm';
import FadeIn from '@/components/animations/FadeIn';
import toast from 'react-hot-toast';

export default function CreateEventPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (formData: EventFormData) => {
    setIsCreating(true);

    console.log('Creating event with data:', formData);

    try {
      // Create event in Firestore
      const eventId = await createEvent(formData);

      console.log('Event created with ID:', eventId);

      // Show success message
      toast.success('Event created successfully!');

      // Redirect to results page
      router.push(`/event/${eventId}/results`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Scheduler</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <FadeIn>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Event
            </h1>
            <p className="text-gray-600 mb-8">
              Set up your scheduling poll and share it with participants
            </p>

            <EventForm onSubmit={handleSubmit} isSubmitting={isCreating} />
          </div>
        </FadeIn>
      </main>
    </div>
  );
}
