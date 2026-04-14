import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "../api/endpoints";
import { getBirthProfile } from "../api/endpoints";
import { setLogoutCallback } from "../api/client";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  hasProfile: boolean;
  sessionExpiredMessage: string | null;
  clearSessionExpiredMessage: () => void;
  setHasProfile: (v: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    birthDate: string,
    birthTime: string,
    birthLocation: string,
    gender?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  token: null,
  isAuthenticated: false,
  loading: true,
  hasProfile: false,
  sessionExpiredMessage: null,
  clearSessionExpiredMessage: () => {},
  setHasProfile: () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  // Keep a stable ref to logout so it can be passed to the Axios interceptor
  // without creating a circular dependency or stale-closure issues.
  const logoutRef = useRef<() => Promise<void>>(async () => {});

  // Load stored token on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("token");
        if (stored) {
          setToken(stored);
          try {
            await getBirthProfile();
            setHasProfile(true);
          } catch {
            setHasProfile(false);
          }
        }
      } catch (err) {
        console.error("[AuthContext] Error loading stored token:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Register a logout callback with the Axios interceptor so 401 responses
  // automatically clear the auth state and redirect to Login.
  useEffect(() => {
    const logoutFn = async () => {
      await AsyncStorage.removeItem("token");
      setToken(null);
      setHasProfile(false);
      setSessionExpiredMessage("Session expired, please log in again");
    };
    logoutRef.current = logoutFn;
    setLogoutCallback(logoutFn);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { access_token } = await api.login(email, password);
      await AsyncStorage.setItem("token", access_token);
      setToken(access_token);
      setSessionExpiredMessage(null);
      try {
        await getBirthProfile();
        setHasProfile(true);
      } catch {
        setHasProfile(false);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    birthDate: string,
    birthTime: string,
    birthLocation: string,
    gender: string = "Other"
  ) => {
    try {
      const { access_token } = await api.register(
        email,
        password,
        name,
        birthDate,
        birthTime,
        birthLocation,
        gender
      );
      await AsyncStorage.setItem("token", access_token);
      setToken(access_token);
      setHasProfile(true);
      setSessionExpiredMessage(null);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    setHasProfile(false);
    setSessionExpiredMessage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        loading,
        hasProfile,
        sessionExpiredMessage,
        clearSessionExpiredMessage: () => setSessionExpiredMessage(null),
        setHasProfile,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
