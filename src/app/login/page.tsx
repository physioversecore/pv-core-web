"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";
import { InlineError } from "@/components/common/InlineError";

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
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    if (!email || !password) {
      setError(t("auth.errorEmailPassword"));
      return;
    }
    setSubmitting(true);
    try {
      const u = await login(email, password, "patient");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-moss p-4 md:p-8">
      <div className="w-full max-w-2xl">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="w-6 h-6 rounded-full bg-volt border-2 border-carbon inline-block" />
          <span className="font-display font-extrabold text-lg text-white">{t("header.brand")}</span>
        </Link>

        <div className="relative bg-paper-bright rounded-2xl border-2 border-carbon shadow-[8px_8px_0_var(--color-carbon)] p-8 md:p-12 overflow-hidden">
          <div aria-hidden className="absolute top-0 left-0 w-full h-2 bg-carbon" />
          <div className="mb-10">
            <p className="label-ink mb-3">{t("auth.account")}</p>
            <h1 className="font-display font-extrabold uppercase text-4xl md:text-5xl leading-none mb-2">{t("auth.welcomeBack")}</h1>
            <div className="h-0.5 w-full bg-carbon mt-6 mb-4" />
            <p className="text-text-light max-w-md">{t("auth.loginSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="label-ink uppercase block">{t("auth.labelEmail")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder={t("auth.placeholderEmail")}
                className="input-neo py-3.5"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="label-ink uppercase block">{t("auth.labelPassword")}</label>
                <Link href="/forgot-password" className="label-ink underline decoration-2 underline-offset-4 hover:bg-volt transition-colors">{t("common.forgotPassword")}</Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  className="input-neo py-3.5 pr-11"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-light">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <InlineError message={error} />
            <div className="pt-2">
              <button type="submit" disabled={submitting} className="btn-volt w-full !py-4 !text-base disabled:opacity-60">
                {submitting ? t("common.loading") : t("auth.loginBtn")}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t-2 border-carbon pt-6">
            <p className="text-text-light">
              {t("auth.dontHaveAccount")}{" "}
              <Link href="/signup" className="label-ink uppercase underline decoration-2 underline-offset-4 hover:bg-volt transition-colors ml-2">{t("common.signUp")}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
