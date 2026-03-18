import { useState, useEffect } from 'react';
import { Availability } from '@/types/event';
import { subscribeToAvailabilities } from '@/lib/firebase/firestore';

export function useAvailabilities(eventId: string | null) {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToAvailabilities(eventId, (data) => {
      setAvailabilities(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [eventId]);

  return { availabilities, loading, error };
}
