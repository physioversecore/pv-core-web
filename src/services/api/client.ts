import "server-only";
import { getToken } from "./session";

const BASE = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");

export class AuthError extends Error {
  status: number;
  constructor(message?: string) {
    super(message ?? "Not authenticated");
    this.name = "AuthError";
    this.status = 401;
  }
}

function apiError(message: string, status: number): Error {
  const err = new Error(message);
  (err as Error & { status: number }).status = status;
  return err;
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

  const body = res.status !== 204 ? await res.json().catch(() => null) : null;
  const message =
    body?.detail ?? body?.message ?? `API error ${res.status}: ${res.statusText}`;

  if (res.status === 401) {
    throw new AuthError(message);
  }

  if (!res.ok) {
    throw apiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
};
