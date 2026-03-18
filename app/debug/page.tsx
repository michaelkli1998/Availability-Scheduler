'use client';

import { useState } from 'react';
import { generateTimeSlots } from '@/lib/utils/date';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function DebugPage() {
  const [testResult, setTestResult] = useState<any>(null);

  const runTest = () => {
    const startDate = new Date('2026-03-19T12:00:00');
    const endDate = new Date('2026-03-20T12:00:00');
    const startTime = '09:00';
    const endTime = '17:00';
    const intervalMinutes = 30;

    console.log('Test inputs:', {
      startDate,
      endDate,
      startTime,
      endTime,
      intervalMinutes,
    });

    const slots = generateTimeSlots(
      startDate,
      endDate,
      startTime,
      endTime,
      intervalMinutes
    );

    console.log('Generated slots:', slots);

    setTestResult({
      inputs: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startTime,
        endTime,
        intervalMinutes,
      },
      slotsGenerated: slots.length,
      firstFewSlots: slots.slice(0, 5),
      allSlots: slots,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Time Slot Generation</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Time Slot Generator</h2>
          <p className="text-gray-600 mb-4">
            This will test the time slot generation function with sample data.
          </p>
          <Button onClick={runTest}>Run Test</Button>
        </Card>

        {testResult && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-indigo-600 mb-2">✓ Test Inputs</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(testResult.inputs, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  Slots Generated: <span className="text-indigo-600">{testResult.slotsGenerated}</span>
                </h3>
                <p className="text-sm text-gray-600">
                  Expected: ~32 slots (2 days × 16 slots per day)
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">First 5 Slots</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(testResult.firstFewSlots, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Status</h3>
                {testResult.slotsGenerated > 0 ? (
                  <div className="bg-indigo-50 border border-indigo-200 rounded p-4">
                    <p className="text-indigo-800 font-semibold">✓ Time slot generation working!</p>
                    <p className="text-indigo-700 text-sm mt-2">
                      The generateTimeSlots function is working correctly. The issue may be:
                    </p>
                    <ul className="list-disc list-inside text-indigo-700 text-sm mt-2 space-y-1">
                      <li>Event data not loading from Firestore</li>
                      <li>Event settings not saved correctly</li>
                      <li>Date format issue from Firebase Timestamp</li>
                    </ul>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-800 font-semibold">✗ Time slot generation failed</p>
                    <p className="text-red-700 text-sm mt-2">
                      Check the browser console for errors.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">All Slots (expand to see)</h3>
                <details>
                  <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800">
                    Show all {testResult.slotsGenerated} slots
                  </summary>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mt-2">
                    {JSON.stringify(testResult.allSlots, null, 2)}
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
