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
  mediaUrls?: string;
}

export interface Clinic {
  id: string;
  name: string;
  area: string;
  city: string;
  address: string;
  services: string[];
  phone: string;
  hours: string;
}

export interface Package {
  id: string;
  name: string;
  tag: string;
  icon: string;
  price: number;
  cadence: string;
  blurb: string;
  points: string[];
  featured: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  city: string;
  address?: string;
  history?: string;
  dob?: string;
  age?: number;
  gender: "Any" | "Male" | "Female";
  condition?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
  notifEmail: boolean;
  notifSms: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TherapistProfileDocument {
  id: string;
  documentType?: string;
  documentUrl?: string;
  fileName?: string;
  fileSize?: number;
  status?: string;
  note?: string;
}

export interface TherapistProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  specialty: string;
  gender: string;
  price: number;
  experience: number;
  bio: string;
  mediaUrls?: string;
  photo?: string;
  documents?: TherapistProfileDocument[];
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
  badge?: number | string;
  group?: string;
}

export type ComplaintPriority = "Normal" | "Urgent";
export type ComplaintStatus = "Open" | "Under review" | "Resolved" | "Dismissed";
export type ComplaintType = "patient" | "therapist";
export type CaseSource = "PATIENT_SUBMITTED" | "THERAPIST_SUBMITTED" | "ADMIN_MANUAL";

export interface Complaint {
  id: string;
  type: ComplaintType;
  complainant: string;
  complainantId: string;
  against: string;
  againstId: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  filed: string;
  description: string;
  bookingId?: string;
  notes?: string[];
  source?: CaseSource;
  refundId?: string;
}

export type NotificationCategory = "booking" | "reschedule" | "complaint" | "payment" | "system";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export type AuthMode = "login" | "signup";

export type BookingStatus = "Confirmed" | "Pending" | "Completed" | "Cancelled";
export type PaymentStatus = "Paid" | "Pending" | "Refunded";
export type TherapistStatus = "Verified" | "Under review" | "Suspended";
export type UploadKind = "x-ray" | "note" | "video";

// --- Admin Bookings ---
export type AdminBookingStatus = "Confirmed" | "Cancelled" | "Rescheduled";

export interface AdminBookingTrailEvent {
  id: string;
  type: "cancelled" | "rebooked" | "confirmed";
  timestamp: string;
  description: string;
  dotColor: "danger" | "secondary";
}

export interface AdminBookingData {
  id: string;
  patient: string;
  patientId: string;
  patientPhone?: string;
  patientEmail?: string;
  therapist: string;
  therapistId: string;
  therapistPhone?: string;
  therapistEmail?: string;
  date: string;
  originalTime: string;
  sessionType: string;
  status: AdminBookingStatus;
  trail?: AdminBookingTrailEvent[];
  paymentStatus?: "Paid" | "Pending" | "Refunded";
  paymentMethod?: string;
  sessionNotes?: string;
}

// --- Admin Team ---
export type AdminRoleName = "Super Admin" | "Support Admin" | "Finance Admin";

export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  role: AdminRoleName;
  isActive: boolean;
  permissions: string[];
  permissionSummary: string;
}
