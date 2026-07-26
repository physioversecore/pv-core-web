"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AuthModal } from "@/components/modals/AuthModal";
import type { AuthMode } from "@/types";

interface AuthModalCtx {
  openAuth: (mode: AuthMode) => void;
  closeAuth: () => void;
  onLoginSuccess: (() => void) | null;
  setOnLoginSuccess: (cb: (() => void) | null) => void;
}

const Ctx = createContext<AuthModalCtx | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [loginSuccessCb, setLoginSuccessCb] = useState<(() => void) | null>(null);

  const openAuth = (m: AuthMode) => setMode(m);
  const closeAuth = () => {
    setMode(null);
    setLoginSuccessCb(null);
  };

  const setOnLoginSuccess = useCallback((cb: (() => void) | null) => {
    setLoginSuccessCb(() => cb);
  }, []);

  return (
    <Ctx.Provider value={{ openAuth, closeAuth, onLoginSuccess: loginSuccessCb, setOnLoginSuccess }}>
      {children}
      <AuthModal open={mode !== null} mode={mode ?? "login"} onClose={closeAuth} onLoginSuccess={loginSuccessCb} />
    </Ctx.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
