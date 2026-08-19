"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";
import { sendLoginOtp, sendOtp, verifyOtp, signup as signupPatient } from "@/services/auth-flow";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { OtpInput } from "@/components/auth/OtpInput";

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

const secondaryBtnClass = (enabled: boolean) =>
  `inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border px-4 text-[15px] font-semibold transition-colors ${
    enabled
      ? "border-[#052629] bg-white text-[#052629] hover:bg-neutral-50 active:bg-neutral-100"
      : "cursor-not-allowed border-transparent bg-[#eeeeee] text-[#aaaaaa]"
  }`;

type Step = "email" | "welcome" | "otp";

export default function AccessPage() {
  const { t } = useLang();
  const { user, loading, login, loginWithGoogle, loginWithOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [resendAfter, setResendAfter] = useState(0);
  const [isNewSignup, setIsNewSignup] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const redirected = useRef(false);

  const routeAfterAuth = useCallback(async (u: { role: string; status?: string }) => {
    if (u.role === "patient") {
      try {
        const { getOnboardingStatus } = await import("@/services/api/patients");
        const status = await getOnboardingStatus();
        if (!status.completed) {
          router.replace("/onboarding/patient");
          return;
        }
      } catch {
        // proceed to dashboard
      }
      router.replace(ROLE_HOME[u.role] ?? "/");
    } else if (u.role === "therapist") {
      try {
        const { getApplicationStatus } = await import("@/services/api/therapists");
        const status = await getApplicationStatus();
        if (status.status === "INCOMPLETE" || status.status === "CHANGES_REQUIRED") {
          router.replace("/onboarding/therapist");
          return;
        }
      } catch {
        // proceed to dashboard
      }
      router.replace(ROLE_HOME[u.role] ?? "/");
    } else {
      router.replace(ROLE_HOME[u.role] ?? "/");
    }
  }, [router]);

  useEffect(() => {
    if (redirected.current) return;
    if (!loading && user) {
      redirected.current = true;
      routeAfterAuth(user);
    }
  }, [loading, user, routeAfterAuth]);

  useEffect(() => {
    if (step !== "otp" || resendAfter <= 0) return;
    timerRef.current = setInterval(() => {
      setResendAfter((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [step, resendAfter > 0]);

  const emailName = () => {
    const local = email.split("@")[0]?.trim();
    if (!local) return "there";
    return local.charAt(0).toUpperCase() + local.slice(1);
  };

  const handleEmailContinue = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = email.trim();
    if (!value || !EMAIL_RE.test(value)) {
      setEmailError(t("auth.invalidEmail"));
      return;
    }
    setEmailError(null);
    setStep("welcome");
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
      await routeAfterAuth(u);
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

  const handleGoogle = async () => {
    if (!window.google?.accounts?.id) {
      toast.error("Google Sign-In is not available. Please try again later.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      callback: async (response: { credential?: string }) => {
        if (!response.credential) {
          toast.error("Google Sign-In failed. Please try again.");
          return;
        }
        setSubmitting(true);
        try {
          const u = await loginWithGoogle(response.credential);
          toast.success(t("auth.successWelcome") + ", " + u.name);
          redirected.current = true;
          await routeAfterAuth(u);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Google Sign-In failed";
          toast.error(msg);
        } finally {
          setSubmitting(false);
        }
      },
    });

    window.google.accounts.id.prompt();
  };

  const handleSendCode = async () => {
    setOtpError(null);
    setSending(true);
    try {
      const res = await sendLoginOtp(email.trim(), emailName());
      setIsNewSignup(false);
      setResendAfter(res.resend_after);
      setOtpCode("");
      setStep("otp");
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      if (status === 404) {
        try {
          const res = await sendOtp(email.trim(), emailName());
          setIsNewSignup(true);
          setResendAfter(res.resend_after);
          setOtpCode("");
          setStep("otp");
        } catch (sendOtpErr) {
          const sendOtpStatus = (sendOtpErr as { status?: number } | null)?.status;
          if (sendOtpStatus === 409) {
            setOtpError(t("auth.accountExistsUsePassword"));
          } else {
            setOtpError(t("auth.couldntSendCode"));
          }
        }
      } else {
        setOtpError(t("auth.couldntSendCode"));
      }
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = useCallback(async () => {
    if (otpCode.length !== 6) return;
    setOtpError(null);
    setSubmitting(true);
    try {
      if (isNewSignup) {
        await verifyOtp(email.trim(), otpCode, "signup");
        const tempPw = `Pvc${Date.now().toString(36)}!`;
        const u = await signupPatient({
          name: emailName(),
          email: email.trim(),
          password: tempPw,
          role: "patient",
        });
        toast.success(t("auth.successWelcome") + ", " + u.name);
        redirected.current = true;
        await routeAfterAuth(u);
      } else {
        const u = await loginWithOtp(email.trim(), otpCode);
        toast.success(t("auth.successWelcome") + ", " + u.name);
        redirected.current = true;
        await routeAfterAuth(u);
      }
    } catch {
      setOtpError(t("auth.errorOtpFailed"));
    } finally {
      setSubmitting(false);
    }
  }, [otpCode, email, isNewSignup, loginWithOtp, routeAfterAuth, t]);

  const handleResendOtp = async () => {
    if (resendAfter > 0) return;
    setOtpError(null);
    try {
      const res = isNewSignup
        ? await sendOtp(email.trim(), emailName())
        : await sendLoginOtp(email.trim(), emailName());
      setResendAfter(res.resend_after);
      setOtpCode("");
      toast.success(t("auth.otpSentTo"));
    } catch {
      setOtpError(t("auth.couldntSendCode"));
    }
  };

  return (
    <>
    <AuthShell centered={step !== "email"}>
      {step === "email" && (
        <>
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

          <p className="mt-4 text-center text-xs text-text-light">
            {t("auth.physioPrompt")}{" "}
            <Link href="/signup" className=" text-blue-400 underline">
              {t("common.applyToJoin")}
            </Link>
          </p>
        </>
      )}

      {step === "welcome" && (
        <div className="flex flex-col items-center text-center">
          <h1 className="mt-7 text-[24px] font-semibold leading-tight tracking-[-0.01em] text-text">
            {t("auth.welcomeTo")} <span className="whitespace-nowrap">{t("header.brand")}</span>
          </h1>

          <p className="mt-4 max-w-[330px] text-[14px] leading-[1.5] text-text-light">
            {t("auth.noPassword")} {t("auth.willEmailCodeTo")}{" "}
            <span className="font-medium text-text">{email}</span>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="ml-1.5 cursor-pointer text-[13px] font-medium text-blue-400 hover:underline"
            >
              {t("common.edit")}
            </button>
          </p>

          <button
            type="button"
            onClick={handleSendCode}
            disabled={sending}
            className={`${primaryBtnClass} mt-6`}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.sendOneTimeCode")}
          </button>

          <p role="alert" className="mt-2 min-h-[18px] text-[12px] leading-[14px] text-red-500">
            {otpError ?? ""}
          </p>

          <div className="my-6 flex w-full items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-[#dedede]" />
            <span className="text-[13px] text-text-muted">{t("auth.orDivider")}</span>
            <span className="h-px flex-1 bg-[#dedede]" />
          </div>

          <form onSubmit={handleLogin} noValidate className="w-full flex flex-col gap-2 text-left">
            <div className="relative space-y-3">
              <label htmlFor="auth-password" className="sr-only">
                {t("auth.enterPassword")}
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
                placeholder={t("auth.enterPassword")}
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
            <button
              type="submit"
              disabled={submitting || !password}
              className={`${secondaryBtnClass(!!password && !submitting)} ${submitting ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.continueWithPassword")}
            </button>
            <p role="alert" className="min-h-[18px] text-[12px] leading-[14px] text-red-500">
              {error ?? ""}
            </p>
          </form>
        </div>
      )}

      {step === "otp" && (
        <div className="flex flex-col items-center text-center">
          <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.01em] text-text">
            {isNewSignup ? t("auth.verifyToJoin") : t("auth.checkYourEmail")}
          </h1>
          <p className="mt-3 max-w-[330px] text-[14px] leading-[1.5] text-text-light">
            {isNewSignup ? t("auth.verifyToJoinDesc") : <>{t("auth.otpSentTo")}{" "}</>}
            <span className="font-medium text-text">{email}</span>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="ml-1.5 cursor-pointer text-[13px] font-medium text-blue-400 hover:underline"
            >{t("common.edit")}
            </button>
          </p>

          <div className="mt-6 w-full">
            <OtpInput
              value={otpCode}
              onChange={setOtpCode}
              disabled={submitting}
            />
          </div>

          <p role="alert" className="mt-2 min-h-[18px] text-[12px] leading-[14px] text-red-500">
            {otpError ?? ""}
          </p>

          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={otpCode.length !== 6 || submitting}
            className={`${primaryBtnClass} mt-1`}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.verifyAndContinue")}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendAfter > 0}
            className="mt-4 cursor-pointer text-[13px] font-medium text-secondary hover:underline disabled:cursor-not-allowed disabled:text-text-muted disabled:no-underline"
          >
            {resendAfter > 0
              ? t("auth.resendOtpIn").replace("{seconds}", String(resendAfter))
              : t("auth.resendOtp")}
          </button>
        </div>
      )}
    </AuthShell>

    <div className="fixed bottom-0 inset-x-0 pb-6 pt-4 text-center text-[11px] leading-relaxed text-text-light/60 pointer-events-none px-5">
      By continuing, you agree to our{" "}
      <Link href="/terms" className="underline pointer-events-auto hover:text-text-light">Terms of Service</Link>{" "}
      and{" "}
      <Link href="/privacy" className="underline pointer-events-auto hover:text-text-light">Privacy Policy</Link>.
    </div>
    </>
  );
}
