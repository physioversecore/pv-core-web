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

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
