'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimeSlot, HeatmapData } from '@/types/event';
import { formatDate, formatTime12Hour } from '@/lib/utils/date';
import { getColorIntensity } from '@/lib/utils/heatmap';

interface AvailabilityHeatmapProps {
  timeSlots: TimeSlot[];
  heatmapData: HeatmapData[];
}

export default function AvailabilityHeatmap({
  timeSlots,
  heatmapData,
}: AvailabilityHeatmapProps) {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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

  const getSlotData = (slotId: string): HeatmapData | undefined => {
    return heatmapData.find((data) => data.slotId === slotId);
  };

  const handleMouseEnter = (slotId: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setHoveredSlot(slotId);
  };

  const handleMouseLeave = () => {
    setHoveredSlot(null);
  };

  const hoveredSlotData = hoveredSlot ? getSlotData(hoveredSlot) : null;

  return (
    <div className="relative" onMouseLeave={handleMouseLeave}>
      <div className="overflow-x-auto">
        <div className="w-max border border-gray-300">
          {/* Header with dates */}
          <div className="flex bg-gray-50 sticky top-0 z-10 border-b border-gray-300">
            <div className="w-28 flex-shrink-0 p-2 border-r border-gray-300">
              <span className="text-xs font-semibold text-gray-600">Time</span>
            </div>
            {dates.map((date) => (
              <div
                key={date}
                className="w-16 flex-shrink-0 p-2 text-center border-r border-gray-300 last:border-r-0"
              >
                <span className="text-xs font-semibold text-gray-900">
                  {formatDate(date)}
                </span>
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div>
            {times.map((timeSlot, timeIndex) => (
              <div key={timeIndex} className="flex border-b border-gray-300 last:border-b-0">
                <div className="w-28 h-8 flex-shrink-0 flex items-center px-2 border-r border-gray-300 bg-gray-50">
                  <span className="text-xs text-gray-600">{formatTime12Hour(timeSlot.startTime)}</span>
                </div>
                {dates.map((date) => {
                  const slot = slotsByDate[date][timeIndex];
                  const slotData = getSlotData(slot.id);

                  return (
                    <div
                      key={slot.id}
                      data-slot-id={slot.id}
                      className={`
                        w-16 h-8 flex-shrink-0
                        flex items-center justify-center
                        transition-all cursor-pointer relative
                        border-r border-gray-300 last:border-r-0
                        ${getColorIntensity(slotData?.percentage || 0)}
                      `}
                      onMouseEnter={(e) => handleMouseEnter(slot.id, e)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <span className="text-xs font-semibold">
                        {slotData?.count || 0}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredSlotData && (
        <div
          className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs pointer-events-none transition-opacity duration-100"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-semibold mb-1">
            {hoveredSlotData.count} {hoveredSlotData.count === 1 ? 'person' : 'people'}{' '}
            available ({Math.round(hoveredSlotData.percentage)}%)
          </div>
          {hoveredSlotData.participants.length > 0 && (
            <div className="text-xs text-gray-300">
              {hoveredSlotData.participants.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded"></div>
          <span className="text-sm text-gray-600">0%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-100 border border-gray-300 rounded"></div>
          <span className="text-sm text-gray-600">25%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-300 border border-gray-300 rounded"></div>
          <span className="text-sm text-gray-600">50%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-500 border border-gray-300 rounded"></div>
          <span className="text-sm text-gray-600">75%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-700 border border-gray-300 rounded"></div>
          <span className="text-sm text-gray-600">100%</span>
        </div>
      </div>
    </div>
  );
}
