# Availability Scheduler

A modern, real-time scheduling coordination tool that helps groups find the best time to meet. Built as a clean alternative to when2meet with a focus on user experience and smooth animations.

## Features

- 🎨 **Clean, minimal design** - Modern UI with smooth animations
- 📅 **Interactive time slot selection** - Click or drag to select available times
- 🔥 **Real-time heatmap** - Visual color-coded grid showing optimal meeting times
- 👥 **Live participant tracking** - See responses as they come in
- 📱 **Mobile responsive** - Works perfectly on any device
- 🔗 **Easy sharing** - One-click shareable links
- ⚡ **No sign-up required** - Create events and respond instantly

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Firebase Firestore** - Real-time database
- **React Hook Form + Zod** - Form validation
- **date-fns** - Date manipulation
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project (for backend)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd availability-scheduler
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Firebase**

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Copy your Firebase configuration

4. **Configure environment variables**

Create a `.env.local` file in the root directory with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

5. **Set up Firestore Security Rules**

Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events are readable by anyone, writable by anyone (for demo purposes)
    match /events/{eventId} {
      allow read: if true;
      allow write: if true;
    }

    // Availability responses are readable by anyone, writable by anyone
    match /availability/{availabilityId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

6. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## How It Works

### 1. Create an Event

1. Navigate to the home page and click "Create Event"
2. Fill in event details:
   - Event title and description
   - Your name
   - Date range (start and end dates)
   - Time configuration (start time, end time, interval)
3. Click "Create Event" to generate a shareable link

### 2. Share with Participants

1. Copy the generated shareable link
2. Send it to participants via email, chat, or any platform
3. Participants can access the event without signing up

### 3. Mark Availability

1. Participants open the shared link
2. Click or drag on the time slot grid to select available times
3. Enter their name and submit
4. View results immediately after submitting

### 4. View Results

1. Access the results page to see:
   - **Heatmap**: Color-coded grid showing availability
     - Gray = 0% available
     - Light green = 25% available
     - Medium green = 50% available
     - Dark green = 75%+ available
     - ⭐ = Top 3 most popular time slots
   - **Participant list**: All responses with timestamps
   - **Shareable link**: Easy access for more participants

## Project Structure

```
availability-scheduler/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── create/page.tsx          # Event creation page
│   └── event/[eventId]/
│       ├── page.tsx             # Participant view
│       └── results/page.tsx     # Results page with heatmap
├── components/
│   ├── ui/                      # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── LoadingSpinner.tsx
│   ├── calendar/                # Calendar components
│   │   └── TimeSlotGrid.tsx
│   ├── availability/            # Availability components
│   │   ├── AvailabilityHeatmap.tsx
│   │   └── ParticipantList.tsx
│   ├── event/                   # Event components
│   │   ├── EventForm.tsx
│   │   ├── EventHeader.tsx
│   │   └── ShareableLink.tsx
│   └── animations/              # Animation wrappers
│       └── FadeIn.tsx
├── lib/
│   ├── firebase/                # Firebase configuration
│   │   ├── config.ts
│   │   └── firestore.ts
│   ├── utils/                   # Utility functions
│   │   ├── date.ts
│   │   ├── heatmap.ts
│   │   └── url.ts
│   └── hooks/                   # Custom React hooks
│       ├── useEvent.ts
│       └── useAvailability.ts
└── types/                       # TypeScript definitions
    └── event.ts
```

## Key Features Explained

### Interactive Time Slot Grid

- **Click**: Toggle individual time slots
- **Drag**: Select multiple slots at once
- **Touch support**: Works on mobile devices
- **Visual feedback**: Smooth animations on selection

### Real-time Updates

- Uses Firestore `onSnapshot` listeners
- Participant count updates live
- Heatmap colors update automatically
- No page refresh needed

### Heatmap Visualization

- **Algorithm**: Counts selections per slot, calculates percentage
- **Color gradient**: Based on availability percentage
- **Hover tooltips**: Shows participant names and count
- **Best slots**: Top 3 times highlighted with stars

## Development

### Build for production

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Lint code

```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Self-hosted

## Future Enhancements

- [ ] Email notifications
- [ ] Export results to CSV/PDF
- [ ] Calendar integration (Google Calendar, iCal)
- [ ] User accounts to manage multiple events
- [ ] Recurring events
- [ ] Time zone support
- [ ] Comments from participants
- [ ] Dark mode
- [ ] Custom branding

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Inspired by when2meet
- Built with modern web technologies
- Designed for simplicity and ease of use

---

Built with ❤️ using Next.js and Firebase
