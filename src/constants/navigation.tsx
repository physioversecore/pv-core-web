import type { ReactNode } from "react";
import {
  LayoutDashboard, Calendar, ShoppingBag, Activity, FileText, User, HelpCircle,
  Stethoscope, Upload, Users, Wallet, Settings, Shield, CreditCard,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export const NAV_LINKS = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/services", label: "Services" },
  { to: "/therapists", label: "Therapists" },
  { to: "/find", label: "Find a Therapist" },
  { to: "/app", label: "App" },
] as const;

export const RESOURCE_LINKS = [
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQ" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/about", label: "About us" },
  { to: "/contact", label: "Contact us" },
] as const;

export const patientNav: NavItem[] = [
  { to: "/patient", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { to: "/patient/sessions", label: "My Sessions", icon: <Calendar size={16} /> },
  { to: "/patient/shop", label: "Shop", icon: <ShoppingBag size={16} /> },
  { to: "/patient/progress", label: "Recovery Progress", icon: <Activity size={16} /> },
  { to: "/patient/reports", label: "Reports & Files", icon: <FileText size={16} /> },
  { to: "/patient/profile", label: "My Profile", icon: <User size={16} /> },
  { to: "/patient/help", label: "Help", icon: <HelpCircle size={16} /> },
  { to: "/patient/settings", label: "Settings", icon: <Settings size={16} /> },
];

export const therapistNav: NavItem[] = [
  { to: "/therapist", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { to: "/therapist/schedule", label: "My Schedule", icon: <Calendar size={16} /> },
  { to: "/therapist/reports", label: "Upload Reports", icon: <Upload size={16} /> },
  { to: "/therapist/patients", label: "My Patients", icon: <Users size={16} /> },
  { to: "/therapist/earnings", label: "Earnings", icon: <Wallet size={16} /> },
  { to: "/therapist/profile", label: "My Profile", icon: <Stethoscope size={16} /> },
  { to: "/therapist/settings", label: "Settings", icon: <Settings size={16} /> },
];

export const adminNav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { to: "/admin/therapists", label: "Therapists", icon: <Shield size={16} /> },
  { to: "/admin/patients", label: "Patients", icon: <Users size={16} /> },
  { to: "/admin/bookings", label: "Bookings", icon: <Calendar size={16} /> },
  { to: "/admin/payments", label: "Payments", icon: <CreditCard size={16} /> },
  { to: "/admin/settings", label: "Settings", icon: <Settings size={16} /> },
];
