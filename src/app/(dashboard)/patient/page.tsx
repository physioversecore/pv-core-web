"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/context/i18n";
import { WelcomeHeader, Statistics, UpcomingAppointments, RateTherapist, ReferFriend } from "./components";

export default function Overview() {
  const { t } = useLang();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div>
      <WelcomeHeader name={user.name} />
      <Statistics />
      <UpcomingAppointments />
      <RateTherapist />
      <ReferFriend />

      <p className="text-xs text-text-light mt-4">
        {t("patient_dashboard.needBookSession")}{" "}
        <Link href="/patient/sessions" className="text-secondary underline">
          {t("patient_dashboard.goToMySessions")}
        </Link>
        .
      </p>
    </div>
  );
}
