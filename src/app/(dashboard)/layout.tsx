"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { patientNav, therapistNav, adminNav } from "@/lib/nav";
import type { NavItem } from "@/lib/nav";
import { useLang, type TKey } from "@/context/i18n";

const rolePrefixes = [
  { prefix: "/patient", nav: patientNav },
  { prefix: "/therapist", nav: therapistNav },
  { prefix: "/admin", nav: adminNav },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const pathname = usePathname();

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
    "Payments": "nav.payments",
    "Therapists": "nav.therapists",
  };
  const current = nav.find((n) => pathname === n.to);
  const title = current ? t((labelToKey[current.label] ?? current.label) as TKey) : t("nav.overview");
  const showCart = role === "patient";

  return (
    <DashboardShell title={title} nav={nav} showCart={showCart}>
      {children}
    </DashboardShell>
  );
}
