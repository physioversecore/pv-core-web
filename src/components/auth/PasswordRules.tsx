"use client";

import { Check, ShieldCheck } from "lucide-react";
import { cn } from "@/utils/cn";
import { useLang } from "@/context/i18n";

type Strength = "weak" | "fair" | "good" | "strong" | "veryStrong";

type StrengthKey =
  | "Weak"
  | "Fair"
  | "Good"
  | "Strong"
  | "VeryStrong";

const STRENGTH_KEY: Record<Strength, StrengthKey> = {
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
  veryStrong: "VeryStrong",
};

const STRENGTH_CLASS: Record<Strength, string> = {
  weak: "text-danger",
  fair: "text-warning",
  good: "text-success",
  strong: "text-success font-bold",
  veryStrong: "text-success font-bold",
};

const RULES = [
  { test: (pw: string) => pw.length >= 8, label: "At least 8 characters" },
  { test: (pw: string) => /[A-Z]/.test(pw), label: "One uppercase letter" },
  { test: (pw: string) => /[a-z]/.test(pw), label: "One lowercase letter" },
  { test: (pw: string) => /[0-9]/.test(pw), label: "One number" },
  { test: (pw: string) => /[^A-Za-z0-9]/.test(pw), label: "One special character" },
];

export function PasswordRules({ password, showRules = false }: { password: string; showRules?: boolean }) {
  const { t } = useLang();

  const metCount = RULES.map((r) => r.test(password)).filter(Boolean).length;

  const strength: Strength =
    metCount <= 1 ? "weak" : metCount === 2 ? "fair" : metCount === 3 ? "good" : metCount === 4 ? "strong" : "veryStrong";

  return (
    <div className="rounded-lg border border-[#e5e5e5] bg-[#f9f9f9] p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-text-light flex items-center gap-1.5">
          <ShieldCheck size={14} />
          Password Strength
        </p>
        {password.length > 0 && (
          <span className={cn("text-xs uppercase font-mono font-bold tracking-wide transition-colors", STRENGTH_CLASS[strength])}>
            {STRENGTH_KEY[strength]}
          </span>
        )}
      </div>
      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-200",
              i < metCount ? "bg-success" : "bg-[#e0e0e0]",
            )}
          />
        ))}
      </div>
      {showRules && (
        <ul className="space-y-1.5">
          {RULES.map((rule) => {
            const met = rule.test(password);
            return (
              <li key={rule.label} className="flex items-center gap-2 text-[12px] leading-[16px]">
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors",
                    met ? "bg-success text-white" : "bg-[#e0e0e0] text-transparent"
                  )}
                >
                  <Check size={10} strokeWidth={3} />
                </span>
                <span className={cn(met ? "text-text" : "text-text-light")}>{rule.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
