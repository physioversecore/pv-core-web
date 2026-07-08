"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { AuthModal } from "@/components/modals/AuthModal";
import type { AuthMode } from "@/types";

interface AuthModalCtx {
  openAuth: (mode: AuthMode) => void;
  closeAuth: () => void;
}

const Ctx = createContext<AuthModalCtx | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null);

  const openAuth = (m: AuthMode) => setMode(m);
  const closeAuth = () => setMode(null);

  return (
    <Ctx.Provider value={{ openAuth, closeAuth }}>
      {children}
      <AuthModal open={mode !== null} mode={mode ?? "login"} onClose={closeAuth} />
    </Ctx.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
