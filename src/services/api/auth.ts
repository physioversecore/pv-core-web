"use server";

import { api } from "./client";
import { setToken, removeToken } from "./session";

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: "patient" | "therapist" | "admin";
  city?: string;
  phone?: string;
  specialty?: string;
  status?: string;
}

interface AuthResponse {
  access_token: string | null;
  token_type: string;
  user: UserData;
}

export async function login(email: string, password: string, role: string) {
  const data = await api.post<AuthResponse>("/auth/login", { email, password });
  if (data.access_token) {
    await setToken(data.access_token);
  }
  return { ...data.user, role: data.user.role.toLowerCase() as UserData["role"] };
}

export interface SignupDocument {
  documentType: string;
  url: string;
  fileName?: string;
  fileSize?: number;
}

export interface SignupTherapistData {
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

export async function signup(data: SignupTherapistData) {
  const res = await api.post<AuthResponse>("/auth/signup", data);
  if (res.access_token) {
    await setToken(res.access_token);
  }
  return { ...res.user, role: res.user.role.toLowerCase() as UserData["role"] };
}

export async function sendOtp(email: string, name: string) {
  return api.post<{ message: string; resend_after: number }>("/auth/send-otp", { email, name });
}

export async function forgotPassword(email: string, name: string) {
  return api.post<{ message: string; resend_after: number }>("/auth/forgot-password", { email, name });
}

export async function resetPassword(email: string, code: string, new_password: string) {
  return api.post<void>("/auth/reset-password", { email, code, new_password });
}

export async function verifyOtp(email: string, code: string, purpose = "signup") {
  return api.post<{ verified: boolean }>("/auth/verify-otp", { email, code, purpose });
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // ignore server errors on logout
  }
  await removeToken();
}

export async function getSession(): Promise<UserData | null> {
  try {
    const user = await api.get<UserData>("/auth/me");
    return { ...user, role: user.role.toLowerCase() as UserData["role"] };
  } catch {
    return null;
  }
}

export async function updateProfile(data: Partial<UserData>) {
  return api.put<UserData>("/auth/me", data);
}
