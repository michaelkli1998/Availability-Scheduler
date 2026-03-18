'use client';

import { useState } from 'react';
import { getEvent } from '@/lib/firebase/firestore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function InspectPage() {
  const [eventId, setEventId] = useState('');
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inspectEvent = async () => {
    if (!eventId.trim()) {
      setError('Please enter an event ID');
      return;
    }

    setLoading(true);
    setError(null);
    setEventData(null);

    try {
      const event = await getEvent(eventId.trim());
      console.log('Fetched event:', event);

      if (event) {
        setEventData({
          raw: event,
          hasDateRange: !!event.dateRange,
          hasSettings: !!event.settings,
          dateRangeStart: event.dateRange?.start ? event.dateRange.start.toDate().toISOString() : 'MISSING',
          dateRangeEnd: event.dateRange?.end ? event.dateRange.end.toDate().toISOString() : 'MISSING',
          settings: event.settings || 'MISSING',
        });
      } else {
        setError('Event not found');
      }
    } catch (err: any) {
      console.error('Error fetching event:', err);
      setError(err.message || 'Failed to fetch event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Event Inspector</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Inspect Event Data</h2>
          <p className="text-gray-600 mb-4">
            Enter an event ID to see what data is stored in Firestore.
          </p>

          <div className="flex gap-3">
            <Input
              placeholder="Event ID (e.g., CnZnVb61Qe4dlqVaNc0m)"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={inspectEvent} isLoading={loading}>
              Inspect
            </Button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </Card>

        {eventData && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Event Data</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Quick Check</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {eventData.hasDateRange ? (
                      <span className="text-indigo-600">✓ Has dateRange</span>
                    ) : (
                      <span className="text-red-600">✗ Missing dateRange</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {eventData.hasSettings ? (
                      <span className="text-indigo-600">✓ Has settings</span>
                    ) : (
                      <span className="text-red-600">✗ Missing settings</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Date Range</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm">
                  Start: {eventData.dateRangeStart}{'\n'}
                  End: {eventData.dateRangeEnd}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Settings</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(eventData.settings, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Full Raw Data</h3>
                <details>
                  <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800">
                    Show full event object
                  </summary>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mt-2">
                    {JSON.stringify(eventData.raw, (key, value) => {
                      // Handle Timestamp objects
                      if (value && typeof value === 'object' && value.toDate) {
                        return value.toDate().toISOString();
                      }
                      return value;
                    }, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
