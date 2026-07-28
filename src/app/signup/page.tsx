"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
    router.replace(ROLE_HOME[role] ?? "/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="w-6 h-6 rounded-full bg-secondary inline-block" />
          <span className="font-display text-lg">{t("header.brand")}</span>
        </Link>

        <div className="bg-background rounded-3xl border border-border shadow-2xl p-7 sm:p-9">
          <SignupFlow defaultSignupRole={defaultRole} onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
