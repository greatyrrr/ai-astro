# Vaidikacharya — Mobile App

> Vedic birth chart, AI Acharya & daily Panchanga. Ancient wisdom, modern clarity.

A React Native (Expo) mobile application that brings Vedic astrology to your fingertips. Generate your precise natal birth chart using Swiss Ephemeris, consult an AI-powered Vedic astrologer via text or voice, and receive personalized guidance rooted in classical Jyotisha.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Screens & Navigation](#screens--navigation)
- [How It Works](#how-it-works)
- [API Integration](#api-integration)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Building the APK](#building-the-apk)
- [Environment & Configuration](#environment--configuration)
- [Key Components](#key-components)
- [Authentication Flow](#authentication-flow)
- [Voice Chat Flow](#voice-chat-flow)
- [Theme & Design](#theme--design)

---

## Features

- **Vedic Birth Chart** — Enter your birth details (date, time, place) and get a full Jyotisha natal chart with all 9 graha (planets) including Rahu & Ketu, their signs, degrees, retrograde status, and major aspects — calculated with Lahiri ayanamsa
- **Interactive Chart Wheel** — Visual SVG-based zodiac wheel with 12 rashis, planetary glyphs, and aspect lines rendered on-device
- **AI Acharya (Text Chat)** — Converse with an AI astrologer that always has your natal chart + current transits in context. Powered by OpenAI GPT-4o with Anthropic Claude as fallback
- **Voice Chat** — Record your question by holding the mic button; the backend transcribes it via Whisper, generates an AI response, and auto-plays it back as speech (TTS)
- **Current Transits** — Real-time planetary positions displayed alongside your natal chart
- **Secure Auth** — JWT-based authentication with persistent login via AsyncStorage
- **Dark Vedic Theme** — Deep indigo/void background with crimson, gold, and celestial white accents

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.5 | Core mobile framework |
| Expo SDK | 54.0.33 | Build tooling, native APIs |
| TypeScript | 5.9.2 | Type safety |
| React Navigation | 7.x | Stack + Bottom Tab navigation |
| React Native Paper | 5.15.0 | Material Design UI components |
| Axios | 1.13.5 | HTTP client with interceptors |
| expo-av | — | Audio recording & playback |
| expo-file-system | — | Temp file handling for audio |
| date-fns | 4.1.0 | Date formatting |
| @react-native-async-storage | — | Persistent JWT storage |
| @react-native-community/datetimepicker | — | Native date & time pickers |
| Expo Vector Icons | — | Icon sets |

---

## Project Structure

```
mobile/
├── App.tsx                          # Root component — wraps app in AuthProvider + NavigationContainer
├── app.json                         # Expo config (name, package, icons, plugins)
├── eas.json                         # EAS Build profiles (preview APK, production AAB)
├── tsconfig.json
├── package.json
├── assets/
│   ├── icon.png                     # App icon 1024x1024 (Vedic mandala design)
│   ├── adaptive-icon.png            # Android adaptive icon
│   ├── splash-icon.png              # Splash screen icon
│   └── generate_icon.py             # Python/Pillow script to regenerate icons
├── plugins/
│   └── withCleartextTraffic.js      # Expo config plugin: injects android:usesCleartextTraffic
└── src/
    ├── api/
    │   ├── client.ts                # Axios instance — base URL, JWT injection, 401 handler
    │   └── endpoints.ts             # All API call functions (auth, profiles, charts, chat, voice)
    ├── context/
    │   └── AuthContext.tsx          # Auth state — login, logout, token, isAuthenticated
    ├── navigation/
    │   ├── RootNavigator.tsx        # Top-level: shows AuthNavigator or AppNavigator
    │   ├── AuthNavigator.tsx        # Stack: Welcome → Login → SignUp
    │   └── AppNavigator.tsx         # Bottom tabs: Profile | Chat | My Chart
    ├── screens/
    │   ├── WelcomeScreen.tsx        # Onboarding/landing screen
    │   ├── LoginScreen.tsx          # Email + password login form
    │   ├── SignUpScreen.tsx         # Registration form (name, email, password)
    │   ├── ProfileScreen.tsx        # Displays user info + birth profile summary
    │   ├── BirthProfileInputScreen.tsx  # Birth data input form (name, gender, DOB, time, place)
    │   ├── ChartPreviewScreen.tsx   # Preview chart summary before saving
    │   ├── ChartViewScreen.tsx      # Full chart: wheel + planetary table + aspects + transits
    │   ├── ChatListScreen.tsx       # Lists all conversations
    │   └── ChatScreen.tsx           # Main chat interface (voice + text messages)
    ├── components/
    │   ├── VoiceRecorder.tsx        # Mic button + waveform animation for audio recording
    │   ├── AudioPlayer.tsx          # Base64 audio decoder + expo-av playback
    │   ├── MessageBubble.tsx        # Chat bubble (user right / assistant left, with icons)
    │   └── VedicChartWheel.tsx      # SVG zodiac wheel component
    ├── constants/
    │   └── theme.ts                 # Dark theme color palette
    └── types/
        └── index.ts                 # TypeScript interfaces for all API response shapes
```

---

## Screens & Navigation

### Authentication Flow (AuthNavigator)

```
WelcomeScreen
    ↓ "Get Started"
SignUpScreen  ←→  LoginScreen
    ↓ on success        ↓ on success
         AppNavigator (Bottom Tabs)
```

**WelcomeScreen** — Branding screen with tagline and CTA buttons for Login and SignUp.

**SignUpScreen** — Collects full name, email, and password. Calls `/auth/register` and auto-logs in.

**LoginScreen** — Email and password fields. Calls `/auth/login`. JWT stored in AsyncStorage and AuthContext on success.

### Main App (AppNavigator — Bottom Tabs)

```
┌──────────────────────────────────────┐
│  Tab 1: Profile  |  Tab 2: Chat  |  Tab 3: My Chart  │
└──────────────────────────────────────┘
```

**Profile Tab** — Shows user's name, email, and birth profile summary. Links to `BirthProfileInputScreen` for creating/editing birth data. After saving, navigates to `ChartPreviewScreen` then `ChartViewScreen`.

**Chat Tab** — Opens `ChatListScreen` showing all conversations. Tap a conversation to open `ChatScreen` for text or voice chat.

**My Chart Tab** — Directly opens `ChartViewScreen` with the user's natal chart.

---

## How It Works

### 1. Birth Chart Generation

1. User fills out `BirthProfileInputScreen`:
   - Full name
   - Gender (Male / Female / Other)
   - Date of birth (native date picker)
   - Time of birth (native time picker)
   - Place of birth (city and country)
2. On submit, mobile calls `POST /birth-profiles`
3. Backend calculates the Vedic natal chart using **Swiss Ephemeris** (Lahiri ayanamsa):
   - All 9 planets: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
   - Each planet's sign (rashi), degree, and retrograde status
   - Major aspects: Conjunction (≤8°), Sextile (≤6°), Square (≤7°), Trine (≤8°), Opposition (≤8°)
4. Chart JSON is stored in the database and returned to the mobile app
5. `ChartViewScreen` renders:
   - Visual SVG zodiac wheel (`VedicChartWheel`)
   - Planetary positions table with sign glyphs
   - Aspect list with interpretation labels
   - Current transits fetched from `/charts/transits`

### 2. Text Chat with AI Acharya

1. User opens or creates a conversation in `ChatListScreen`
2. In `ChatScreen`, user types a question and submits
3. Message is optimistically added to the local chat list
4. Mobile calls `POST /chat/conversations/{id}/messages`
5. Backend:
   - Retrieves user's birth chart from DB
   - Fetches current planetary transits
   - Builds a prompt: system role (Vedic astrologer) + natal context + transit context + conversation history
   - Calls **OpenAI GPT-4o** (falls back to **Anthropic Claude Sonnet** if OpenAI fails)
   - Saves both user and assistant messages to DB
6. Assistant reply displayed as a chat bubble

### 3. Voice Chat

1. User holds the mic button in `ChatScreen` — `VoiceRecorder` records using `expo-av`
2. On release, the audio file (.m4a on iOS / .webm on Android) is sent via `POST /chat/conversations/{id}/voice` (multipart/form-data)
3. Backend pipeline:
   - **Whisper** transcribes audio → text
   - Text goes through the same AI pipeline as text chat
   - **Anthropic TTS** converts the AI response to speech audio
   - Returns: `{ transcript, response: { content, audio_base64 } }`
4. Mobile:
   - Adds user message (transcript) and assistant message (content) to chat
   - Decodes base64 audio → writes to temp file → auto-plays via `AudioPlayer`

---

## API Integration

All API calls are defined in `src/api/endpoints.ts` and use the `client.ts` Axios instance.

### Base URL

```typescript
// src/api/client.ts
const BASE_URL =
  Platform.OS === 'web' && __DEV__
    ? 'http://localhost:8000'
    : 'https://astroai.duckdns.org';
```

Production builds always use `https://astroai.duckdns.org`.

### JWT Auth Interceptor

The Axios instance automatically attaches the JWT to every request:

```typescript
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

On a 401 response, the interceptor calls `logout()` and redirects to the Login screen.

### Available Endpoint Functions

```typescript
// Auth
authAPI.register({ email, password, full_name })
authAPI.login({ email, password })

// Birth Profiles
profilesAPI.create({ full_name, gender, birth_date, birth_time, birth_location })
profilesAPI.getMe()

// Charts
chartsAPI.getMyChart()
chartsAPI.getTransits()

// Chat
chatAPI.createConversation({ title })
chatAPI.getConversations()
chatAPI.getConversation(id)
chatAPI.sendMessage(conversationId, { content })
chatAPI.sendVoice(conversationId, audioFile)
chatAPI.getMessageAudio(messageId)
```

---

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for builds): `npm install -g eas-cli`
- An Expo account (for EAS builds): [expo.dev](https://expo.dev)
- Android device or emulator (or iOS device/simulator on Mac)
- Backend running and accessible (see `backend/README.md`)

---

## Getting Started

### 1. Install dependencies

```bash
cd mobile
npm install
```

### 2. Configure the API base URL

Edit `src/api/client.ts` and set your backend URL:

```typescript
const BASE_URL = 'https://your-backend-domain.com';
// or for local development:
const BASE_URL = 'http://192.168.x.x:8000'; // your local machine IP
```

### 3. Run in development

```bash
# Start the Expo dev server
npx expo start

# Or with production API (disables __DEV__):
npx expo start --no-dev
```

Scan the QR code with **Expo Go** on your Android or iOS device (same WiFi network).

### 4. Run on Android emulator

```bash
npx expo run:android
```

### 5. Run on iOS simulator (macOS only)

```bash
npx expo run:ios
```

---

## Building the APK

This project uses **EAS Build** (Expo Application Services) for cloud-based builds — no local Android SDK required.

### Profiles (`eas.json`)

| Profile | Output | Use Case |
|---------|--------|---------|
| `preview` | APK | Direct install on Android devices |
| `production` | AAB | Google Play Store submission |

### Build APK

```bash
# Login to Expo account
eas login

# Build APK (preview profile)
eas build --platform android --profile preview
```

EAS will queue the build in the cloud. When complete, download the APK from the Expo dashboard or the printed URL.

### Build for Play Store (AAB)

```bash
eas build --platform android --profile production
```

---

## Environment & Configuration

### `app.json` Key Settings

```json
{
  "expo": {
    "name": "Vaidikacharya",
    "slug": "vaidikacharya",
    "android": {
      "package": "com.vaidikacharya.mobile"
    },
    "plugins": [
      "./plugins/withCleartextTraffic"
    ]
  }
}
```

### Config Plugin (`plugins/withCleartextTraffic.js`)

Injects `android:usesCleartextTraffic="true"` into AndroidManifest.xml. This is registered in `app.json` and applied automatically during builds. Required if connecting to any `http://` endpoint on Android 9+.

---

## Key Components

### `VedicChartWheel`

SVG-based component that renders:
- 12 rashi (zodiac sign) segments with Sanskrit/English labels
- Planet glyphs positioned at their degrees
- Aspect lines between planets

### `VoiceRecorder`

- Uses `expo-av` `Audio.Recording` API
- Long-press to start, release to stop
- Shows animated waveform during recording
- Requests microphone permissions on first use
- Calls `onRecordingComplete(uri)` callback with file path

### `AudioPlayer`

- Accepts `audioBase64` string from the API
- Writes decoded audio to a temp file using `expo-file-system`
- Plays back via `expo-av` `Audio.Sound`
- Auto-plays on mount if `autoPlay` prop is set

### `MessageBubble`

- `role: 'user'` → right-aligned, primary color background
- `role: 'assistant'` → left-aligned, surface color, shows avatar icon
- Renders message content as text with timestamp

### `AuthContext`

```typescript
const { user, token, isAuthenticated, login, logout } = useAuth();
```

Persists token to AsyncStorage on login, clears on logout. `RootNavigator` reads `isAuthenticated` to decide which navigator to render.

---

## Authentication Flow

```
App starts
    ↓
AuthContext loads token from AsyncStorage
    ↓
isAuthenticated?
  YES → AppNavigator (tabs)
   NO → AuthNavigator (login/signup)
    ↓
Login/Register → receive JWT
    ↓
Token saved to AsyncStorage + AuthContext
    ↓
RootNavigator re-renders → AppNavigator
```

---

## Voice Chat Flow

```
User holds mic button
    ↓
expo-av starts recording (m4a/webm)
    ↓
User releases mic
    ↓
Audio file sent to POST /chat/conversations/{id}/voice
    ↓
Backend: Whisper transcription → AI response → Anthropic TTS
    ↓
Response: { transcript, response: { content, audio_base64 } }
    ↓
Mobile: Add user msg (transcript) + assistant msg (content) to chat
    ↓
Decode base64 → write to temp file → expo-av plays audio
```

---

## Theme & Design

The app uses a consistent dark Vedic aesthetic defined in `src/constants/theme.ts`:

| Token | Color | Usage |
|-------|-------|-------|
| `background` | `#0F0A1A` | Page backgrounds (deep void/indigo) |
| `surface` | `#1A1030` | Cards, modals |
| `primary` | `#7B5EA7` | Buttons, active tabs, highlights |
| `accent` | `#C0392B` | Crimson accents |
| `gold` | `#D4AF37` | Vedic gold for headings |
| `text` | `#E8E0F0` | Primary text |
| `textSecondary` | `#9E8FB2` | Muted labels |

Icons and fonts use a celestial, classical aesthetic to match the Vedic astrology domain.

---

## Play Store

- **App Name**: Vaidikacharya
- **Package**: `com.vaidikacharya.mobile`
- **Category**: Lifestyle > Astrology
- **Privacy Policy**: https://vaidikacharya.com/privacy-policy.html
- **Website**: https://vaidikacharya.com
