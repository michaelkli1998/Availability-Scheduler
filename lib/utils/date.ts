import { format, addDays, eachDayOfInterval, addMinutes, parse } from 'date-fns';
import { TimeSlot } from '@/types/event';

export function generateTimeSlots(
  startDate: Date,
  endDate: Date,
  startTime: string, // "09:00"
  endTime: string, // "17:00"
  intervalMinutes: number // 30
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  console.log('generateTimeSlots input:', {
    startDate: startDate.toString(),
    endDate: endDate.toString(),
    startDateLocal: `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`,
    endDateLocal: `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`,
  });

  // Normalize dates to local midnight to avoid timezone issues
  // Use local date components to preserve the intended date
  const normalizedStart = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    0, 0, 0, 0
  );

  const normalizedEnd = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
    0, 0, 0, 0
  );

  console.log('Normalized dates:', {
    normalizedStart: normalizedStart.toString(),
    normalizedEnd: normalizedEnd.toString(),
  });

  const days = eachDayOfInterval({ start: normalizedStart, end: normalizedEnd });
  console.log('Days in interval:', days.length, 'First day:', days[0]?.toString());

  // Handle special case: if endTime is "00:00", treat it as end of day (midnight next day)
  const adjustedEndTime = endTime === '00:00' ? '23:59' : endTime;

  days.forEach((day) => {
    // Format using local date to avoid timezone shifts
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(day.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayOfMonth}`;

    // Parse start and end times for this day
    const startDateTime = parse(`${dateStr} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    let endDateTime = parse(`${dateStr} ${adjustedEndTime}`, 'yyyy-MM-dd HH:mm', new Date());

    // If end time is still before start time, add a day
    if (endDateTime <= startDateTime) {
      endDateTime = addDays(endDateTime, 1);
    }

    let currentTime = startDateTime;

    while (currentTime < endDateTime) {
      const nextTime = addMinutes(currentTime, intervalMinutes);

      slots.push({
        id: `${dateStr}_${format(currentTime, 'HH:mm')}`,
        date: dateStr,
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(nextTime, 'HH:mm'),
      });

      currentTime = nextTime;
    }
  });

  return slots;
}

export function formatSlotTime(slot: TimeSlot): string {
  return `${slot.startTime} - ${slot.endTime}`;
}

export function formatTime12Hour(time24: string): string {
  // Convert "HH:mm" to "h:mm AM/PM"
  const [hours24, minutes] = time24.split(':').map(Number);

  if (hours24 === 0) {
    return `12:${minutes.toString().padStart(2, '0')} AM`;
  } else if (hours24 < 12) {
    return `${hours24}:${minutes.toString().padStart(2, '0')} AM`;
  } else if (hours24 === 12) {
    return `${hours24}:${minutes.toString().padStart(2, '0')} PM`;
  } else {
    return `${hours24 - 12}:${minutes.toString().padStart(2, '0')} PM`;
  }
}

export function formatDate(dateStr: string): string {
  // Parse as local date to preserve the intended date
  const date = new Date(dateStr + 'T00:00:00');
  return format(date, 'EEE, MMM d');
}

export function formatDateLong(dateStr: string): string {
  // Parse as local date to preserve the intended date
  const date = new Date(dateStr + 'T00:00:00');
  return format(date, 'EEEE, MMMM d, yyyy');
}
