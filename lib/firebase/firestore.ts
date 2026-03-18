import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { Event, Availability, EventFormData } from '@/types/event';

// Collections
const EVENTS_COLLECTION = 'events';
const AVAILABILITY_COLLECTION = 'availability';

// Create Event
export async function createEvent(formData: EventFormData): Promise<string> {
  try {
    const eventData = {
      title: formData.title,
      description: formData.description || '',
      organizerName: formData.organizerName,
      dateRange: {
        start: Timestamp.fromDate(formData.startDate),
        end: Timestamp.fromDate(formData.endDate),
      },
      timeSlots: [], // Generated on the client based on date range and time settings
      createdAt: Timestamp.now(),
      settings: {
        allowAnonymous: true,
        timezone: formData.timezone,
        startTime: formData.startTime,
        endTime: formData.endTime,
        intervalMinutes: formData.intervalMinutes,
      },
    };

    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
}

// Get Event by ID
export async function getEvent(eventId: string): Promise<Event | null> {
  try {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Event;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting event:', error);
    throw new Error('Failed to get event');
  }
}

// Subscribe to Event (Real-time)
export function subscribeToEvent(
  eventId: string,
  callback: (event: Event | null) => void
): Unsubscribe {
  const docRef = doc(db, EVENTS_COLLECTION, eventId);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as Event);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error subscribing to event:', error);
      callback(null);
    }
  );
}

// Submit Availability
export async function submitAvailability(
  eventId: string,
  participantName: string,
  selectedSlots: string[]
): Promise<void> {
  try {
    const availabilityData = {
      eventId,
      participantName,
      selectedSlots,
      submittedAt: Timestamp.now(),
    };

    await addDoc(collection(db, AVAILABILITY_COLLECTION), availabilityData);
  } catch (error) {
    console.error('Error submitting availability:', error);
    throw new Error('Failed to submit availability');
  }
}

// Update Availability
export async function updateAvailability(
  availabilityId: string,
  selectedSlots: string[]
): Promise<void> {
  try {
    const docRef = doc(db, AVAILABILITY_COLLECTION, availabilityId);
    await updateDoc(docRef, {
      selectedSlots,
      submittedAt: Timestamp.now(), // Update timestamp
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    throw new Error('Failed to update availability');
  }
}

// Find existing availability by name
export async function findAvailabilityByName(
  eventId: string,
  participantName: string
): Promise<Availability | null> {
  try {
    const q = query(
      collection(db, AVAILABILITY_COLLECTION),
      where('eventId', '==', eventId),
      where('participantName', '==', participantName)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Return the first match
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Availability;
  } catch (error) {
    console.error('Error finding availability:', error);
    return null;
  }
}

// Get Availabilities for Event
export async function getAvailabilities(eventId: string): Promise<Availability[]> {
  try {
    const q = query(
      collection(db, AVAILABILITY_COLLECTION),
      where('eventId', '==', eventId)
    );

    const querySnapshot = await getDocs(q);
    const availabilities: Availability[] = [];

    querySnapshot.forEach((doc) => {
      availabilities.push({ id: doc.id, ...doc.data() } as Availability);
    });

    return availabilities;
  } catch (error) {
    console.error('Error getting availabilities:', error);
    throw new Error('Failed to get availabilities');
  }
}

// Subscribe to Availabilities (Real-time)
export function subscribeToAvailabilities(
  eventId: string,
  callback: (availabilities: Availability[]) => void
): Unsubscribe {
  const q = query(
    collection(db, AVAILABILITY_COLLECTION),
    where('eventId', '==', eventId)
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const availabilities: Availability[] = [];
      querySnapshot.forEach((doc) => {
        availabilities.push({ id: doc.id, ...doc.data() } as Availability);
      });
      callback(availabilities);
    },
    (error) => {
      console.error('Error subscribing to availabilities:', error);
      callback([]);
    }
  );
}

// Get All Events
export async function getAllEvents(limitCount: number = 50): Promise<Event[]> {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const events: Event[] = [];

    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() } as Event);
    });

    return events;
  } catch (error) {
    console.error('Error getting events:', error);
    throw new Error('Failed to get events');
  }
}
