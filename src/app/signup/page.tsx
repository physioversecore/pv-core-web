"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";
import { signup } from "@/services/auth-flow";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordRules } from "@/components/auth/PasswordRules";
import { InlineError } from "@/components/common/InlineError";

const inputClass =
  "h-11 w-full rounded-[7px] border border-[#d8dadd] bg-white px-3.5 text-[14px] text-text placeholder:text-[14px] placeholder:text-text-light/60 transition-colors focus:border-voltage-lime focus:outline-none focus:ring-4 focus:ring-voltage-lime/15";

const labelClass = "block text-[13px] font-medium text-[#555] mb-2";

export default function SignupPage() {
  const { t } = useLang();
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;
    if (!loading && user) {
      redirected.current = true;
      router.replace(user.role === "patient" ? "/patient" : user.role === "therapist" ? "/therapist" : "/admin");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Valid email is required";
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signup({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        password,
        role: "PATIENT",
      });
      toast.success("Account created! Welcome to Sahayatri Physio.");
      router.replace("/patient");
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      if (status === 409) {
        setError("An account with this email already exists. Try logging in instead.");
      } else {
        setError(err instanceof Error ? err.message : "We couldn't create your account. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell maxWidth={504}>
      <h1 className="mt-7 text-[28px] font-semibold leading-[1.15] tracking-[-0.01em] text-text sm:text-[30px]">
        Sign up for free
      </h1>

      <p className="mt-3 text-[14px] leading-[1.55] text-text-light max-w-[420px]">
        Create an account to book home-visit physiotherapy, track your recovery, and connect with verified professionals.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Name fields */}
        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
          <div>
            <label htmlFor="signup-first" className={labelClass}>{t("auth.labelFirstName")}</label>
            <input
              id="signup-first"
              name="given-name"
              autoComplete="given-name"
              autoFocus
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); if (fieldErrors.firstName) setFieldErrors((p) => { const n = { ...p }; delete n.firstName; return n; }); }}
              placeholder={t("auth.placeholderFirstName")}
              className={inputClass}
            />
            {fieldErrors.firstName && <p className="mt-1.5 text-[12px] text-red-500">{fieldErrors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="signup-last" className={labelClass}>{t("auth.labelLastName")}</label>
            <input
              id="signup-last"
              name="family-name"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); if (fieldErrors.lastName) setFieldErrors((p) => { const n = { ...p }; delete n.lastName; return n; }); }}
              placeholder={t("auth.placeholderLastName")}
              className={inputClass}
            />
            {fieldErrors.lastName && <p className="mt-1.5 text-[12px] text-red-500">{fieldErrors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className={labelClass}>{t("auth.labelEmail")}</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors((p) => { const n = { ...p }; delete n.email; return n; }); }}
            placeholder={t("auth.placeholderEmail")}
            className={inputClass}
          />
          {fieldErrors.email && <p className="mt-1.5 text-[12px] text-red-500">{fieldErrors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className={labelClass}>{t("auth.labelPassword")}</label>
          <div className="relative">
            <input
              id="signup-password"
              name="new-password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((p) => { const n = { ...p }; delete n.password; return n; }); }}
              placeholder={t("auth.placeholderPassword")}
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-text-light transition-colors hover:text-text"
              aria-label={showPw ? t("auth.hidePassword") : t("auth.showPassword")}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && <p className="mt-1.5 text-[12px] text-red-500">{fieldErrors.password}</p>}
          <div className="mt-3">
            <PasswordRules password={password} />
          </div>
        </div>

        {/* Legal */}
        <p className="text-[13px] leading-[1.5] text-[#444]">
          By clicking &quot;Create account&quot;, I agree to the{" "}
          <Link href="/terms" className="underline hover:text-text">Terms of Service</Link>{" "}
          and have read the{" "}
          <Link href="/privacy" className="underline hover:text-text">Privacy Policy</Link>.
        </p>

        {/* Error */}
        <InlineError message={error} />

        {/* CTA row */}
        <div className="flex flex-col-reverse items-stretch gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] text-text-light text-center sm:text-left">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link href="/access" className="font-semibold text-secondary hover:underline">{t("auth.loginBtn")}</Link>
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] bg-mid-abyss px-7 text-[14px] font-semibold text-white transition-colors hover:bg-[#0a3a3e] active:bg-[#031a1d] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
