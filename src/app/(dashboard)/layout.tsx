"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/lib/auth";
import { patientNav, therapistNav, adminNav } from "@/lib/nav";
import type { NavItem } from "@/lib/nav";
import { useLang, type TKey } from "@/context/i18n";

const ROLE_ROUTES: Record<string, string> = {
  patient: "/patient",
  therapist: "/therapist",
  admin: "/admin",
};

const rolePrefixes = [
  { prefix: "/patient", nav: patientNav },
  { prefix: "/therapist", nav: therapistNav },
  { prefix: "/admin", nav: adminNav },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/");
      return;
    }

    const expectedPrefix = ROLE_ROUTES[user.role];
    if (!pathname.startsWith(expectedPrefix)) {
      router.push(expectedPrefix);
    }
  }, [loading, user, pathname, router]);

  if (loading) return null;

  let nav: NavItem[] = adminNav;
  let role = "admin";
  for (const r of rolePrefixes) {
    if (pathname.startsWith(r.prefix)) {
      nav = r.nav;
      role = r.prefix.slice(1);
      break;
    }
  }

  const labelToKey: Record<string, string> = {
    "Overview": "nav.overview",
    "My Sessions": "nav.mySessions",
    "Shop": "nav.shop",
    "Recovery Progress": "nav.recoveryProgress",
    "Reports & Files": "nav.reportsFiles",
    "My Profile": "nav.myProfile",
    "Help": "nav.help",
    "Settings": "nav.settings",
    "My Schedule": "nav.mySchedule",
    "Upload Reports": "nav.uploadReports",
    "My Patients": "nav.myPatients",
    "Earnings": "nav.earnings",
    "Patients": "nav.patients",
    "Bookings": "nav.bookings",
    "Schedules": "nav.schedules",
    "Payments": "nav.payments",
    "Therapists": "nav.therapists",
    "Complaints": "nav.complaints",
    "Complaints & Feedback": "nav.complaints",
    "Notifications": "nav.notifications",
    "Admin Team": "nav.adminTeam",
    "Appearance": "nav.appearance",
  };
  const current = nav.find((n) => pathname === n.to);
  const title = current ? t((labelToKey[current.label] ?? current.label) as TKey) : t("nav.overview");
  const showCart = role === "patient";

  return (
    <DashboardShell title={title} nav={nav} showCart={showCart}>
      <ErrorBoundary onError={(e) => console.error("[Dashboard Error]", e)}>
        {children}
      </ErrorBoundary>
    </DashboardShell>
  );
}
