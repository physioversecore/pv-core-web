"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as AuthService from "@/services/api/auth";
import type { SignupDocument } from "@/services/api/auth";
import { googleAuth, loginWithOtp as clientLoginWithOtp } from "@/services/auth-flow";
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
  photo?: string;
}

export interface TherapistSignupData extends Omit<User, "id" | "role" | "status"> {
  password: string;
  specialty: string;
  gender?: string;
  license?: string;
  experience?: number;
  fee?: number;
  bio?: string;
  documents?: SignupDocument[];
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: Role) => Promise<User>;
  signupPatient: (data: Omit<User, "id" | "role" | "status"> & { password: string }) => Promise<User>;
  signupTherapist: (data: TherapistSignupData) => Promise<User>;
  loginWithGoogle: (credential: string, role?: string) => Promise<User>;
  loginWithOtp: (email: string, code: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
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
    setLoading(true);
    try {
      const u = await AuthService.login(email, password, role);
      setUser(u as User);
      return u as User;
    } finally {
      setLoading(false);
    }
  };

  const signupPatient: AuthCtx["signupPatient"] = async (data) => {
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  };

  const signupTherapist: AuthCtx["signupTherapist"] = async (data) => {
    setLoading(true);
    try {
      const u = await AuthService.signup({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "THERAPIST",
        city: data.city,
        phone: data.phone,
        specialty: data.specialty,
        gender: data.gender,
        license: data.license,
        experience: data.experience,
        fee: data.fee,
        bio: data.bio,
        documents: data.documents,
      });
      setUser(u as User);
      return u as User;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle: AuthCtx["loginWithGoogle"] = async (credential, role = "PATIENT") => {
    setLoading(true);
    try {
      const u = await googleAuth(credential, role);
      setUser(u as User);
      return u as User;
    } finally {
      setLoading(false);
    }
  };

  const loginWithOtp: AuthCtx["loginWithOtp"] = async (email, code) => {
    setLoading(true);
    try {
      const u = await clientLoginWithOtp(email, code);
      setUser(u as User);
      return u as User;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const refreshSession = async () => {
    const session = await AuthService.getSession();
    if (session) setUser(session as User);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, signupPatient, signupTherapist, loginWithGoogle, loginWithOtp, logout, refreshSession }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
