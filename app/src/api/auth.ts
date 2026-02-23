import { API_BASE_URL } from "./client";
import { clearAccessToken, setAccessToken } from "./tokenStorage";

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export async function register(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.detail ?? "Register failed");
  }

  await setAccessToken(payload.access_token);
  return payload as AuthResponse;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.detail ?? "Login failed");
  }

  await setAccessToken(payload.access_token);
  return payload as AuthResponse;
}

export async function logoutLocal(): Promise<void> {
  await clearAccessToken();
}
