"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, ArrowLeft, Mail, KeyRound } from "lucide-react";
import { useLang } from "@/context/i18n";
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

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 justify-center mb-8">
            <span className="w-6 h-6 rounded-full bg-secondary inline-block" />
            <span className="font-display text-lg">{t("header.brand")}</span>
          </Link>
          <div className="bg-background rounded-3xl border border-border shadow-2xl p-7 sm:p-9 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <h2 className="font-display text-2xl mb-2">Password reset</h2>
            <p className="text-text-light text-sm mb-6">Your password has been updated successfully.</p>
            <button onClick={() => router.push("/login")} className="btn-secondary w-full">
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="w-6 h-6 rounded-full bg-secondary inline-block" />
          <span className="font-display text-lg">{t("header.brand")}</span>
        </Link>

        <div className="bg-background rounded-3xl border border-border shadow-2xl p-7 sm:p-9">
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
                <KeyRound size={16} className="text-primary" />
                <p className="eyebrow">Reset password</p>
              </div>
              <h2 className="text-2xl font-display mb-1">Forgot password?</h2>
              <p className="text-text-light text-sm mb-6">
                Enter your email and we'll send you a verification code.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-text-light">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  type="button"
                  disabled={submitting || !email}
                  onClick={handleSendOtp}
                  className="btn-secondary w-full disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Send verification code"}
                </button>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Mail size={16} className="text-primary" />
                <p className="eyebrow">Check your email</p>
              </div>
              <h2 className="text-2xl font-display mb-1">Enter verification code</h2>
              <p className="text-text-light text-sm mb-6">
                We sent a 6-digit code to <span className="font-medium text-text">{email}</span>
              </p>

              <div className="space-y-4">
                <div className="flex justify-center gap-2">
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
                      className="w-11 h-12 text-center text-lg font-mono font-bold rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  disabled={submitting || otp.join("").length !== 6}
                  onClick={handleVerifyOtp}
                  className="btn-secondary w-full disabled:opacity-50"
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
                      className="text-xs text-secondary hover:underline disabled:opacity-50"
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
                <KeyRound size={16} className="text-primary" />
                <p className="eyebrow">New password</p>
              </div>
              <h2 className="text-2xl font-display mb-1">Choose a new password</h2>
              <p className="text-text-light text-sm mb-6">
                Must be at least 8 characters with uppercase, lowercase, number, and special character.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-light">New password</label>
                  <div className="relative mt-1">
                    <input
                      type={showPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-text-light">Confirm password</label>
                  <div className="relative mt-1">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button type="button" onClick={() => setShowConfirmPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-xs text-danger mt-1">Passwords don't match</p>
                  )}
                </div>

                <div className="space-y-1.5 bg-surface rounded-xl p-3">
                  <RuleCheck pass={rules.length} label="At least 8 characters" />
                  <RuleCheck pass={rules.upper} label="One uppercase letter" />
                  <RuleCheck pass={rules.lower} label="One lowercase letter" />
                  <RuleCheck pass={rules.digit} label="One number" />
                  <RuleCheck pass={rules.symbol} label="One special character" />
                </div>

                <button
                  type="button"
                  disabled={submitting || !allRulesPass || !passwordsMatch}
                  onClick={handleReset}
                  className="btn-secondary w-full disabled:opacity-50"
                >
                  {submitting ? "Resetting..." : "Reset password"}
                </button>
              </div>
            </>
          )}

          <p className="text-sm text-text-light text-center mt-5">
            Remember your password?{" "}
            <Link href="/login" className="text-secondary font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RuleCheck({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
          pass ? "bg-success border-success" : "border-text-light"
        }`}
      >
        {pass && <span className="text-white text-[8px] font-bold">&#10003;</span>}
      </div>
      <span className={pass ? "text-text" : "text-text-light"}>{label}</span>
    </div>
  );
}
