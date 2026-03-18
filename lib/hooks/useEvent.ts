import { useState, useEffect } from 'react';
import { Event } from '@/types/event';
import { subscribeToEvent } from '@/lib/firebase/firestore';

export function useEvent(eventId: string | null) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToEvent(eventId, (eventData) => {
      if (eventData) {
        setEvent(eventData);
        setError(null);
      } else {
        setEvent(null);
        setError('Event not found');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  return { event, loading, error };
}
