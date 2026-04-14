import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// ---------------------------------------------------------------------------
// Base URL — read from app.config.js via expo-constants.
// This means the URL can be changed per-environment (dev/staging/prod)
// by setting APP_ENV env variable, without touching source code.
// Fallback to the production URL for safety.
// ---------------------------------------------------------------------------
const BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  "https://astroai.duckdns.org";

// ---------------------------------------------------------------------------
// Logout callback — registered by AuthContext so the 401 interceptor can
// trigger navigation without a circular dependency.
// ---------------------------------------------------------------------------
type LogoutCallback = () => Promise<void>;
let _logoutCallback: LogoutCallback | null = null;

/** Called once by AuthContext on mount to wire up auto-logout. */
export function setLogoutCallback(fn: LogoutCallback): void {
  _logoutCallback = fn;
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — clear token AND trigger navigation to Login
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
      // Trigger AuthContext logout → RootNavigator re-renders → Login shown
      if (_logoutCallback) {
        try {
          await _logoutCallback();
        } catch {
          // ignore errors from logout callback
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;
