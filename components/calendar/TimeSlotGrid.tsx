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
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isLongPressMode, setIsLongPressMode] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const touchedSlotId = useRef<string | null>(null);
  const dragStartCell = useRef<{ dateIndex: number; timeIndex: number } | null>(null);
  const initialSelectedSlots = useRef<string[]>([]);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  console.log('TimeSlotGrid received slots:', timeSlots.length);

  // Detect if device supports touch
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

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

  // Cleanup scroll interval and long press timer on unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        window.clearInterval(scrollIntervalRef.current);
      }
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Add non-passive touch event listeners to prevent scrolling during drag
  useEffect(() => {
    const gridElement = gridRef.current;
    if (!gridElement) return;

    const handleTouchMoveNonPassive = (e: TouchEvent) => {
      if (isLongPressMode) {
        e.preventDefault(); // Prevent scrolling but allow event to bubble
      }
    };

    // Add listener to grid container
    gridElement.addEventListener('touchmove', handleTouchMoveNonPassive, { passive: false });

    // Also add to document to catch all touch events
    document.addEventListener('touchmove', handleTouchMoveNonPassive, { passive: false });

    return () => {
      gridElement.removeEventListener('touchmove', handleTouchMoveNonPassive);
      document.removeEventListener('touchmove', handleTouchMoveNonPassive);
    };
  }, [isLongPressMode]);

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

  const handleMouseDown = (slotId: string, dateIndex: number, timeIndex: number) => {
    if (readOnly) return;

    setIsSelecting(true);
    dragStartCell.current = { dateIndex, timeIndex };
    initialSelectedSlots.current = [...selectedSlots];
    const isSelected = selectedSlots.includes(slotId);
    setSelectionMode(isSelected ? 'remove' : 'add');
    toggleSlot(slotId);
  };

  const handleMouseEnter = (slotId: string, dateIndex: number, timeIndex: number) => {
    if (!isSelecting || readOnly || !dragStartCell.current) return;

    // Calculate rectangular selection
    const startDateIdx = dragStartCell.current.dateIndex;
    const startTimeIdx = dragStartCell.current.timeIndex;
    const endDateIdx = dateIndex;
    const endTimeIdx = timeIndex;

    // Get min/max to support dragging in any direction
    const minDateIdx = Math.min(startDateIdx, endDateIdx);
    const maxDateIdx = Math.max(startDateIdx, endDateIdx);
    const minTimeIdx = Math.min(startTimeIdx, endTimeIdx);
    const maxTimeIdx = Math.max(startTimeIdx, endTimeIdx);

    // Collect all slot IDs in the rectangle
    const rectangleSlotIds: string[] = [];
    for (let tIdx = minTimeIdx; tIdx <= maxTimeIdx; tIdx++) {
      for (let dIdx = minDateIdx; dIdx <= maxDateIdx; dIdx++) {
        const date = dates[dIdx];
        const slot = slotsByDate[date][tIdx];
        if (slot) {
          rectangleSlotIds.push(slot.id);
        }
      }
    }

    // Apply selection mode to the rectangle
    if (selectionMode === 'add') {
      // Add all slots in rectangle that aren't already in initial selection
      const newSelection = [...initialSelectedSlots.current];
      rectangleSlotIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      onSelectionChange(newSelection);
    } else {
      // Remove all slots in rectangle from initial selection
      const newSelection = initialSelectedSlots.current.filter(
        id => !rectangleSlotIds.includes(id)
      );
      onSelectionChange(newSelection);
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
    dragStartCell.current = null;
    initialSelectedSlots.current = [];
    if (scrollIntervalRef.current) {
      window.clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, slotId: string, dateIndex: number, timeIndex: number) => {
    if (readOnly) return;

    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    touchedSlotId.current = slotId;

    if (isTouchDevice) {
      // Prevent mouse events from firing after touch events
      e.preventDefault();

      // Start long press timer (500ms)
      longPressTimer.current = setTimeout(() => {
        setIsLongPressMode(true);
        setIsSelecting(true);
        dragStartCell.current = { dateIndex, timeIndex };
        initialSelectedSlots.current = [...selectedSlots];
        const isSelected = selectedSlots.includes(slotId);
        setSelectionMode(isSelected ? 'remove' : 'add');
        toggleSlot(slotId);

        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 500);
    } else {
      // On non-touch devices (e.g., stylus), enable drag selection
      setIsSelecting(true);
      const isSelected = selectedSlots.includes(slotId);
      setSelectionMode(isSelected ? 'remove' : 'add');
      toggleSlot(slotId);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSelecting || readOnly) return;

    // Allow touch move only in long press mode
    if (isTouchDevice && !isLongPressMode) {
      // Clear long press timer if user moves finger (not a long press, just scrolling)
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      return;
    }

    // Prevent scrolling when in long press mode
    if (isLongPressMode) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.hasAttribute('data-slot-id')) {
      const slotId = element.getAttribute('data-slot-id');
      const dateIndexStr = element.getAttribute('data-date-index');
      const timeIndexStr = element.getAttribute('data-time-index');

      if (slotId && dateIndexStr && timeIndexStr) {
        const dateIndex = parseInt(dateIndexStr);
        const timeIndex = parseInt(timeIndexStr);

        // Use rectangular selection logic like mouse drag
        if (dragStartCell.current) {
          const startDateIdx = dragStartCell.current.dateIndex;
          const startTimeIdx = dragStartCell.current.timeIndex;

          const minDateIdx = Math.min(startDateIdx, dateIndex);
          const maxDateIdx = Math.max(startDateIdx, dateIndex);
          const minTimeIdx = Math.min(startTimeIdx, timeIndex);
          const maxTimeIdx = Math.max(startTimeIdx, timeIndex);

          const rectangleSlotIds: string[] = [];
          for (let tIdx = minTimeIdx; tIdx <= maxTimeIdx; tIdx++) {
            for (let dIdx = minDateIdx; dIdx <= maxDateIdx; dIdx++) {
              const date = dates[dIdx];
              const slot = slotsByDate[date][tIdx];
              if (slot) {
                rectangleSlotIds.push(slot.id);
              }
            }
          }

          if (selectionMode === 'add') {
            const newSelection = [...initialSelectedSlots.current];
            rectangleSlotIds.forEach(id => {
              if (!newSelection.includes(id)) {
                newSelection.push(id);
              }
            });
            onSelectionChange(newSelection);
          } else {
            const newSelection = initialSelectedSlots.current.filter(
              id => !rectangleSlotIds.includes(id)
            );
            onSelectionChange(newSelection);
          }
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isTouchDevice && touchStartPos.current && touchedSlotId.current) {
      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

      // If touch didn't move much (less than 10px) and not in long press mode, treat it as a tap
      if (deltaX < 10 && deltaY < 10 && !isLongPressMode) {
        e.preventDefault(); // Prevent mouse events from firing
        toggleSlot(touchedSlotId.current);
      }
    }

    if (!isTouchDevice) {
      setIsSelecting(false);
    }

    // Reset long press mode and drag state
    setIsLongPressMode(false);
    setIsSelecting(false);
    dragStartCell.current = null;
    initialSelectedSlots.current = [];
    touchStartPos.current = null;
    touchedSlotId.current = null;
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
    <div>
      {/* Mobile-only instructions */}
      {!readOnly && isTouchDevice && (
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-sm text-indigo-900">
            <strong>Tip:</strong> Tap to select individual slots, or <strong>long press and drag</strong> to select multiple slots at once
          </p>
        </div>
      )}

      {/* Selection mode indicator */}
      {isLongPressMode && (
        <div className="mb-2 p-2 bg-green-100 border-2 border-green-500 rounded-lg text-center animate-pulse">
          <p className="text-sm font-semibold text-green-900">
            ✓ Selection Mode Active - Drag to select
          </p>
        </div>
      )}

      <div
        ref={gridRef}
        className="overflow-x-auto"
        style={{ touchAction: isLongPressMode ? 'none' : 'auto' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      <div className="min-w-max border border-gray-300">
        {/* Header with dates */}
        <div className="flex bg-gray-50 sticky top-0 z-10 border-b border-gray-300">
          <div className="w-28 flex-shrink-0 p-2 border-r border-gray-300 sticky left-0 z-20 bg-gray-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
            <span className="text-xs font-semibold text-gray-600">Time</span>
          </div>
          {dates.map((date, dateIndex) => {
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
              <div className="w-28 h-8 flex-shrink-0 flex items-center px-2 border-r border-gray-300 bg-gray-50 sticky left-0 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                <span className="text-xs text-gray-600">
                  {formatTime12Hour(timeSlot.startTime)}
                </span>
              </div>
              {dates.map((date, dateIndex) => {
                const slot = slotsByDate[date][timeIndex];
                const isSelected = selectedSlots.includes(slot.id);

                return (
                  <motion.div
                    key={slot.id}
                    data-slot-id={slot.id}
                    data-date-index={dateIndex}
                    data-time-index={timeIndex}
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
                    style={{ touchAction: readOnly || isTouchDevice ? 'auto' : 'none' }}
                    onMouseDown={() => handleMouseDown(slot.id, dateIndex, timeIndex)}
                    onMouseEnter={() => handleMouseEnter(slot.id, dateIndex, timeIndex)}
                    onTouchStart={(e) => handleTouchStart(e, slot.id, dateIndex, timeIndex)}
                    onTouchEnd={handleTouchEnd}
                    whileHover={readOnly ? {} : { scale: 1.02 }}
                    whileTap={readOnly ? {} : { scale: 0.98 }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop instructions */}
      {!readOnly && !isTouchDevice && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Click or drag to select your available time slots
        </div>
      )}
      </div>
    </div>
  );
}
