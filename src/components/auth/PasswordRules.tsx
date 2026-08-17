"use client";

import { ShieldCheck } from "lucide-react";
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

export function PasswordRules({ password }: { password: string }) {
  const { t } = useLang();

  const metCount = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const strength: Strength =
    metCount <= 1 ? "weak" : metCount === 2 ? "fair" : metCount === 3 ? "good" : metCount === 4 ? "strong" : "veryStrong";

  return (
    <div className="border-2 rounded-sm  border-dotted p-2">
      <div className="flex items-center justify-between mb-2">
        <p className=" text-sm label-ink text-text-light flex items-center gap-1.5">
          <ShieldCheck size={14} />
          Password Strength
        </p>
        {password.length > 0 && (
          <span className={cn("text-xs uppercase font-mono font-bold tracking-wide transition-colors", STRENGTH_CLASS[strength])}>
            {STRENGTH_KEY[strength]}
          </span>
        )}
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full border transition-all duration-200",
              i < metCount ? "bg-success scale-y-110" : "bg-surface",
            )}
          />
        ))}
      </div>
    </div>
  );
}
