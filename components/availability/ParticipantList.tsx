'use client';

import { Availability } from '@/types/event';
import { formatDistanceToNow } from 'date-fns';
import { User, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ParticipantListProps {
  availabilities: Availability[];
  eventId?: string;
}

export default function ParticipantList({ availabilities, eventId }: ParticipantListProps) {
  const router = useRouter();
  if (availabilities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <p>No responses yet. Be the first to submit your availability!</p>
      </div>
    );
  }

  // Sort by submission time (most recent first)
  const sortedAvailabilities = [...availabilities].sort(
    (a, b) => b.submittedAt.toMillis() - a.submittedAt.toMillis()
  );

  const handleEditClick = (participantName: string) => {
    if (eventId) {
      // Navigate to event page with name as query param
      router.push(`/event/${eventId}?name=${encodeURIComponent(participantName)}`);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Participants ({availabilities.length})
      </h3>
      <div className="space-y-2">
        {sortedAvailabilities.map((availability) => (
          <div
            key={availability.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {availability.participantName}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(availability.submittedAt.toDate(), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
            {eventId && (
              <button
                onClick={() => handleEditClick(availability.participantName)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                title="Edit schedule"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span className="font-medium">Edit</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
