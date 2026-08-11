"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth";
import type { AuthMode, Role } from "@/types";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";
import { SignupFlow } from "@/components/auth/SignupFlow";
import { InlineError } from "@/components/common/InlineError";

type SignupRole = "patient" | "therapist" | null;

export function AuthModal({
  open,
  mode: initialMode,
  onClose,
  onLoginSuccess,
  defaultSignupRole,
}: {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
  onLoginSuccess?: (() => void) | null;
  defaultSignupRole?: SignupRole;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [signupRole, setSignupRole] = useState<SignupRole>(defaultSignupRole ?? null);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();
  const { t } = useLang();

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setSignupRole(defaultSignupRole ?? null);
      setError(null);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, initialMode, defaultSignupRole]);

  if (!open) return null;

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.email || !form.password) {
      setError(t("auth.errorEmailPassword"));
      return;
    }
    try {
      const u = await login(form.email, form.password, "patient");
      toast.success(t("auth.successWelcome") + ", " + u.name);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      onClose();
      if (!onLoginSuccess) {
        router.replace(u.role === "patient" ? "/patient" : u.role === "therapist" ? "/therapist" : "/admin");
      }
    } catch (e) {
      const status = (e as { status?: number } | null)?.status;
      if (status === 403) {
        const msg = e instanceof Error ? e.message : "";
        setError(/not approved/i.test(msg) ? t("auth.loginRejected") : t("auth.loginUnderReview"));
      } else {
        setError(e instanceof Error ? e.message : t("auth.errorLoginFailed"));
      }
    }
  };

  const handleSignupSuccess = (role: Role) => {
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    onClose();
    if (!onLoginSuccess) {
      if (role === "therapist") {
        router.replace("/login");
      } else {
        router.replace("/patient");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-carbon/60 backdrop-blur-sm" onClick={onClose} aria-label={t("common.close")} />
      <div className="relative w-full max-w-lg max-h-[92vh] bg-paper-bright rounded-2xl border-2 border-carbon shadow-[8px_8px_0_var(--color-carbon)] overflow-hidden">
        <button onClick={onClose} className="absolute right-4 top-4 z-10 p-2 rounded-full hover:bg-surface cursor-pointer" aria-label={t("common.close")}>
          <X size={18} />
        </button>
        <div className="max-h-[92vh] overflow-y-auto p-7 sm:p-9">

        {mode === "login" && (
          <>
            <p className="label-ink mb-2">{t("auth.account")}</p>
            <h2 className="text-3xl font-display font-extrabold uppercase tracking-tighter mb-1">{t("auth.welcomeBack")}</h2>
            <p className="text-text-light text-sm mb-5">{t("auth.loginSubtitle")}</p>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="label-ink block mb-1.5">{t("auth.labelEmail")}</label>
                <input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => { set("email", e.target.value); setError(null); }}
                  placeholder={t("auth.placeholderEmail")}
                  className="input-neo w-full !py-3"
                />
              </div>
              <div>
                <label className="label-ink block mb-1.5">{t("auth.labelPassword")}</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password ?? ""}
                    onChange={(e) => { set("password", e.target.value); setError(null); }}
                    placeholder={t("auth.placeholderPassword")}
                    className="input-neo w-full !py-3 pr-11"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="text-right mt-1.5">
                  <button type="button" className="text-xs text-moss font-bold underline underline-offset-2 decoration-2 hover:bg-volt transition-colors">{t("common.forgotPassword")}</button>
                </div>
              </div>
              <InlineError message={error} />
              <button type="submit" className="btn-volt w-full">{t("auth.loginBtn")}</button>
            </form>

            <p className="text-sm text-text-light text-center mt-5">
              {t("auth.dontHaveAccount")}{" "}
              <button onClick={() => setMode("signup")} className="text-moss font-bold underline underline-offset-2 decoration-2 hover:bg-volt transition-colors">{t("common.signUp")}</button>
            </p>
          </>
        )}

        {mode === "signup" && (
          <SignupFlow
            defaultSignupRole={signupRole}
            onSuccess={handleSignupSuccess}
          />
        )}
        </div>
      </div>
    </div>
  );
}
