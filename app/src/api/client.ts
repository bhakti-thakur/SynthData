import { getAccessToken } from "./tokenStorage";

export const API_BASE_URL = "http://localhost:8000";

let isInitialized = false;
let originalFetchRef: typeof fetch | null = null;

function shouldAttachAuth(url: string): boolean {
  return (
    url.startsWith(`${API_BASE_URL}/generate`) ||
    url.startsWith(`${API_BASE_URL}/download`) ||
    url.startsWith(`${API_BASE_URL}/evaluate`) ||
    url.startsWith(`${API_BASE_URL}/history`)
  );
}

export function initializeApiClient(): void {
  if (isInitialized) {
    return;
  }

  originalFetchRef = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (!shouldAttachAuth(url)) {
      return originalFetchRef!(input, init);
    }

    const token = await getAccessToken();
    if (!token) {
      return originalFetchRef!(input, init);
    }

    const sourceHeaders =
      init?.headers ?? (typeof input !== "string" && !(input instanceof URL) ? input.headers : undefined);

    const headers = new Headers(sourceHeaders);
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return originalFetchRef!(input, {
      ...init,
      headers,
    });
  };

  isInitialized = true;
}
