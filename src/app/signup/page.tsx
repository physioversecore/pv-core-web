"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth";
import { SignupFlow } from "@/components/auth/SignupFlow";
import { AuthShell } from "@/components/auth/AuthShell";
import type { Role } from "@/types";

const ROLE_HOME: Record<string, string> = {
  patient: "/patient",
  therapist: "/therapist",
};

export default function SignupPage() {
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
      router.replace("/access");
      return;
    }
    router.replace(ROLE_HOME[role] ?? "/");
  };

  return (
    <AuthShell maxWidth={400}>
      <div className="mt-7">
        <SignupFlow defaultSignupRole={defaultRole} onSuccess={handleSuccess} />
      </div>
    </AuthShell>
  );
}
