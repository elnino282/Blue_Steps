# BlueStep

BlueStep is a personal web app designed to help you reduce procrastination and limit class skipping through gamification. By checking in to your classes and study sessions, you earn XP, level up, maintain streaks, and unlock badges, all while receiving gentle, positive motivation.

## Features

- **Gamified Attendance:** Earn XP and level up by attending classes.
- **Streak Tracking:** Build consistency with daily streaks.
- **Badges & Achievements:** Unlock rewards for your dedication.
- **Positive Motivation:** Receive daily quotes and healing messages.
- **Modern UI:** Clean, minimalist, blue-themed interface with soft rounded corners.
- **Anonymous Authentication:** No login required. Your data is securely tied to your device using Firebase Anonymous Auth.
- **Offline Support:** Works seamlessly even when you lose internet connection, syncing data when you're back online.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Backend/Database:** Firebase v10+ (Auth, Firestore)
- **Charts:** Recharts
- **Date Formatting:** date-fns

## Getting Started

### Prerequisites

Ensure you have Node.js installed (v18+ recommended).

### Installation

1. Clone the repository or download the source code.
2. Install dependencies:

```bash
npm install
```

### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Firestore Database** and set up the security rules using the provided `firestore.rules` file.
3. Enable **Authentication** and turn on the **Anonymous** sign-in provider.
4. Go to Project Settings and add a Web App to get your Firebase configuration.
5. Create a `.env.local` file in the root directory and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Running the Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/app`: Next.js App Router pages and layouts.
  - `/app/(dashboard)`: Authenticated dashboard views.
- `/components`: Reusable UI components.
  - `/components/ui`: shadcn/ui base components.
  - `/components/layout`: Sidebar, Topbar, etc.
- `/lib`: Utility functions and Firebase initialization.
- `/types`: TypeScript type definitions.
- `/services`: API and business logic services (Auth, Firestore).
- `/hooks`: Custom React hooks (e.g., `use-auth`).
- `/constants`: Theme and app-wide constants.

## License

MIT
