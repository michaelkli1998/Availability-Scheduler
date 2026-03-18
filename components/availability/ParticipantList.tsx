'use client';

import { Availability } from '@/types/event';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';

interface ParticipantListProps {
  availabilities: Availability[];
}

export default function ParticipantList({ availabilities }: ParticipantListProps) {
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
                  {availability.selectedSlots.length}{' '}
                  {availability.selectedSlots.length === 1 ? 'slot' : 'slots'} selected
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {formatDistanceToNow(availability.submittedAt.toDate(), {
                addSuffix: true,
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
