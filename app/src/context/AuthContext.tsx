import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail: string | null;
  setAuthenticated: (value: boolean) => void;
  setUserEmail: (value: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmailState] = useState<string | null>(null);

  const parseJwtEmail = (token: string): string | null => {
    const parts = token.split(".");
    if (parts.length < 2) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decode = typeof globalThis.atob === "function" ? globalThis.atob : null;

    if (!decode) {
      return null;
    }

    try {
      const payload = JSON.parse(decode(padded)) as { email?: string; sub?: string };
      if (typeof payload.email === "string") {
        return payload.email;
      }
      if (typeof payload.sub === "string" && payload.sub.includes("@")) {
        return payload.sub;
      }
    } catch {
      return null;
    }

    return null;
  };

  const setUserEmail = async (value: string | null) => {
    if (value) {
      await AsyncStorage.setItem("auth.email", value);
      setUserEmailState(value);
      return;
    }

    await AsyncStorage.removeItem("auth.email");
    setUserEmailState(null);
  };

  // Check stored token on app startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("auth.access_token");
        const storedEmail = await AsyncStorage.getItem("auth.email");
        const tokenEmail = token ? parseJwtEmail(token) : null;
        const resolvedEmail = storedEmail ?? tokenEmail;
        setAuthenticated(!!token);
        setUserEmailState(token ? resolvedEmail : null);

        if (token && !storedEmail && tokenEmail) {
          await AsyncStorage.setItem("auth.email", tokenEmail);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthenticated(false);
        setUserEmailState(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("auth.access_token");
      await AsyncStorage.removeItem("auth.email");
      setAuthenticated(false);
      setUserEmailState(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, userEmail, setAuthenticated, setUserEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
