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
  access_token: string;
  token_type: string;
  user: UserData;
}

export async function login(email: string, password: string, role: string) {
  const data = await api.post<AuthResponse>("/auth/login", { email, password });
  await setToken(data.access_token);
  return { ...data.user, role: data.user.role.toLowerCase() as UserData["role"] };
}

export async function signup(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  city?: string;
  phone?: string;
  specialty?: string;
}) {
  const res = await api.post<AuthResponse>("/auth/signup", data);
  await setToken(res.access_token);
  return { ...res.user, role: res.user.role.toLowerCase() as UserData["role"] };
}

export async function sendOtp(email: string, name: string) {
  return api.post<{ message: string }>("/auth/send-otp", { email, name });
}

export async function verifyOtp(email: string, code: string) {
  return api.post<{ verified: boolean }>("/auth/verify-otp", { email, code });
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
