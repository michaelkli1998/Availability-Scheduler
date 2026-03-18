'use client';

import { Availability } from '@/types/event';
import { Edit2 } from 'lucide-react';

interface ParticipantsListProps {
  availabilities: Availability[];
  onEditClick: (participantName: string) => void;
}

export default function ParticipantsList({
  availabilities,
  onEditClick,
}: ParticipantsListProps) {
  if (availabilities.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Responses ({availabilities.length})
      </h3>
      <div className="space-y-2">
        {availabilities.map((availability) => (
          <div
            key={availability.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span className="text-gray-900 font-medium">{availability.participantName}</span>
            <button
              onClick={() => onEditClick(availability.participantName)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span className="font-medium">Edit</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
