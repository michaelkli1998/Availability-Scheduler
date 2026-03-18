import { Timestamp } from 'firebase/firestore';

export interface TimeSlot {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:mm format (e.g., "09:00")
  endTime: string; // HH:mm format (e.g., "09:30")
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  organizerName: string;
  dateRange: {
    start: Timestamp;
    end: Timestamp;
  };
  timeSlots: TimeSlot[];
  createdAt: Timestamp;
  settings: {
    allowAnonymous: boolean;
    timezone: string;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    intervalMinutes: number; // e.g., 30, 60
  };
}

export interface Availability {
  id: string;
  eventId: string;
  participantName: string;
  selectedSlots: string[]; // Array of TimeSlot IDs
  submittedAt: Timestamp;
}

export interface HeatmapData {
  slotId: string;
  count: number;
  percentage: number;
  participants: string[];
}

// Form types for event creation
export interface EventFormData {
  title: string;
  description?: string;
  organizerName: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  intervalMinutes: number;
  timezone: string;
}

// Form types for availability submission
export interface AvailabilityFormData {
  participantName: string;
  selectedSlots: string[];
}
