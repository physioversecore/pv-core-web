import type { SignupDocument } from "@/services/api/auth";

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: string;
  city?: string;
  phone?: string;
  specialty?: string;
  gender?: string;
  license?: string;
  experience?: number;
  fee?: number;
  bio?: string;
  documents?: SignupDocument[];
}

interface AuthFlowUser {
  id: string;
  name: string;
  email: string;
  role: string;
  city?: string;
  phone?: string;
  specialty?: string;
  status?: string;
}

interface AuthFlowResponse {
  access_token: string | null;
  token_type: string;
  user: AuthFlowUser;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const err = new Error(data?.detail ?? `API error ${res.status}`);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }

  return res.json();
}

export async function sendOtp(email: string, name: string) {
  return post<{ message: string; resend_after: number }>("/api/v1/auth/send-otp", {
    email,
    name,
  });
}

export async function verifyOtp(email: string, code: string, purpose = "signup") {
  return post<{ verified: boolean }>("/api/v1/auth/verify-otp", {
    email,
    code,
    purpose,
  });
}

export async function signup(data: SignupData): Promise<AuthFlowUser> {
  const res = await post<AuthFlowResponse>("/api/v1/auth/signup", data);
  return { ...res.user, role: res.user.role.toLowerCase() };
}
