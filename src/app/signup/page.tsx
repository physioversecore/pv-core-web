"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Verified } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useLang } from "@/context/i18n";
import { SignupFlow } from "@/components/auth/SignupFlow";
import type { Role } from "@/types";

const ROLE_HOME: Record<string, string> = {
  patient: "/patient",
  therapist: "/therapist",
};

export default function SignupPage() {
  const { t } = useLang();
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "therapist" ? "therapist" : undefined;
  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;
    if (!loading && user) {
      redirected.current = true;
      router.replace(ROLE_HOME[user.role] ?? "/");
    }
  }, [loading, user, router]);

  const handleSuccess = (role: Role) => {
    redirected.current = true;
    // Therapists can't log in until the admin approves their application.
    if (role === "therapist") {
      router.replace("/login");
      return;
    }
    router.replace(ROLE_HOME[role] ?? "/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-moss p-4 md:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 flex flex-col justify-center text-white mb-8 md:mb-0">
          <Link href="/" className="inline-block mb-8">
            <span className="flex items-center gap-2 font-display font-extrabold text-2xl md:text-4xl tracking-tighter text-volt">
              <span className="w-6 h-6 rounded-full bg-volt border-2 border-carbon inline-block" />
              {t("header.brand")}
            </span>
          </Link>
          <h1 className="font-display font-extrabold uppercase text-5xl md:text-6xl leading-[0.9] mb-6">
            {t("auth.signupJourneyStart")}
          </h1>
          <p className="text-white/80 max-w-md border-l-4 border-volt pl-4 mb-8">
            {t("auth.signupJourneyDesc")}
          </p>
          <div className="flex items-center gap-3">
            <Verified size={22} className="text-volt" fill="currentColor" />
            <span className="label-ink uppercase tracking-wider text-white/90">{t("auth.signupTrusted")}</span>
          </div>
        </div>

        <div className="md:col-span-7 relative bg-paper-bright rounded-xl border-2 border-carbon shadow-[8px_8px_0_var(--color-carbon)] p-6 md:p-10 overflow-hidden">
          <SignupFlow defaultSignupRole={defaultRole} onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
