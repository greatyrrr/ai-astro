/**
 * app.config.js — Expo dynamic config
 *
 * Replaces app.json for environment-aware configuration.
 * The static app.json is still read but values here override it.
 *
 * Set APP_ENV=production when building production APK/IPA.
 * Otherwise defaults to the production URL (same server, both envs).
 *
 * Usage in EAS:
 *   eas build --profile production  => APP_ENV=production
 */

const IS_PROD = process.env.APP_ENV === "production";

const API_BASE_URL = IS_PROD
  ? "https://astroai.duckdns.org"
  : "https://astroai.duckdns.org"; // swap to http://localhost:8000 for local dev

module.exports = {
  expo: {
    name: "AstroAI",
    slug: "astro-ai",
    version: "1.2.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#FFFFFF",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.astroai.mobile",
      infoPlist: {
        NSMicrophoneUsageDescription:
          "AstroAI needs microphone access for voice conversations with your AI astrologer.",
      },
    },
    android: {
      package: "com.astroai.mobile",
      usesCleartextTraffic: true,
      versionCode: 3,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "RECORD_AUDIO",
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
      ],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "expo-av",
        {
          microphonePermission:
            "AstroAI needs microphone access for voice conversations.",
        },
      ],
      "@react-native-community/datetimepicker",
    ],
    extra: {
      /**
       * apiBaseUrl — consumed by src/api/client.ts via expo-constants.
       * Change APP_ENV env variable to switch environments without
       * touching source code.
       */
      apiBaseUrl: API_BASE_URL,
      eas: {
        projectId: "1ab0b03c-3e0a-4aac-bfc1-1f2a5c0fda82",
      },
    },
    owner: "mayurg729s-organization",
  },
};
