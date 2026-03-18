'use client';

import { TimeSlot } from '@/types/event';
import { formatDate, formatTime12Hour } from '@/lib/utils/date';

interface SelectionSummaryProps {
  timeSlots: TimeSlot[];
  selectedSlots: string[];
}

export default function SelectionSummary({ timeSlots, selectedSlots }: SelectionSummaryProps) {
  if (selectedSlots.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">No time slots selected yet</p>
      </div>
    );
  }

  // Group by date
  const selectedByDate: { [date: string]: TimeSlot[] } = {};
  timeSlots.forEach((slot) => {
    if (selectedSlots.includes(slot.id)) {
      if (!selectedByDate[slot.date]) {
        selectedByDate[slot.date] = [];
      }
      selectedByDate[slot.date].push(slot);
    }
  });

  // Sort dates
  const dates = Object.keys(selectedByDate).sort();

  // Group consecutive slots into ranges
  const getRanges = (slots: TimeSlot[]) => {
    if (slots.length === 0) return [];

    const sorted = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const ranges: { start: string; end: string }[] = [];
    let currentRange = { start: sorted[0].startTime, end: sorted[0].endTime };

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].startTime === currentRange.end) {
        // Consecutive slot, extend range
        currentRange.end = sorted[i].endTime;
      } else {
        // Gap, save current range and start new one
        ranges.push({ ...currentRange });
        currentRange = { start: sorted[i].startTime, end: sorted[i].endTime };
      }
    }
    ranges.push(currentRange);

    return ranges;
  };

  return (
    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
      <h3 className="text-sm font-semibold text-indigo-900 mb-2">
        Your Availability Summary
      </h3>
      <div className="space-y-2">
        {dates.map((date) => {
          const ranges = getRanges(selectedByDate[date]);
          return (
            <div key={date} className="text-sm">
              <span className="font-medium text-indigo-800">{formatDate(date)}:</span>{' '}
              <span className="text-indigo-700">
                {ranges.map((range, i) => (
                  <span key={i}>
                    {i > 0 && ', '}
                    {formatTime12Hour(range.start)} - {formatTime12Hour(range.end)}
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-indigo-300">
        <p className="text-xs text-indigo-700">
          Total: {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} selected
        </p>
      </div>
    </div>
  );
}
