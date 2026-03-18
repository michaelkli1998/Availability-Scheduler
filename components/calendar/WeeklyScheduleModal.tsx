'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TimeSlot } from '@/types/event';
import { formatTime12Hour } from '@/lib/utils/date';
import Button from '@/components/ui/Button';

interface WeeklyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeSlots: TimeSlot[];
  onApply: (selectedSlots: string[]) => void;
}

export default function WeeklyScheduleModal({
  isOpen,
  onClose,
  timeSlots,
  onApply,
}: WeeklyScheduleModalProps) {
  const [weeklyPattern, setWeeklyPattern] = useState<Record<number, Set<string>>>({
    0: new Set(), // Sunday
    1: new Set(), // Monday
    2: new Set(), // Tuesday
    3: new Set(), // Wednesday
    4: new Set(), // Thursday
    5: new Set(), // Friday
    6: new Set(), // Saturday
  });

  // Get unique times from the time slots
  const uniqueTimes = Array.from(
    new Set(timeSlots.map((slot) => `${slot.startTime}-${slot.endTime}`))
  ).sort();

  // Get a sample week to display (first occurrence of each weekday)
  const sampleWeek: Record<number, TimeSlot[]> = {};
  timeSlots.forEach((slot) => {
    const date = new Date(slot.date);
    const dayOfWeek = date.getDay();
    if (!sampleWeek[dayOfWeek]) {
      sampleWeek[dayOfWeek] = [];
    }
    // Only add if this time isn't already in the sample
    const timeKey = `${slot.startTime}-${slot.endTime}`;
    if (!sampleWeek[dayOfWeek].some((s) => `${s.startTime}-${s.endTime}` === timeKey)) {
      sampleWeek[dayOfWeek].push(slot);
    }
  });

  // Sort times for each day
  Object.keys(sampleWeek).forEach((day) => {
    sampleWeek[parseInt(day)].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleTime = (dayOfWeek: number, timeKey: string) => {
    setWeeklyPattern((prev) => {
      const newPattern = { ...prev };
      const daySet = new Set(prev[dayOfWeek]);
      if (daySet.has(timeKey)) {
        daySet.delete(timeKey);
      } else {
        daySet.add(timeKey);
      }
      newPattern[dayOfWeek] = daySet;
      return newPattern;
    });
  };

  const handleApply = () => {
    // Find all slots that match the weekly pattern
    const selectedSlotIds: string[] = [];

    timeSlots.forEach((slot) => {
      const date = new Date(slot.date);
      const dayOfWeek = date.getDay();
      const timeKey = `${slot.startTime}-${slot.endTime}`;

      if (weeklyPattern[dayOfWeek]?.has(timeKey)) {
        selectedSlotIds.push(slot.id);
      }
    });

    onApply(selectedSlotIds);
    onClose();
  };

  const clearPattern = () => {
    setWeeklyPattern({
      0: new Set(),
      1: new Set(),
      2: new Set(),
      3: new Set(),
      4: new Set(),
      5: new Set(),
      6: new Set(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Set Weekly Schedule</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select your availability for each day of the week
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-7 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
              <div key={dayOfWeek} className="flex flex-col">
                <div className="text-center font-semibold text-gray-900 mb-2 py-2 bg-gray-50 rounded">
                  {dayNames[dayOfWeek]}
                </div>
                <div className="space-y-1">
                  {sampleWeek[dayOfWeek]?.map((slot) => {
                    const timeKey = `${slot.startTime}-${slot.endTime}`;
                    const isSelected = weeklyPattern[dayOfWeek]?.has(timeKey);

                    return (
                      <button
                        key={timeKey}
                        onClick={() => toggleTime(dayOfWeek, timeKey)}
                        className={`
                          w-full px-2 py-1.5 text-xs rounded transition-colors
                          ${
                            isSelected
                              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        {formatTime12Hour(slot.startTime)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={clearPattern}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear All
          </button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply to All Weeks
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
