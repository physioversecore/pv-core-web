"use client";

import { ShieldCheck } from "lucide-react";
import { cn } from "@/utils/cn";
import { useLang } from "@/context/i18n";

type Strength = "weak" | "fair" | "good" | "strong" | "veryStrong";

type StrengthKey =
  | "auth.passwordStrengthWeak"
  | "auth.passwordStrengthFair"
  | "auth.passwordStrengthGood"
  | "auth.passwordStrengthStrong"
  | "auth.passwordStrengthVeryStrong";

const STRENGTH_KEY: Record<Strength, StrengthKey> = {
  weak: "auth.passwordStrengthWeak",
  fair: "auth.passwordStrengthFair",
  good: "auth.passwordStrengthGood",
  strong: "auth.passwordStrengthStrong",
  veryStrong: "auth.passwordStrengthVeryStrong",
};

const STRENGTH_CLASS: Record<Strength, string> = {
  weak: "text-danger",
  fair: "text-text-light",
  good: "text-moss",
  strong: "text-moss font-bold",
  veryStrong: "text-moss font-bold",
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
    <div className="border-3 rounded-sm  border-dotted p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="label-ink text-text-light flex items-center gap-1.5">
          <ShieldCheck size={14} />
          {t("auth.passwordStrengthTitle")}
        </p>
        {password.length > 0 && (
          <span className={cn("text-xs uppercase font-mono font-bold tracking-wide transition-colors", STRENGTH_CLASS[strength])}>
            {t(STRENGTH_KEY[strength])}
          </span>
        )}
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2.5 flex-1 rounded-full border-2 border-carbon-soft transition-all duration-200",
              i < metCount ? "bg-moss scale-y-110" : "bg-surface",
            )}
          />
        ))}
      </div>
    </div>
  );
}
