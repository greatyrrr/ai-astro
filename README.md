# ✦ AstroAI — Vedic Astrology Mobile App

> Your personal Vedic astrology guide, powered by AI. Ask questions, explore your birth chart, and receive personalized astrological insights through text and voice.

---

## 📱 Screenshots

| Welcome | Birth Chart | AI Chat |
|---|---|---|
| Sign in / Register | Interactive Vedic wheel | Text & voice conversations |

---

## 🌟 Features

- **AI Chat** — Ask your AI astrologer anything via text or voice
- **Vedic Birth Chart** — Interactive SVG chart wheel with planetary positions and aspects
- **Voice Conversations** — Record audio questions and receive spoken responses
- **Birth Profile** — Enter your birth date, time, and location for personalized readings
- **Current Transits** — See how today's planetary positions affect your chart
- **JWT Authentication** — Secure login and registration with persistent sessions
- **Offline Detection** — Animated banner when internet connection is lost
- **Error Boundary** — Friendly crash screen instead of white screen of death
- **Dark Theme** — Deep space aesthetic with purple accents throughout
- **Haptic Feedback** — Tactile responses on button presses and actions

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 (React Native 0.81) |
| Language | TypeScript |
| Navigation | React Navigation v7 (Stack + Bottom Tabs) |
| UI Library | React Native Paper (Material Design 3) |
| HTTP Client | Axios with JWT interceptor |
| Storage | AsyncStorage |
| Audio | expo-av |
| Charts | Custom SVG (react-native-svg) |
| Haptics | expo-haptics |
| Network | @react-native-community/netinfo |
| Backend | FastAPI (Python) |

---

## 📂 Project Structure

```
ai-astro/
├── App.tsx                    # Root component with providers
├── app.config.js              # Expo dynamic config (env-aware)
├── index.ts                   # Entry point
├── assets/                    # Icons, splash screen
├── plugins/                   # Custom Expo plugins
└── src/
    ├── api/
    │   ├── client.ts          # Axios instance with JWT interceptor
    │   └── endpoints.ts       # All API calls (auth, chart, chat, voice)
    ├── components/
    │   ├── AudioPlayer.tsx    # Playback component for AI voice responses
    │   ├── ErrorBoundary.tsx  # Global JS crash catcher
    │   ├── MessageBubble.tsx  # Chat message component with markdown
    │   ├── OfflineBanner.tsx  # Animated no-internet banner
    │   ├── VedicChartWheel.tsx # Custom SVG birth chart
    │   └── VoiceRecorder.tsx  # Audio recording component
    ├── constants/
    │   └── theme.ts           # Color palette and MD3 theme
    ├── context/
    │   └── AuthContext.tsx    # Auth state, login, register, logout
    ├── navigation/
    │   ├── AppNavigator.tsx   # Authenticated tabs + stacks
    │   ├── AuthNavigator.tsx  # Login / Register / Welcome stack
    │   └── RootNavigator.tsx  # Auth gate (shows Auth or App)
    ├── screens/
    │   ├── BirthProfileInputScreen.tsx
    │   ├── ChartPreviewScreen.tsx
    │   ├── ChartViewScreen.tsx
    │   ├── ChatListScreen.tsx
    │   ├── ChatScreen.tsx
    │   ├── LoginScreen.tsx
    │   ├── ProfileScreen.tsx
    │   ├── SignUpScreen.tsx
    │   └── WelcomeScreen.tsx
    ├── types/
    │   └── index.ts           # TypeScript interfaces for all data models
    └── utils/
        └── haptics.ts         # Haptic feedback helpers
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- [Expo Go](https://expo.dev/go) app installed on your Android/iOS device
- Expo account (free at [expo.dev](https://expo.dev))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/greatyrrr/ai-astro.git
cd ai-astro

# 2. Install dependencies
npm install

# 3. Login to Expo
npx expo login

# 4. Start the development server
npx expo start
```

### Running on Device

```bash
# Via tunnel (works on any network)
npx expo start --tunnel

# Via LAN (phone and PC on same Wi-Fi)
npx expo start

# Clear cache if you see issues
npx expo start --clear
```

Scan the QR code with **Expo Go** on Android, or the **Camera app** on iOS.

---

## 🌐 Backend API

The app connects to a **FastAPI** backend at:

```
https://astroai.duckdns.org
```

### API Documentation

| Page | URL |
|---|---|
| Swagger UI (interactive) | `https://astroai.duckdns.org/docs` |
| ReDoc | `https://astroai.duckdns.org/redoc` |
| OpenAPI JSON | `https://astroai.duckdns.org/openapi.json` |

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT token |
| POST | `/birth-profiles` | Create birth profile |
| GET | `/birth-profiles/me` | Get my birth profile |
| GET | `/charts/me` | Get my Vedic birth chart |
| GET | `/charts/transits` | Get current planetary transits |
| GET | `/chat/conversations` | List all conversations |
| POST | `/chat/conversations` | Create new conversation |
| GET | `/chat/conversations/:id` | Get conversation with messages |
| POST | `/chat/conversations/:id/messages` | Send a text message |
| POST | `/chat/conversations/:id/voice` | Send a voice message |
| GET | `/chat/messages/:id/audio` | Get audio for a message |

### Authentication

All protected endpoints require a Bearer token in the header:

```
Authorization: Bearer <your_jwt_token>
```

### Registration Payload

```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "full_name": "Your Name",
  "birth_date": "1995-06-15",
  "birth_time": "10:30:00",
  "birth_location": "Mumbai, India",
  "gender": "Male"
}
```

> **Note:** `birth_date` must be `YYYY-MM-DD` and `birth_time` must be `HH:MM:SS`

---

## ⚙️ Environment Configuration

The app uses `app.config.js` for environment-aware configuration via `expo-constants`.

To switch between environments, set the `APP_ENV` variable at build time:

```bash
# Development (default — uses production URL)
npx expo start

# Production build
APP_ENV=production eas build --profile production
```

To use a local backend during development, edit `app.config.js`:

```js
const API_BASE_URL = IS_PROD
  ? "https://astroai.duckdns.org"
  : "http://localhost:8000"; // ← change this for local dev
```

---

## 📦 Building for Production

This project uses [EAS Build](https://docs.expo.dev/build/introduction/).

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build Android APK
eas build --platform android --profile preview

# Build Android AAB (Play Store)
eas build --platform android --profile production

# Build iOS
eas build --platform ios --profile production
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#0F0A1A` |
| Surface | `#1A1128` |
| Surface Light | `#251A38` |
| Primary | `#7C3AED` |
| Primary Light | `#A78BFA` |
| Secondary | `#F59E0B` |
| Text | `#F5F3FF` |
| Text Secondary | `#A8A0B8` |
| Border | `#2D2248` |
| Error | `#EF4444` |
| Success | `#10B981` |

---

## 🔐 Permissions

| Permission | Reason |
|---|---|
| `RECORD_AUDIO` | Voice message recording |
| `MODIFY_AUDIO_SETTINGS` | Audio playback configuration |
| Microphone (iOS) | Voice conversations with AI astrologer |

---

## 📋 Known Limitations

- Backend hosted on DuckDNS — may have occasional downtime
- No offline mode — requires internet for all AI features
- expo-av deprecation warning in SDK 54 (migration to expo-audio planned)

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is private and not licensed for public distribution.

---

<div align="center">
  <p>Built with ✦ and React Native</p>
</div>