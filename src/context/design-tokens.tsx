"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_TOKENS,
  type DesignTokens,
} from "@/types/design-tokens";

interface DesignTokensCtx {
  tokens: DesignTokens;
  updateColors: (patch: Partial<DesignTokens["colors"]>) => void;
  updateTypography: (patch: Partial<DesignTokens["typography"]>) => void;
  updateRadii: (patch: Partial<DesignTokens["radii"]>) => void;
  resetTokens: () => void;
  isLoaded: boolean;
}

const Ctx = createContext<DesignTokensCtx | null>(null);

const STORAGE_KEY = "pvc-design-tokens";

function applyTokens(t: DesignTokens) {
  const r = document.documentElement.style;
  const c = t.colors;

  r.setProperty("--color-primary", c.primary);
  r.setProperty("--color-primary-hover", c.primaryHover);
  r.setProperty("--color-primary-light", c.primaryLight);
  r.setProperty("--color-primary-dark", c.primaryDark);
  r.setProperty("--color-secondary", c.secondary);
  r.setProperty("--color-secondary-hover", c.secondaryHover);
  r.setProperty("--color-background", c.background);
  r.setProperty("--color-surface", c.surface);
  r.setProperty("--color-card", c.card);
  r.setProperty("--color-text", c.text);
  r.setProperty("--color-text-light", c.textLight);
  r.setProperty("--color-text-muted", c.textMuted);
  r.setProperty("--color-text-inverse", c.textInverse);
  r.setProperty("--color-border", c.border);
  r.setProperty("--color-border-light", c.borderLight);
  r.setProperty("--color-divider", c.divider);
  r.setProperty("--color-danger", c.danger);
  r.setProperty("--color-success", c.success);
  r.setProperty("--color-warning", c.warning);
  r.setProperty("--color-info", c.info);

  r.setProperty("--font-display", t.typography.fontDisplay);
  r.setProperty("--font-sans", t.typography.fontSans);
  r.setProperty("--font-mono", t.typography.fontMono);
  r.setProperty("--radius", t.radii.base);

  r.setProperty("--background", c.background);
  r.setProperty("--foreground", c.text);
  r.setProperty("--card", c.card);
  r.setProperty("--card-foreground", c.text);
  r.setProperty("--popover", c.card);
  r.setProperty("--popover-foreground", c.text);
  r.setProperty("--primary", c.primary);
  r.setProperty("--primary-foreground", c.textInverse);
  r.setProperty("--secondary", c.surface);
  r.setProperty("--secondary-foreground", c.text);
  r.setProperty("--muted", c.surface);
  r.setProperty("--muted-foreground", c.textLight);
  r.setProperty("--accent", c.primary);
  r.setProperty("--accent-foreground", c.textInverse);
  r.setProperty("--border", c.border);
  r.setProperty("--input", c.divider);
  r.setProperty("--ring", c.primary);
}

function mergeTokens(
  base: DesignTokens,
  saved: Partial<DesignTokens>,
): DesignTokens {
  return {
    colors: { ...base.colors, ...saved.colors },
    typography: { ...base.typography, ...saved.typography },
    radii: { ...base.radii, ...saved.radii },
  };
}

export function DesignTokensProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<DesignTokens>(DEFAULT_TOKENS);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPayload = useRef<DesignTokens | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let saved: Partial<DesignTokens> = {};

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) saved = JSON.parse(stored);
      } catch {}

      try {
        const res = await fetch("/api/v1/admin/settings/design-tokens");
        if (res.ok) {
          const server = await res.json();
          if (server?.tokens) {
            saved = server.tokens;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(server.tokens));
          }
        }
      } catch {}

      if (!cancelled) {
        const merged = mergeTokens(DEFAULT_TOKENS, saved);
        setTokens(merged);
        applyTokens(merged);
        setIsLoaded(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const persist = useCallback((next: DesignTokens) => {
    setTokens(next);
    applyTokens(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    pendingPayload.current = next;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const payload = pendingPayload.current;
      if (!payload) return;
      pendingPayload.current = null;
      fetch("/api/v1/admin/settings/design-tokens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens: payload }),
      }).catch(() => {});
    }, 500);
  }, []);

  const updateColors = useCallback(
    (patch: Partial<DesignTokens["colors"]>) => {
      persist({ ...tokens, colors: { ...tokens.colors, ...patch } });
    },
    [tokens, persist],
  );

  const updateTypography = useCallback(
    (patch: Partial<DesignTokens["typography"]>) => {
      persist({ ...tokens, typography: { ...tokens.typography, ...patch } });
    },
    [tokens, persist],
  );

  const updateRadii = useCallback(
    (patch: Partial<DesignTokens["radii"]>) => {
      persist({ ...tokens, radii: { ...tokens.radii, ...patch } });
    },
    [tokens, persist],
  );

  const resetTokens = useCallback(() => {
    persist(DEFAULT_TOKENS);
    localStorage.removeItem(STORAGE_KEY);
  }, [persist]);

  return (
    <Ctx.Provider
      value={{ tokens, updateColors, updateTypography, updateRadii, resetTokens, isLoaded }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useDesignTokens() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDesignTokens must be used within DesignTokensProvider");
  return ctx;
}
