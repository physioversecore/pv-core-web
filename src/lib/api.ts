import "server-only";
import { getToken } from "./session";

const BASE = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");

export class AuthError extends Error {
  constructor(message?: string) {
    super(message ?? "Not authenticated");
    this.name = "AuthError";
  }
}

async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (res.status !== 204) {
    const body = await res.json().catch(() => null);
    const message =
      body?.detail ?? body?.message ?? `API error ${res.status}: ${res.statusText}`;
    if (res.status === 401) throw new AuthError(message);
    if (!res.ok) throw new Error(message);
    return body as T;
  }

  return undefined as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),
};
