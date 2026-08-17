import type { ReactNode } from "react";
import {
  LayoutDashboard, Calendar, FileText, User, HelpCircle,
  Stethoscope, Upload, Users, Wallet, Settings, Shield, CreditCard,
  AlertTriangle, Bell, CalendarClock, UserCog, MapPin, ClipboardCheck,
  BadgeCheck, BarChart3, ShieldAlert, ScrollText, LineChart, RotateCcw, Palette,
  MessageSquareWarning, Clock,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  badge?: number | string;
  group?: string;
}

export const NAV_LINKS = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/services", label: "Services" },
  { to: "/packages", label: "Packages" },
  { to: "/clinics", label: "Clinics" },
  { to: "/find-a-therapist", label: "Find a Therapist" },
] as const;

export const RESOURCE_LINKS = [
  { to: "/blog", label: "Blog" },
  { to: "/testimonials", label: "Testimonials" }
] as const;

export const patientNav: NavItem[] = [
  { to: "/patient", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { to: "/patient/sessions", label: "My Sessions", icon: <Calendar size={16} /> },
  { to: "/patient/reports", label: "Reports & Files", icon: <FileText size={16} /> },
  { to: "/patient/complaints", label: "Complaints & Feedback", icon: <MessageSquareWarning size={16} /> },
  { to: "/patient/profile", label: "My Profile", icon: <User size={16} /> },
  { to: "/patient/help", label: "Help", icon: <HelpCircle size={16} /> },
  { to: "/patient/settings", label: "Settings", icon: <Settings size={16} /> },
];

export const therapistNav: NavItem[] = [
  { to: "/therapist", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { to: "/therapist/schedule", label: "My Schedule", icon: <Calendar size={16} /> },
  { to: "/therapist/availability", label: "Manage Availability", icon: <Clock size={16} /> },
  { to: "/therapist/reports", label: "Upload Reports", icon: <Upload size={16} /> },
  { to: "/therapist/patients", label: "My Patients", icon: <Users size={16} /> },
  { to: "/therapist/earnings", label: "Earnings", icon: <Wallet size={16} /> },
  { to: "/therapist/complaints", label: "Complaints & Feedback", icon: <MessageSquareWarning size={16} /> },
  { to: "/therapist/profile", label: "My Profile", icon: <Stethoscope size={16} /> },
  { to: "/therapist/settings", label: "Settings", icon: <Settings size={16} /> },
];

export const adminNav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: <LayoutDashboard size={16} />, group: "Operations" },
  { to: "/admin/therapists", label: "Therapists", icon: <Shield size={16} />, group: "Operations" },
  { to: "/admin/patients", label: "Patients", icon: <Users size={16} />, group: "Operations" },
  { to: "/admin/bookings", label: "Bookings", icon: <CalendarClock size={16} />, group: "Operations" },
  { to: "/admin/service-areas", label: "Service Areas", icon: <MapPin size={16} />, group: "Operations" },
  { to: "/admin/schedules", label: "Schedules", icon: <Calendar size={16} />, group: "Operations" },
  { to: "/admin/leave", label: "Leave & Availability", icon: <ClipboardCheck size={16} />, group: "Operations", badge: 3 },
  { to: "/admin/payments", label: "Payments", icon: <CreditCard size={16} />, group: "Finance" },
  { to: "/admin/refunds", label: "Refunds & Disputes", icon: <RotateCcw size={16} />, group: "Finance", badge: 2 },
  { to: "/admin/complaints", label: "Complaints", icon: <AlertTriangle size={16} />, group: "Trust & Safety" },
  { to: "/admin/verification", label: "Therapist Verification", icon: <BadgeCheck size={16} />, group: "Trust & Safety", badge: 3 },
  { to: "/admin/performance", label: "Therapist Performance", icon: <BarChart3 size={16} />, group: "Trust & Safety", badge: 2 },
  { to: "/admin/safety-incidents", label: "Safety Incidents", icon: <ShieldAlert size={16} />, group: "Trust & Safety", badge: 1 },
  { to: "/admin/notifications", label: "Notifications", icon: <Bell size={16} />, group: "Trust & Safety", badge: 7 },
  { to: "/admin/analytics", label: "Analytics & Reports", icon: <LineChart size={16} />, group: "Insights" },
  { to: "/admin/admin-team", label: "Admin Team", icon: <UserCog size={16} />, group: "System" },
  { to: "/admin/activity-log", label: "Activity Log", icon: <ScrollText size={16} />, group: "System" },
  { to: "/admin/appearance", label: "Appearance", icon: <Palette size={16} />, group: "System" },
  { to: "/admin/settings", label: "Settings", icon: <Settings size={16} />, group: "System" },
];
