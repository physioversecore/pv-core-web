"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";

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

export default function LoginPage() {
  const { t } = useLang();
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;
    if (!loading && user) {
      redirected.current = true;
      router.replace(resolveCallbackUrl(callbackUrl, user.role));
    }
  }, [loading, user, router, callbackUrl]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error(t("auth.errorEmailPassword"));
    setSubmitting(true);
    try {
      const u = await login(email, password, "patient");
      toast.success(t("auth.successWelcome") + ", " + u.name);
      redirected.current = true;
      router.replace(resolveCallbackUrl(callbackUrl, u.role));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.errorLoginFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="w-6 h-6 rounded-full bg-secondary inline-block" />
          <span className="font-display text-lg">{t("header.brand")}</span>
        </Link>

        <div className="bg-background rounded-3xl border border-border shadow-2xl p-7 sm:p-9">
          <p className="eyebrow mb-2">{t("auth.account")}</p>
          <h2 className="text-3xl font-display mb-1">{t("auth.welcomeBack")}</h2>
          <p className="text-text-light text-sm mb-6">{t("auth.loginSubtitle")}</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-text-light">{t("auth.labelEmail")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.placeholderEmail")}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-light">{t("auth.labelPassword")}</label>
              <div className="relative mt-1">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link href="/forgot-password" className="text-xs text-secondary hover:underline">{t("common.forgotPassword")}</Link>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-secondary w-full disabled:opacity-60">
              {submitting ? t("common.loading") : t("auth.loginBtn")}
            </button>
          </form>

          <p className="text-sm text-text-light text-center mt-5">
            {t("auth.dontHaveAccount")}{" "}
            <Link href="/signup" className="text-secondary font-semibold hover:underline">{t("common.signUp")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
