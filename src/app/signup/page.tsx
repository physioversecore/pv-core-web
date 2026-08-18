"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";
import { sendOtp, verifyOtp } from "@/services/auth-flow";
import { AuthShell } from "@/components/auth/AuthShell";
import { OtpInput } from "@/components/auth/OtpInput";

type Step = "account" | "otp";

const inputClass =
  "h-[44px] w-full rounded-[7px] border border-[#d8dadd] bg-white px-[14px] text-[14px] text-text placeholder:text-[14px] placeholder:text-text-light/60 transition-colors focus:border-voltage-lime focus:outline-none focus:ring-4 focus:ring-voltage-lime/15";

const labelClass = "block text-[13px] font-medium text-[#555] mb-[8px]";

const primaryBtnClass =
  "inline-flex h-[44px] items-center justify-center gap-2 rounded-[7px] bg-mid-abyss px-[28px] text-[14px] font-semibold text-white transition-colors hover:bg-[#0a3a3e] active:bg-[#031a1d] disabled:cursor-not-allowed disabled:opacity-50";

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

export default function SignupPage() {
  const { t } = useLang();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("account");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);

  const [otpCode, setOtpCode] = useState("");
  const [resendAfter, setResendAfter] = useState(0);
  const [sending, setSending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const redirected = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (redirected.current) return;
    if (!loading && user) {
      redirected.current = true;
      if (user.role === "therapist") {
        router.replace("/onboarding/therapist");
      } else {
        router.replace(`/${user.role}`);
      }
    }
  }, [loading, user, router]);

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

  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    EMAIL_RE.test(email) &&
    PASSWORD_RE.test(password);

  const handleAccountSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    let valid = true;

    if (!firstName.trim()) {
      setFirstNameError("First name is required.");
      valid = false;
    } else {
      setFirstNameError(null);
    }

    if (!lastName.trim()) {
      setLastNameError("Last name is required.");
      valid = false;
    } else {
      setLastNameError(null);
    }

    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (!PASSWORD_RE.test(password)) {
      setPasswordError("Password must be at least 8 characters with uppercase, lowercase, number, and symbol.");
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (!valid) return;

    handleSendOtp();
  };

  const handleSendOtp = async () => {
    setOtpError(null);
    setSending(true);
    try {
      const res = await sendOtp(email.trim(), `${firstName.trim()} ${lastName.trim()}`);
      setResendAfter(res.resend_after);
      setOtpCode("");
      setStep("otp");
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      if (status === 409) {
        setOtpError("An account with this email already exists.");
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
      const result = await verifyOtp(email.trim(), otpCode, "signup");
      if (result.verified) {
        const { signup } = await import("@/services/auth-flow");
        const u = await signup({
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim(),
          password,
          role: "THERAPIST",
        });

        toast.success("Account created! Now complete your professional profile.");
        redirected.current = true;
        router.replace("/onboarding/therapist");
      } else {
        setOtpError(t("auth.errorOtpFailed"));
      }
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      if (status === 409) {
        setOtpError("An account with this email already exists. Try logging in instead.");
      } else {
        setOtpError(t("auth.errorOtpFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  }, [otpCode, email, firstName, lastName, password, router, t]);

  const handleResendOtp = async () => {
    if (resendAfter > 0) return;
    setOtpError(null);
    try {
      const res = await sendOtp(email.trim(), `${firstName.trim()} ${lastName.trim()}`);
      setResendAfter(res.resend_after);
      setOtpCode("");
      toast.success(t("auth.otpSentTo"));
    } catch {
      setOtpError(t("auth.couldntSendCode"));
    }
  };

  if (loading) return null;

  return (
    <AuthShell maxWidth={504}>
      {step === "account" && (
        <>
          <h1 className="mt-7 text-[28px] font-semibold leading-[1.15] tracking-[-0.01em] text-text sm:text-[30px]">
            Join as a Physiotherapist
          </h1>

          <p className="mt-3 text-[14px] leading-[1.55] text-text-light max-w-[420px]">
            Apply to join Sahayatri Physio. Grow your practice with home-visit sessions, flexible scheduling, and direct patient connections.
          </p>

          <form onSubmit={handleAccountSubmit} noValidate className="mt-8 space-y-[12px]">
            <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
              <div>
                <label htmlFor="signup-first-name" className={labelClass}>First name</label>
                <input
                  id="signup-first-name"
                  name="given-name"
                  type="text"
                  autoComplete="given-name"
                  autoFocus
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setFirstNameError(null); }}
                  placeholder="First name"
                  aria-invalid={!!firstNameError}
                  aria-describedby={firstNameError ? "signup-first-name-error" : undefined}
                  className={inputClass}
                />
                <p id="signup-first-name-error" role="alert" className="mt-1 min-h-[16px] text-[12px] leading-[14px] text-red-500">
                  {firstNameError ?? ""}
                </p>
              </div>
              <div>
                <label htmlFor="signup-last-name" className={labelClass}>Last name</label>
                <input
                  id="signup-last-name"
                  name="family-name"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setLastNameError(null); }}
                  placeholder="Last name"
                  aria-invalid={!!lastNameError}
                  aria-describedby={lastNameError ? "signup-last-name-error" : undefined}
                  className={inputClass}
                />
                <p id="signup-last-name-error" role="alert" className="mt-1 min-h-[16px] text-[12px] leading-[14px] text-red-500">
                  {lastNameError ?? ""}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" className={labelClass}>Work email</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(null); setEmailTouched(false) }}
                onBlur={()=>setEmailTouched(true)}
                placeholder="Email Address"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "signup-email-error" : undefined}
                className={inputClass}
              />
              { emailTouched && email.length > 0 && !EMAIL_RE.test(email) && (
                <p className="pt-1 text-[12px] leading-[16px] text-[#b45309]">
                  Please enter a valid email address format.
                </p>
              )}
              <p id="signup-email-error" role="alert" className="mt-1 min-h-[16px] text-[12px] leading-[14px] text-red-500">
                {emailError ?? ""}
              </p>
            </div>

            <div>
              <label htmlFor="signup-password" className={labelClass}>Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="new-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(null);}}
                  placeholder="Enter password"
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? "signup-password-error" : undefined}
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
              { password.length > 0 && !PASSWORD_RE.test(password) && (
                <p className="pt-1 text-[12px] leading-[16px] text-[#b45309]">
                  Your password must be 8+ chars, include uppercase, lowercase, number, & special char.
                </p>
              )}
              <p id="signup-password-error" role="alert" className="pt-1 min-h-[16px] text-[12px] leading-[14px] text-red-500">
                {passwordError ?? ""}
              </p>
            </div>

            <p className="text-[12px] leading-[1.5] text-[#444]">
              By clicking &ldquo;Create account&rdquo;, I agree to the{" "}
              <Link href="/terms" className="text-secondary underline hover:no-underline">Terms of Service</Link>{" "}
              and have read the{" "}
              <Link href="/privacy" className="text-secondary underline hover:no-underline">Privacy Policy</Link>.
            </p>

            <p role="alert" className="min-h-1 text-[12px] leading-[14px] text-red-500">
              {error ?? ""}
            </p>

            <div className="flex flex-col-reverse gap-2 pt-1 items-center">
              <Link href="/access" className="text-[13px] font-medium text-secondary hover:underline">
                {t("auth.alreadyHaveAccount")} {t("auth.loginBtn")}
              </Link>
              <button
                type="submit"
                disabled={!isFormValid || sending}
                className={`${primaryBtnClass} w-full shrink-0`}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
              </button>
              <p role="alert" className="min-h-[18px] text-[12px] leading-[14px] text-red-500">
                {otpError ?? ""}
              </p>
            </div>
          </form>
        </>
      )}

      {step === "otp" && (
        <>
          <h1 className="mt-7 text-[28px] font-semibold leading-[1.15] tracking-[-0.01em] text-text sm:text-[30px]">
            Join as a Physiotherapist
          </h1>

          <p className="mt-3 text-[14px] leading-[1.55] text-text-light max-w-[420px]">
            Verify your email to continue. We sent a 6-digit code to{" "}
            <span className="font-medium text-text">{email}</span>
          </p>

          <div className="mt-8">
            <OtpInput
              value={otpCode}
              onChange={setOtpCode}
              disabled={submitting}
            />
          </div>

          <div className="mt-1 flex flex-col gap-4 items-center">
              <p role="alert" className="mt-2 min-h-[18px] text-[12px] leading-[14px] text-red-500">
                {otpError ?? ""}
              </p>
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpCode.length !== 6 || submitting}
              className={`${primaryBtnClass} w-full`}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.verifyAndContinue")}
            </button>
          </div>

          <div className="mt-6 text-center">
            {resendAfter > 0 ? (
              <span className="text-[13px] text-text-light">
                {t("auth.resendOtpIn").replace("{seconds}", String(resendAfter))}
              </span>
            ) : (
              <button
                type="button"
                disabled={sending}
                onClick={handleResendOtp}
                className="text-[13px] font-medium text-secondary hover:underline disabled:opacity-50"
              >
                {t("auth.resendOtp")}
              </button>
            )}
            </div>
        </>
      )}
    </AuthShell>
  );
}
