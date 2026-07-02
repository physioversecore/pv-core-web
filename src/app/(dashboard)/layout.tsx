"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { patientNav, therapistNav, adminNav } from "@/lib/nav";
import type { NavItem } from "@/lib/nav";

const rolePrefixes = [
  { prefix: "/patient", nav: patientNav },
  { prefix: "/therapist", nav: therapistNav },
  { prefix: "/admin", nav: adminNav },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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

  const current = nav.find((n) => pathname === n.to);
  const title = current?.label ?? "Dashboard";
  const showCart = role === "patient";

  return (
    <DashboardShell title={title} nav={nav} showCart={showCart}>
      {children}
    </DashboardShell>
  );
}
