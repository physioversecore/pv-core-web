"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AuthModal } from "@/components/modals/AuthModal";
import type { AuthMode } from "@/types";

type SignupRole = "patient" | "therapist" | null;

interface AuthModalCtx {
  openAuth: (mode: AuthMode, signupRole?: SignupRole) => void;
  closeAuth: () => void;
  onLoginSuccess: (() => void) | null;
  setOnLoginSuccess: (cb: (() => void) | null) => void;
}

const Ctx = createContext<AuthModalCtx | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [signupRole, setSignupRole] = useState<SignupRole>(null);
  const [loginSuccessCb, setLoginSuccessCb] = useState<(() => void) | null>(null);

  const openAuth = (m: AuthMode, role?: SignupRole) => {
    setMode(m);
    setSignupRole(role ?? null);
  };
  const closeAuth = () => {
    setMode(null);
    setSignupRole(null);
    setLoginSuccessCb(null);
  };

  const setOnLoginSuccess = useCallback((cb: (() => void) | null) => {
    setLoginSuccessCb(() => cb);
  }, []);

  return (
    <Ctx.Provider value={{ openAuth, closeAuth, onLoginSuccess: loginSuccessCb, setOnLoginSuccess }}>
      {children}
      <AuthModal open={mode !== null} mode={mode ?? "access"} onClose={closeAuth} onLoginSuccess={loginSuccessCb} defaultSignupRole={signupRole} />
    </Ctx.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
