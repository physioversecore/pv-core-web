import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "patient" | "therapist" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  city?: string;
  phone?: string;
  specialty?: string;
  status?: "active" | "pending";
}

interface AuthCtx {
  user: User | null;
  login: (email: string, _password: string, role: Role) => User;
  signupPatient: (data: Omit<User, "id" | "role">) => User;
  signupTherapist: (data: Omit<User, "id" | "role"> & { specialty: string }) => User;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "sahayatri.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem(KEY, JSON.stringify(u));
      else localStorage.removeItem(KEY);
    }
  };

  const login: AuthCtx["login"] = (email, _password, role) => {
    const u: User = {
      id: crypto.randomUUID(),
      name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role,
      city: "Kathmandu",
      status: "active",
    };
    persist(u);
    return u;
  };

  const signupPatient: AuthCtx["signupPatient"] = (data) => {
    const u: User = { ...data, id: crypto.randomUUID(), role: "patient", status: "active" };
    persist(u);
    return u;
  };

  const signupTherapist: AuthCtx["signupTherapist"] = (data) => {
    const u: User = { ...data, id: crypto.randomUUID(), role: "therapist", status: "pending" };
    persist(u);
    return u;
  };

  const logout = () => persist(null);

  return <Ctx.Provider value={{ user, login, signupPatient, signupTherapist, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
