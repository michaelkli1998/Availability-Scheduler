# Updated Firestore Security Rules

To enable edit functionality, update your Firestore security rules:

## Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Replace the rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events collection - allow anyone to read and create
    match /events/{eventId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false; // Prevent modification/deletion
    }

    // Availability collection - allow read, create, and UPDATE
    match /availability/{availabilityId} {
      allow read: if true;
      allow create: if true;
      allow update: if true; // ✅ Now allows updates for edit functionality
      allow delete: if false; // Still prevent deletion
    }
  }
}
```

5. Click **Publish**

## What Changed:

- **Before:** `allow update, delete: if false;`
- **After:** `allow update: if true;` (separate from delete)

This allows participants to update their availability while still preventing deletion.

## Security Note:

For an MVP, this is fine. For production, you might want to add authentication or restrict updates to only the original submitter.
