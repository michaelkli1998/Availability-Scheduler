# Firebase Setup Guide

This guide will walk you through setting up Firebase for the Availability Scheduler app.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "availability-scheduler")
4. (Optional) Enable Google Analytics
5. Click "Create project" and wait for it to be ready

## Step 2: Register Your Web App

1. In the Firebase Console, click the **Web** icon (`</>`) to add a web app
2. Enter an app nickname (e.g., "Availability Scheduler Web")
3. **Do not** check "Set up Firebase Hosting" (unless you plan to use it)
4. Click "Register app"
5. You'll see your Firebase configuration object - **copy this for later**

The config will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 3: Enable Firestore Database

1. In the Firebase Console sidebar, click **Build** → **Firestore Database**
2. Click "Create database"
3. Select **Start in test mode** (we'll add proper rules later)
4. Choose a Firestore location (select closest to your users)
5. Click "Enable"

## Step 4: Configure Firestore Security Rules

1. In Firestore Database, click the **Rules** tab
2. Replace the default rules with the following:

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

    // Availability collection - allow anyone to read and create
    match /availability/{availabilityId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false; // Prevent modification/deletion
    }
  }
}
```

3. Click **Publish** to save the rules

### Security Rules Explanation

- **Events**: Anyone can read and create events, but cannot modify or delete them
- **Availability**: Anyone can read and submit availability, but cannot modify or delete responses
- These rules are suitable for a demo/MVP. For production, consider adding authentication and more restrictive rules.

### Production-Ready Rules (Optional)

For production, you might want more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read: if true;
      allow create: if request.auth != null; // Require authentication
      allow update: if request.auth != null &&
                      resource.data.organizerEmail == request.auth.token.email;
      allow delete: if false;
    }

    match /availability/{availabilityId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }
  }
}
```

## Step 5: Set Up Environment Variables

1. In your project root, create or edit `.env.local`
2. Add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

**Example:**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=my-scheduler-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-scheduler-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=my-scheduler-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789abcdef
```

3. **Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Step 6: Test Your Setup

1. Start the development server:

```bash
npm run dev
```

2. Open http://localhost:3000
3. Try creating an event:
   - Click "Create Event"
   - Fill in the form
   - Click "Create Event"
   - If successful, you'll be redirected to the results page
4. Check Firebase Console → Firestore Database to see your data

## Step 7: Monitor Usage (Optional)

### Set Up Firestore Indexes

As your app grows, you might need composite indexes for complex queries:

1. Go to **Firestore Database** → **Indexes** tab
2. Firebase will automatically suggest indexes based on your queries
3. Click "Create index" when prompted

### Monitor Firestore Usage

1. Go to **Usage and billing** in Firebase Console
2. Monitor:
   - Document reads/writes
   - Storage usage
   - Network bandwidth

### Free Tier Limits

Firebase Spark (free) plan includes:
- **Firestore**: 50,000 reads/day, 20,000 writes/day, 1 GB storage
- **Hosting**: 10 GB storage, 360 MB/day bandwidth

For a small app, this should be plenty!

## Troubleshooting

### Error: "Firebase: Error (auth/...)"

- Make sure all environment variables are correctly set
- Restart your dev server after changing `.env.local`

### Error: "Missing or insufficient permissions"

- Check your Firestore security rules
- Make sure test mode is enabled if you're just getting started

### Data Not Showing Up

- Check Firebase Console → Firestore Database to see if data is being created
- Open browser DevTools → Network tab to see if requests are failing
- Check browser Console for error messages

### CORS Errors

- Make sure you're using `http://localhost` (not `127.0.0.1`)
- Clear browser cache and try again
- Check Firebase Console → Project Settings → Authorized domains

## Next Steps

Once Firebase is set up:

1. ✅ Test event creation
2. ✅ Test availability submission
3. ✅ Verify real-time updates
4. ✅ Test on multiple browsers/devices
5. 🚀 Deploy to production (Vercel, Netlify, etc.)

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firestore Quotas and Limits](https://firebase.google.com/docs/firestore/quotas)

---

Need help? Check the [main README](./README.md) or open an issue.
