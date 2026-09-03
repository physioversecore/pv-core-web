"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/lib/auth";
import { patientNav, therapistNav, adminNav } from "@/lib/nav";
import type { NavItem } from "@/lib/nav";
import { useLang, type TKey } from "@/context/i18n";
import { useBookingBadge } from "@/context/booking-badge";
import { useComplaintBadge } from "@/context/complaint-badge";
import { useAdminNavBadge } from "@/context/admin-nav-badge";

import { ROLE_ROUTE, type UserRole } from "@/services/api/auth-constants";

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
  const { bookingCount } = useBookingBadge();
  const { complaintCount, resetComplaintCount } = useComplaintBadge();
  const { pendingLeaves, pendingRefunds, pendingVerifications } = useAdminNavBadge();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/access?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.role === "therapist" && user.status === "PENDING") {
      router.replace("/onboarding/therapist");
      return;
    }
    const expectedPrefix = ROLE_ROUTE[user.role as UserRole];
    if (expectedPrefix && !pathname.startsWith(expectedPrefix)) {
      router.replace(expectedPrefix);
    }
  }, [loading, user, pathname, router]);

  let nav: NavItem[] = adminNav;
  let role = "admin";
  for (const r of rolePrefixes) {
    if (pathname.startsWith(r.prefix)) {
      nav = r.nav;
      role = r.prefix.slice(1);
      break;
    }
  }

  const navWithBadges = useMemo(() => {
    if (role !== "admin") return nav;
    return nav.map((item) => {
      if (item.to === "/admin/bookings") {
        return { ...item, badge: bookingCount > 0 ? bookingCount : undefined };
      }
      if (item.to === "/admin/complaints") {
        return { ...item, badge: complaintCount > 0 ? complaintCount : undefined };
      }
      if (item.to === "/admin/leave") {
        return { ...item, badge: pendingLeaves > 0 ? pendingLeaves : undefined };
      }
      if (item.to === "/admin/refunds") {
        return { ...item, badge: pendingRefunds > 0 ? pendingRefunds : undefined };
      }
      if (item.to === "/admin/verification") {
        return { ...item, badge: pendingVerifications > 0 ? pendingVerifications : undefined };
      }
      return item;
    });
  }, [role, nav, bookingCount, complaintCount, pendingLeaves, pendingRefunds, pendingVerifications]);

  useEffect(() => {
    if (role === "admin" && pathname === "/admin/complaints") {
      resetComplaintCount();
    }
  }, [role, pathname, resetComplaintCount]);

  if (loading || !user) return null;
  if (user.role === "therapist" && user.status === "PENDING") return null;

  const userPrefix = ROLE_ROUTE[user.role as UserRole];
  if (userPrefix && !pathname.startsWith(userPrefix)) return null;

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
    <DashboardShell title={title} nav={navWithBadges} showCart={showCart}>
      <ErrorBoundary onError={(e) => console.error("[Dashboard Error]", e)}>
        {children}
      </ErrorBoundary>
    </DashboardShell>
  );
}
