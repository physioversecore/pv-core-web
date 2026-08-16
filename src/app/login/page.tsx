"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleIcon } from "@/components/auth/GoogleIcon";

const ROLE_HOME: Record<string, string> = {
  patient: "/patient",
  therapist: "/therapist",
  admin: "/admin",
};

function resolveCallbackUrl(callbackUrl: string | null, role: string): string {
  if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    const allowedPrefixes = ["/patient", "/therapist", "/admin"];
    if (allowedPrefixes.some((p) => callbackUrl === p || callbackUrl.startsWith(p + "/"))) {
      const requiredRole = callbackUrl.startsWith("/patient") ? "patient" : callbackUrl.startsWith("/therapist") ? "therapist" : "admin";
      if (role === requiredRole) return callbackUrl;
    }
  }
  return ROLE_HOME[role] ?? "/";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "h-12 w-full rounded-md border border-[#d8dadd] bg-white px-3.5 text-[15px] text-text placeholder:text-[15px] placeholder:text-text-light/60 transition-colors focus:border-voltage-lime focus:outline-none focus:ring-4 focus:ring-voltage-lime/15";

const primaryBtnClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-mid-abyss px-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#0a3a3e] active:bg-[#031a1d] disabled:cursor-not-allowed disabled:opacity-50";

const googleBtnClass =
  "inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-md border border-[#d8dadd] bg-white px-4 text-sm font-medium text-[#3c4043] transition-colors hover:bg-neutral-50 active:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50";

export default function LoginPage() {
  const { t } = useLang();
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;
    if (!loading && user) {
      redirected.current = true;
      router.replace(resolveCallbackUrl(callbackUrl, user.role));
    }
  }, [loading, user, router, callbackUrl]);

  const handleEmailContinue = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = email.trim();
    if (!value || !EMAIL_RE.test(value)) {
      setEmailError(t("auth.invalidEmail"));
      return;
    }
    setEmailError(null);
    setStep("password");
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError(t("auth.errorEmailPassword"));
      return;
    }
    setSubmitting(true);
    try {
      const u = await login(email.trim(), password, "patient");
      toast.success(t("auth.successWelcome") + ", " + u.name);
      redirected.current = true;
      router.replace(resolveCallbackUrl(callbackUrl, u.role));
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      if (status === 403) {
        const msg = err instanceof Error ? err.message : "";
        setError(/not approved/i.test(msg) ? t("auth.loginRejected") : t("auth.loginUnderReview"));
      } else {
        setError(err instanceof Error ? err.message : t("auth.errorLoginFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = () => toast.info(t("auth.googleComingSoon"));

  return (
    <AuthShell>
      <h1 className="mt-7 text-[24px] font-semibold leading-tight tracking-[-0.01em] text-text">
        {t("auth.authTitle")}
      </h1>

      <div className="mt-7">
        <button type="button" onClick={handleGoogle} className={googleBtnClass}>
          <GoogleIcon className="h-5 w-5 shrink-0" />
          {t("auth.continueGoogle")}
        </button>
      </div>

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[#e5e5e5]" />
        <span className="text-[13px] text-text-muted">{t("auth.orDivider")}</span>
        <span className="h-px flex-1 bg-[#e5e5e5]" />
      </div>

      {step === "email" ? (
        <form onSubmit={handleEmailContinue} noValidate>
          <div>
            <label htmlFor="auth-email" className="sr-only">
              {t("auth.emailAddress")}
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              placeholder={t("auth.emailAddress")}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "auth-email-error" : undefined}
              className={inputClass}
            />
          </div>
          <p id="auth-email-error" role="alert" className="mt-2 min-h-[18px] text-[13px] leading-[18px] text-red-500">
            {emailError ?? ""}
          </p>
          <button type="submit" className={`${primaryBtnClass} mt-1`}>
            {t("auth.continueEmail")}
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin} noValidate>
          {/*<button
            type="button"
            onClick={() => {
              setStep("email");
              setPassword("");
              setShowPw(false);
              setError(null);
            }}
            className="inline-flex cursor-pointer items-center gap-1 text-[13px] font-medium text-text-light transition-colors hover:text-text"
          >
            <ArrowLeft size={14} /> {t("auth.backBtn")}
          </button>*/}

          <p className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] text-text-light">
            <span>{t("auth.loggingInAs")}</span>
            <span className="font-medium text-text">{email}</span>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="cursor-pointer font-medium text-secondary hover:underline"
            >
              {t("common.edit")}
            </button>
          </p>

          <div className="relative mt-5">
            <label htmlFor="auth-password" className="sr-only">
              {t("auth.labelPassword")}
            </label>
            <input
              id="auth-password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder={t("auth.placeholderPassword")}
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 text-text-light transition-colors hover:text-text"
              aria-label={showPw ? t("auth.hidePassword") : t("auth.showPassword")}
            >
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-[13px] font-medium text-secondary hover:underline">
              {t("common.forgotPassword")}
            </Link>
          </div>

          <p role="alert" className="mt-3 min-h-[18px] text-[13px] leading-[18px] text-red-500">
            {error ?? ""}
          </p>
          <button type="submit" disabled={submitting || !password} className={`${primaryBtnClass} mt-1`}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.loginBtn")}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-[14px] text-text-light">
        {t("auth.physioPrompt")}{" "}
        <Link href="/signup?role=therapist" className="font-sans underline text-blue-400">
          {t("common.applyToJoin")}
        </Link>
      </p>
    </AuthShell>
  );
}
