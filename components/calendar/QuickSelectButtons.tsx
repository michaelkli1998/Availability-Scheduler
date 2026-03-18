'use client';

import { TimeSlot } from '@/types/event';
import Button from '@/components/ui/Button';

interface QuickSelectButtonsProps {
  timeSlots: TimeSlot[];
  selectedSlots: string[];
  onSelectionChange: (slots: string[]) => void;
}

export default function QuickSelectButtons({
  timeSlots,
  selectedSlots,
  onSelectionChange,
}: QuickSelectButtonsProps) {
  const selectAll = () => {
    onSelectionChange(timeSlots.map((slot) => slot.id));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const selectWorkingHours = () => {
    // Select 9 AM - 5 PM
    const workingSlots = timeSlots.filter((slot) => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      return hour >= 9 && hour < 17;
    });
    onSelectionChange(workingSlots.map((slot) => slot.id));
  };

  const selectMornings = () => {
    // Select before noon
    const morningSlots = timeSlots.filter((slot) => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      return hour < 12;
    });
    onSelectionChange(morningSlots.map((slot) => slot.id));
  };

  const selectAfternoons = () => {
    // Select noon to 5 PM
    const afternoonSlots = timeSlots.filter((slot) => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      return hour >= 12 && hour < 17;
    });
    onSelectionChange(afternoonSlots.map((slot) => slot.id));
  };

  const selectEvenings = () => {
    // Select after 5 PM
    const eveningSlots = timeSlots.filter((slot) => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      return hour >= 17;
    });
    onSelectionChange(eveningSlots.map((slot) => slot.id));
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-700">Quick select:</span>
        <span className="text-xs text-gray-500">
          ({selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} selected)
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={selectAll}>
          Select All
        </Button>
        <Button variant="secondary" size="sm" onClick={clearAll}>
          Clear All
        </Button>
        <Button variant="secondary" size="sm" onClick={selectWorkingHours}>
          Working Hours (9-5)
        </Button>
        <Button variant="secondary" size="sm" onClick={selectMornings}>
          Mornings
        </Button>
        <Button variant="secondary" size="sm" onClick={selectAfternoons}>
          Afternoons
        </Button>
        <Button variant="secondary" size="sm" onClick={selectEvenings}>
          Evenings
        </Button>
      </div>
    </div>
  );
}
