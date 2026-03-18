'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TimeSlot } from '@/types/event';
import { formatDate, formatTime12Hour } from '@/lib/utils/date';

interface TimeSlotGridProps {
  timeSlots: TimeSlot[];
  selectedSlots: string[];
  onSelectionChange: (selectedSlots: string[]) => void;
  readOnly?: boolean;
}

export default function TimeSlotGrid({
  timeSlots,
  selectedSlots,
  onSelectionChange,
  readOnly = false,
}: TimeSlotGridProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'add' | 'remove'>('add');
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  console.log('TimeSlotGrid received slots:', timeSlots.length);

  // Group slots by date
  const slotsByDate = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const dates = Object.keys(slotsByDate).sort();
  const times = slotsByDate[dates[0]] || [];

  console.log('TimeSlotGrid dates:', dates);
  console.log('TimeSlotGrid times per day:', times.length);

  // Cleanup scroll interval on unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        window.clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  const toggleSlot = useCallback(
    (slotId: string) => {
      if (readOnly) return;

      const isSelected = selectedSlots.includes(slotId);
      if (isSelected) {
        onSelectionChange(selectedSlots.filter((id) => id !== slotId));
      } else {
        onSelectionChange([...selectedSlots, slotId]);
      }
    },
    [selectedSlots, onSelectionChange, readOnly]
  );

  const handleMouseDown = (slotId: string) => {
    if (readOnly) return;

    setIsSelecting(true);
    const isSelected = selectedSlots.includes(slotId);
    setSelectionMode(isSelected ? 'remove' : 'add');
    toggleSlot(slotId);
  };

  const handleMouseEnter = (slotId: string) => {
    if (!isSelecting || readOnly) return;

    const isSelected = selectedSlots.includes(slotId);
    if (selectionMode === 'add' && !isSelected) {
      onSelectionChange([...selectedSlots, slotId]);
    } else if (selectionMode === 'remove' && isSelected) {
      onSelectionChange(selectedSlots.filter((id) => id !== slotId));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !gridRef.current) return;

    const container = gridRef.current;
    const rect = container.getBoundingClientRect();
    const scrollEdgeSize = 100; // pixels from edge to trigger scroll
    const scrollSpeed = 15; // Increased from 10 for faster scrolling

    // Check if mouse is near the edges
    const distanceFromLeft = e.clientX - rect.left;
    const distanceFromRight = rect.right - e.clientX;

    // Clear existing scroll interval
    if (scrollIntervalRef.current) {
      window.clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    // Scroll left
    if (distanceFromLeft < scrollEdgeSize) {
      scrollIntervalRef.current = window.setInterval(() => {
        if (container.scrollLeft > 0) {
          container.scrollLeft = Math.max(0, container.scrollLeft - scrollSpeed);
        } else {
          // Reached the start, clear interval
          if (scrollIntervalRef.current) {
            window.clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
          }
        }
      }, 16);
    }
    // Scroll right
    else if (distanceFromRight < scrollEdgeSize) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      scrollIntervalRef.current = window.setInterval(() => {
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft < maxScroll) {
          container.scrollLeft += scrollSpeed;
        } else {
          // Reached the end, clear interval
          if (scrollIntervalRef.current) {
            window.clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
          }
        }
      }, 16);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    if (scrollIntervalRef.current) {
      window.clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = (slotId: string) => {
    if (readOnly) return;
    setIsSelecting(true);
    const isSelected = selectedSlots.includes(slotId);
    setSelectionMode(isSelected ? 'remove' : 'add');
    toggleSlot(slotId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSelecting || readOnly) return;
    e.preventDefault(); // Prevent scrolling while selecting

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.hasAttribute('data-slot-id')) {
      const slotId = element.getAttribute('data-slot-id');
      if (slotId) {
        const isSelected = selectedSlots.includes(slotId);
        if (selectionMode === 'add' && !isSelected) {
          onSelectionChange([...selectedSlots, slotId]);
        } else if (selectionMode === 'remove' && isSelected) {
          onSelectionChange(selectedSlots.filter((id) => id !== slotId));
        }
      }
    }
  };

  const handleTouchEnd = () => {
    setIsSelecting(false);
  };

  const handleDateHeaderClick = (date: string) => {
    if (readOnly) return;

    // Get all slots for this date
    const slotsForDate = slotsByDate[date] || [];
    const slotIdsForDate = slotsForDate.map((slot) => slot.id);

    // Check if any slots for this date are selected
    const hasSelectedSlots = slotIdsForDate.some((id) => selectedSlots.includes(id));

    if (hasSelectedSlots) {
      // Deselect all slots for this date
      onSelectionChange(selectedSlots.filter((id) => !slotIdsForDate.includes(id)));
    } else {
      // Select all slots for this date
      onSelectionChange([...selectedSlots, ...slotIdsForDate]);
    }
  };

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No time slots available. Please check the event configuration.</p>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="overflow-x-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="min-w-max border border-gray-300">
        {/* Header with dates */}
        <div className="flex bg-gray-50 sticky top-0 z-10 border-b border-gray-300">
          <div className="w-28 flex-shrink-0 p-2 border-r border-gray-300">
            <span className="text-xs font-semibold text-gray-600">Time</span>
          </div>
          {dates.map((date) => {
            const slotsForDate = slotsByDate[date] || [];
            const slotIdsForDate = slotsForDate.map((slot) => slot.id);
            const hasSelectedSlots = slotIdsForDate.some((id) => selectedSlots.includes(id));
            const allSelected = slotIdsForDate.length > 0 && slotIdsForDate.every((id) => selectedSlots.includes(id));

            return (
              <div
                key={date}
                onClick={() => handleDateHeaderClick(date)}
                className={`
                  w-16 flex-shrink-0 p-2 text-center border-r border-gray-300 last:border-r-0
                  ${!readOnly ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}
                  ${allSelected ? 'bg-indigo-100' : hasSelectedSlots ? 'bg-indigo-50' : ''}
                `}
                title={readOnly ? '' : 'Click to select/deselect entire day'}
              >
                <span className={`text-xs font-semibold ${allSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                  {formatDate(date)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time slots grid */}
        <div>
          {times.map((timeSlot, timeIndex) => (
            <div key={timeIndex} className="flex border-b border-gray-300 last:border-b-0">
              <div className="w-28 h-8 flex-shrink-0 flex items-center px-2 border-r border-gray-300 bg-gray-50">
                <span className="text-xs text-gray-600">
                  {formatTime12Hour(timeSlot.startTime)}
                </span>
              </div>
              {dates.map((date) => {
                const slot = slotsByDate[date][timeIndex];
                const isSelected = selectedSlots.includes(slot.id);

                return (
                  <motion.div
                    key={slot.id}
                    data-slot-id={slot.id}
                    className={`
                      w-16 h-8 flex-shrink-0 cursor-pointer
                      select-none transition-colors
                      border-r border-gray-300 last:border-r-0
                      ${
                        isSelected
                          ? 'bg-indigo-500 hover:bg-indigo-600'
                          : 'bg-white hover:bg-indigo-50'
                      }
                      ${readOnly ? 'cursor-default' : ''}
                    `}
                    onMouseDown={() => handleMouseDown(slot.id)}
                    onMouseEnter={() => handleMouseEnter(slot.id)}
                    onTouchStart={() => handleTouchStart(slot.id)}
                    whileHover={readOnly ? {} : { scale: 1.02 }}
                    whileTap={readOnly ? {} : { scale: 0.98 }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      {!readOnly && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Click or drag to select your available time slots
        </div>
      )}
    </div>
  );
}
