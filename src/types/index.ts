export interface Therapist {
  id: string;
  name: string;
  specialty: string;
  city: string;
  gender: "Male" | "Female";
  rating: number;
  reviews: number;
  price: number;
  experience: number;
  bio: string;
  userId?: string;
}

export interface Product {
  id: string;
  name: string;
  category: "equipment" | "medicine" | "nutrition";
  description: string;
  price: number;
  rentPerDay?: number;
  inStock: boolean;
  emoji: string;
  imageUrl?: string;
}

export interface Session {
  id: string;
  therapist: string;
  therapistId: string;
  date: string;
  time: string;
  type: string;
  status: "Confirmed" | "Completed" | "Cancelled" | "Pending" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  patient?: string;
  patientId?: string;
  address?: string;
  fee?: number;
}

export type Role = "patient" | "therapist" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  city?: string;
  phone?: string;
  specialty?: string;
  status?: string;
}

export interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export type AuthMode = "login" | "signup";

export type BookingStatus = "Confirmed" | "Pending" | "Completed" | "Cancelled";
export type PaymentStatus = "Paid" | "Pending" | "Refunded";
export type TherapistStatus = "Verified" | "Under review" | "Suspended";
export type UploadKind = "x-ray" | "note" | "video";
