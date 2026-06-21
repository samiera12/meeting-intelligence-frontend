# Meeting Intelligence — Mobile App

React Native (Expo) client for the Meeting Intelligence Service. Covers the full backend API: authentication, meeting management, AI-powered meeting analysis with citation display, action item tracking, and overdue detection.

## Tech Stack

- **Framework:** Expo + React Native + TypeScript
- **Navigation:** React Navigation (native stack)
- **HTTP Client:** Axios
- **Secure Storage:** expo-secure-store (JWT token storage)
- **Build/Distribution:** EAS Build

## Backend

This app talks to the Meeting Intelligence backend API:
**Live backend:** https://meeting-intelligence-service-dn5p.onrender.com
**Backend repo:** https://github.com/samiera12/meeting-intelligence-service

## Install the App (Android)

No build required — open this link on an Android phone's browser and tap **Install**:

**https://expo.dev/accounts/samiera/projects/meeting-intelligence/builds/09346d72-320f-4fa3-b4fd-ed4dbd8a4e02**

You may need to allow "install from unknown sources" the first time. The app is pre-configured to talk to the live backend above — no setup needed after installing.

## Run Locally

### Prerequisites
- Node.js 18+
- Expo Go app installed on a physical phone (iOS or Android), or an emulator/simulator
- The backend running and reachable (either the live Render URL, or your own local backend on the same WiFi network)

### Setup

```bash
git clone <this-repo-url>
cd frontend
npm install
```

### Configure the API base URL

Open `src/api/client.ts` and set `BASE_URL`:

```typescript
// Point at the live backend (default, works out of the box):
export const BASE_URL = 'https://meeting-intelligence-service-dn5p.onrender.com';

// OR point at your own local backend for development.
// Use your machine's local network IP, NOT "localhost" —
// a physical phone on Expo Go cannot reach your laptop's localhost.
// export const BASE_URL = 'http://192.168.1.4:3000';
```

### Start the dev server

```bash
npx expo start
```

- **Physical device:** open the Expo Go app and scan the QR code printed in the terminal (phone and laptop must be on the same WiFi network if using a local backend)
- **Web:** press `w` in the terminal
- **Android emulator:** press `a` (requires Android Studio set up locally)
- **iOS simulator:** press `i` (macOS only, requires Xcode)

## Building Your Own APK (EAS)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

This builds a fresh installable `.apk` and uploads it to Expo's servers. The build link prints in the terminal and is also viewable at `https://expo.dev/accounts/<your-account>/projects/meeting-intelligence/builds`.

## App Structure

```
src/
├── api/            # Axios client + typed API calls per domain
│   ├── client.ts
│   ├── auth.ts
│   ├── meetings.ts
│   └── actionItems.ts
├── context/
│   └── AuthContext.tsx   # Auth state, token persistence (SecureStore)
├── navigation/
│   ├── RootNavigator.tsx  # Switches Auth stack <-> App stack based on login state
│   ├── AuthNavigator.tsx
│   ├── AppNavigator.tsx
│   └── types.ts
├── screens/
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── MeetingsListScreen.tsx
│   ├── CreateMeetingScreen.tsx
│   ├── MeetingDetailScreen.tsx     # Transcript view + AI analysis + citations
│   ├── ActionItemsListScreen.tsx   # Filterable list, status cycling
│   └── OverdueItemsScreen.tsx
├── components/
│   └── StatusBadge.tsx
└── types/
    └── index.ts        # Shared TypeScript types mirroring backend shapes
```

## Features Covered

- **Auth:** register, login, session persistence (auto-login on app relaunch via SecureStore), logout
- **Meetings:** create with a dynamic transcript builder (timestamp/speaker/text rows), list (auto-refreshes on focus), detail view with full transcript
- **AI Analysis:** trigger analysis from the meeting detail screen; summary, decisions, action items, and follow-ups are displayed with citation badges (📍 timestamp) linking each insight back to its source transcript line — visually demonstrating the backend's grounding/hallucination-prevention guarantee
- **Action Items:** list with status filter chips (All/Pending/In Progress/Completed), tap-to-cycle status updates, pull-to-refresh
- **Overdue:** dedicated screen listing only overdue items, with a one-tap "Mark Complete" action

## Known Limitations

- Tested primarily on Android (via Expo Go and an EAS-built APK); iOS was not built/published as part of this submission (no Apple Developer account available), though the code is cross-platform and should run via `npx expo start` + iOS Simulator/Expo Go without changes.
- No offline support — all screens require network connectivity to the backend.
- No push notifications — overdue reminders are delivered via email (Resend) from the backend's scheduled job, not as in-app/push notifications.
