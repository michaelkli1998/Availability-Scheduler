'use client';

import { BestMeetingTime as BestMeetingTimeType } from '@/lib/utils/heatmap';
import { formatDate, formatTime12Hour } from '@/lib/utils/date';
import { Clock, Users, Calendar, Star } from 'lucide-react';

interface BestMeetingTimeProps {
  bestTimes: BestMeetingTimeType[];
}

export default function BestMeetingTime({ bestTimes }: BestMeetingTimeProps) {
  if (!bestTimes || bestTimes.length === 0) {
    return null;
  }

  const formatDuration = (consecutiveDuration: number) => {
    const slotDurationMinutes = 30;
    const totalDurationMinutes = consecutiveDuration * slotDurationMinutes;
    const hours = Math.floor(totalDurationMinutes / 60);
    const minutes = totalDurationMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} min`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Star className="h-5 w-5 text-white fill-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Best Meeting Times
          </h3>
          <p className="text-sm text-gray-600">
            Top {bestTimes.length} {bestTimes.length === 1 ? 'suggestion' : 'suggestions'} based on availability and duration
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {bestTimes.map((bestTime, index) => {
          const { slot, count, percentage, participants, consecutiveDuration } = bestTime;

          return (
            <div
              key={slot.id}
              className={`p-4 rounded-lg border-2 ${
                index === 0
                  ? 'bg-white border-indigo-400'
                  : 'bg-white/50 border-indigo-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">
                      BEST
                    </span>
                  )}
                  {index === 1 && (
                    <span className="text-xs font-semibold text-indigo-600">
                      2nd Best
                    </span>
                  )}
                  {index === 2 && (
                    <span className="text-xs font-semibold text-indigo-600">
                      3rd Best
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {count} people ({Math.round(percentage)}%)
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDuration(consecutiveDuration)} available
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-900 mb-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span className="font-semibold">
                  {formatDate(slot.date)} at {formatTime12Hour(slot.startTime)}
                </span>
              </div>

              {participants.length > 0 && participants.length <= 8 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {participants.map((name, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-indigo-100 rounded-full text-indigo-700"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
              {participants.length > 8 && (
                <p className="text-xs text-gray-600 mt-2">
                  {participants.slice(0, 5).join(', ')} +{participants.length - 5} more
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
