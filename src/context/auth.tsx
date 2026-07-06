"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as AuthService from "@/services/api/auth";
import type { Role } from "@/types";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  city?: string;
  phone?: string;
  specialty?: string;
  status?: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: Role) => Promise<User>;
  signupPatient: (data: Omit<User, "id" | "role" | "status"> & { password: string }) => Promise<User>;
  signupTherapist: (data: Omit<User, "id" | "role" | "status"> & { password: string; specialty: string }) => Promise<User>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuthService.getSession()
      .then((session) => setUser(session as User | null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login: AuthCtx["login"] = async (email, password, role) => {
    const u = await AuthService.login(email, password, role);
    setUser(u as User);
    return u as User;
  };

  const signupPatient: AuthCtx["signupPatient"] = async (data) => {
    const u = await AuthService.signup({
      name: data.name,
      email: data.email,
      password: data.password,
      role: "PATIENT",
      city: data.city,
      phone: data.phone,
    });
    setUser(u as User);
    return u as User;
  };

  const signupTherapist: AuthCtx["signupTherapist"] = async (data) => {
    const u = await AuthService.signup({
      name: data.name,
      email: data.email,
      password: data.password,
      role: "THERAPIST",
      city: data.city,
      phone: data.phone,
      specialty: data.specialty,
    });
    setUser(u as User);
    return u as User;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, signupPatient, signupTherapist, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
