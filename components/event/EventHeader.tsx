'use client';

import { Event } from '@/types/event';
import { Users } from 'lucide-react';
import { format } from 'date-fns';

interface EventHeaderProps {
  event: Event;
  participantCount: number;
}

export default function EventHeader({ event, participantCount }: EventHeaderProps) {
  const startDate = event.dateRange.start.toDate();
  const endDate = event.dateRange.end.toDate();

  // Normalize to local midnight to get the intended date without timezone offset
  const normalizeDate = (date: Date) => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0, 0, 0, 0
    );
  };

  const normalizedStart = normalizeDate(startDate);
  const normalizedEnd = normalizeDate(endDate);

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
      {event.description && (
        <p className="text-gray-600 mb-3">{event.description}</p>
      )}
      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
        <div>
          <span className="font-medium">Organized by:</span> {event.organizerName}
        </div>
        <div>
          <span className="font-medium">Dates:</span>{' '}
          {format(normalizedStart, 'MMM d')} - {format(normalizedEnd, 'MMM d, yyyy')}
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>
            {participantCount} {participantCount === 1 ? 'response' : 'responses'}
          </span>
        </div>
      </div>
    </div>
  );
}
