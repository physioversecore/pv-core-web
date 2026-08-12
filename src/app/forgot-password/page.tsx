"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, ArrowLeft, Mail, KeyRound } from "lucide-react";
import { useLang } from "@/context/i18n";
import { PasswordRules } from "@/components/auth/PasswordRules";
import { toast } from "sonner";
import { forgotPassword, verifyOtp, resetPassword } from "@/services/api/auth";

type Step = "email" | "otp" | "password" | "success";

function passwordValid(password: string) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export default function ForgotPasswordPage() {
  const { t } = useLang();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [resendAfter, setResendAfter] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (resendAfter > 0) {
      timerRef.current = setInterval(() => {
        setResendAfter((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resendAfter]);

  const rules = passwordValid(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const allRulesPass = rules.length && rules.upper && rules.lower && rules.digit && rules.symbol;

  const handleSendOtp = useCallback(async () => {
    if (!email) return toast.error("Enter your email");
    setSubmitting(true);
    try {
      await forgotPassword(email, name);
      toast.success("Verification code sent");
      setResendAfter(120);
      setStep("otp");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setSubmitting(false);
    }
  }, [email, name]);

  const handleVerifyOtp = useCallback(async () => {
    const code = otp.join("");
    if (code.length !== 6) return toast.error("Enter the 6-digit code");
    setSubmitting(true);
    try {
      await verifyOtp(email, code, "password_reset");
      setStep("password");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid or expired code");
    } finally {
      setSubmitting(false);
    }
  }, [email, otp]);

  const handleResend = useCallback(async () => {
    if (resendAfter > 0) return;
    setSubmitting(true);
    try {
      await forgotPassword(email, name);
      toast.success("Code resent");
      setResendAfter(120);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setSubmitting(false);
    }
  }, [email, name, resendAfter]);

  const handleReset = useCallback(async () => {
    if (!allRulesPass) return toast.error("Password does not meet all requirements");
    if (!passwordsMatch) return toast.error("Passwords don't match");
    setSubmitting(true);
    try {
      const code = otp.join("");
      await resetPassword(email, code, newPassword);
      setStep("success");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  }, [email, otp, newPassword, allRulesPass, passwordsMatch]);

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    setOtp((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  }, [otp]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setOtp(pasted.split(""));
    const nextIndex = Math.min(pasted.length, 5);
    const nextInput = document.getElementById(`otp-${nextIndex}`);
    nextInput?.focus();
  }, []);

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-moss p-4 md:p-8">
        <div className="w-full max-w-2xl">
          <Link href="/" className="flex items-center gap-2 justify-center mb-8">
            <span className="w-6 h-6 rounded-full bg-volt border-2 border-carbon-soft inline-block" />
            <span className="font-display font-extrabold text-lg text-white">{t("header.brand")}</span>
          </Link>
          <div className="relative bg-paper-bright rounded-2xl border-2 border-carbon-soft shadow-[5px_5px_0_var(--color-carbon-soft)] p-8 md:p-12 text-center overflow-hidden">
            <div aria-hidden className="absolute top-0 left-0 w-full h-2 bg-carbon" />
            <div className="w-16 h-16 rounded-full bg-mint border-2 border-carbon-soft flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-carbon" />
            </div>
            <h2 className="font-display font-extrabold text-2xl mb-2">Password reset</h2>
            <p className="text-text-light text-sm mb-6">Your password has been updated successfully.</p>
            <button onClick={() => router.push("/login")} className="btn-volt w-full">
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-moss p-4 md:p-8">
      <div className="w-full max-w-2xl">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="w-6 h-6 rounded-full bg-volt border-2 border-carbon-soft inline-block" />
          <span className="font-display font-extrabold text-lg text-white">{t("header.brand")}</span>
        </Link>

        <div className="relative bg-paper-bright rounded-2xl border-2 border-carbon-soft shadow-[5px_5px_0_var(--color-carbon-soft)] p-8 md:p-12 overflow-hidden">
          <div aria-hidden className="absolute top-0 left-0 w-full h-2 bg-carbon" />
          <button
            type="button"
            onClick={() => {
              if (step === "otp") setStep("email");
              else if (step === "password") setStep("otp");
              else router.push("/login");
            }}
            className="flex items-center gap-1 text-xs text-text-light hover:text-text mb-4"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {step === "email" && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <KeyRound size={16} className="text-moss" />
                <p className="label-ink">Reset password</p>
              </div>
              <h2 className="text-3xl font-display font-extrabold uppercase tracking-tighter mb-1">Forgot password?</h2>
              <p className="text-text-light text-sm mb-6">
                Enter your email and we'll send you a verification code.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="label-ink block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="input-neo !py-3"
                  />
                </div>
                <button
                  type="button"
                  disabled={submitting || !email}
                  onClick={handleSendOtp}
                  className="btn-volt w-full disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Send verification code"}
                </button>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Mail size={16} className="text-moss" />
                <p className="label-ink">Check your email</p>
              </div>
              <h2 className="text-3xl font-display font-extrabold uppercase tracking-tighter mb-1">Enter verification code</h2>
              <p className="text-text-light text-sm mb-6">
                We sent a 6-digit code to <span className="font-semibold text-text">{email}</span>
              </p>

              <div className="space-y-4">
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? (e) => { e.preventDefault(); const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6); if (pasted) { setOtp(pasted.split("")); const next = document.getElementById(`otp-${Math.min(pasted.length, 5)}`); next?.focus(); } } : undefined}
                      className="w-12 h-14 text-center text-lg font-mono font-bold rounded-xl border-2 border-carbon-soft bg-paper-bright shadow-[1px_1px_0_var(--color-carbon-soft)] focus:outline-none focus:ring-2 focus:ring-volt"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  disabled={submitting || otp.join("").length !== 6}
                  onClick={handleVerifyOtp}
                  className="btn-volt w-full disabled:opacity-50"
                >
                  {submitting ? "Verifying..." : "Verify & continue"}
                </button>

                <div className="text-center">
                  {resendAfter > 0 ? (
                    <span className="text-xs text-text-light">
                      Resend in {resendAfter}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleResend}
                      className="text-xs text-moss font-semibold hover:underline disabled:opacity-50"
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {step === "password" && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <KeyRound size={16} className="text-moss" />
                <p className="label-ink">New password</p>
              </div>
              <h2 className="text-3xl font-display font-extrabold uppercase tracking-tighter mb-1">Choose a new password</h2>
              <p className="text-text-light text-sm mb-6">
                Must be at least 8 characters with uppercase, lowercase, number, and special character.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="label-ink block mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-neo !py-3 pr-11"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label-ink block mb-1.5">Confirm password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-neo !py-3 pr-11"
                    />
                    <button type="button" onClick={() => setShowConfirmPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-xs text-danger mt-1">Passwords don't match</p>
                  )}
                </div>

                <PasswordRules password={newPassword} />

                <button
                  type="button"
                  disabled={submitting || !allRulesPass || !passwordsMatch}
                  onClick={handleReset}
                  className="btn-volt w-full disabled:opacity-50"
                >
                  {submitting ? "Resetting..." : "Reset password"}
                </button>
              </div>
            </>
          )}

          <p className="text-sm text-text-light text-center mt-5">
            Remember your password?{" "}
            <Link href="/login" className="text-moss font-bold underline underline-offset-2 decoration-2 hover:bg-volt transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
