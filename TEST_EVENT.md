# Testing the Event Creation

## Quick Test Steps

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Create a test event:**
   - Go to http://localhost:3000
   - Click "Create Event"
   - Fill in:
     - Title: "Test Meeting"
     - Your Name: "Test Organizer"
     - Start Date: Tomorrow's date
     - End Date: Day after tomorrow
     - Start Time: 09:00
     - End Time: 17:00
     - Interval: 30 minutes
   - Click "Create Event"

3. **Check the console:**
   - Open Browser DevTools (F12 or Cmd+Option+I)
   - Go to Console tab
   - Look for logs starting with:
     - "Event loaded:"
     - "Generated time slots:"
     - "TimeSlotGrid received slots:"

4. **What you should see:**
   - "Generated time slots: 32" (or similar number)
   - Time slot grid with dates as columns and times as rows

## Common Issues

### Issue 1: No time slots generated (shows 0)

**Possible causes:**
- Date range is invalid
- Start time >= End time
- Event settings not saved correctly

**Solution:**
Check browser console for the "Event loaded:" log and verify the settings.

### Issue 2: Grid is empty but slots exist

**Possible causes:**
- CSS issue
- Grid not rendering properly

**Solution:**
Check if you see "TimeSlotGrid received slots: [number]" in console.

### Issue 3: Firebase connection error

**Possible causes:**
- Firebase credentials not set
- Firestore not enabled
- Security rules blocking access

**Solution:**
1. Check `.env.local` has all Firebase variables
2. Verify Firestore is enabled in Firebase Console
3. Check Firestore rules allow read/write

## Debug Information

When you open an event page, you should see console logs like:

```
Event loaded: {
  id: "...",
  title: "Test Meeting",
  settings: {
    startTime: "09:00",
    endTime: "17:00",
    intervalMinutes: 30
  },
  dateRange: {
    start: Timestamp,
    end: Timestamp
  }
}

Date range: {
  start: Date(...),
  end: Date(...)
}

Generated time slots: 32 [
  { id: "2026-03-19_09:00", date: "2026-03-19", startTime: "09:00", endTime: "09:30" },
  { id: "2026-03-19_09:30", date: "2026-03-19", startTime: "09:30", endTime: "10:00" },
  ...
]

TimeSlotGrid received slots: 32
TimeSlotGrid dates: ["2026-03-19", "2026-03-20"]
TimeSlotGrid times per day: 16
```

## Troubleshooting

If you don't see any console logs:
1. The event might not be loading from Firestore
2. Check Network tab in DevTools for failed requests
3. Verify your Firebase credentials are correct
4. Check Firebase Console → Firestore to see if event was created
