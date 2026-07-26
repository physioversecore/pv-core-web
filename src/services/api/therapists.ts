"use server";

import { api } from "./client";

export interface TherapistData {
  id: string;
  name: string;
  specialty: string;
  city: string;
  gender: string;
  rating: number;
  reviews: number;
  price: number;
  experience: number;
  bio: string;
  userId?: string;
}

interface TherapistListResponse {
  therapists: TherapistData[];
  total: number;
}

export interface TodaySessionData {
  id: string;
  time: string;
  patient: string;
  patientId: string;
  address: string;
  type: string;
  status: string;
}

export interface RecentUploadData {
  id: string;
  patient: string;
  kind: "x-ray" | "note" | "video";
  title: string;
  content: string;
  files: string[];
  date: string;
}

export interface PublicProfileData {
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  totalReviews: number;
}

export interface RecentRatingData {
  id: string;
  name: string;
  stars: number;
  text: string;
}

export interface TherapistDashboardData {
  name: string;
  sessionsThisWeek: number;
  totalPatients: number;
  earningsThisMonth: number;
  averageRating: number;
  todaySessions: TodaySessionData[];
  recentUploads: RecentUploadData[];
  publicProfile: PublicProfileData;
  recentRatings: RecentRatingData[];
  referralCode: string;
  referralLink: string;
}

export async function getTherapists(params?: {
  skip?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.skip) searchParams.set("skip", String(params.skip));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  return api.get<TherapistListResponse>(
    `/therapists?${searchParams.toString()}`,
  );
}

export async function getTherapist(id: string) {
  return api.get<TherapistData>(`/therapists/${id}`);
}

export async function updateTherapist(
  id: string,
  data: Partial<TherapistData>,
) {
  return api.put<TherapistData>(`/therapists/${id}`, data);
}

export async function createTherapist(data: {
  name: string;
  specialty: string;
  city: string;
  gender: string;
  price: number;
  experience: number;
  bio: string;
}) {
  return api.post<TherapistData>("/therapists", data);
}

export async function getTherapistDashboard(): Promise<TherapistDashboardData> {
  return api.get<TherapistDashboardData>("/therapists/me/dashboard");
}

export async function getMyTherapist(): Promise<TherapistData> {
  return api.get<TherapistData>("/therapists/me");
}

export interface TherapistSlotData {
  date: string;
  time: string;
  status: string;
  patientName?: string;
  patientPhone?: string;
  sessionType?: string;
  fee?: number;
  sessionId?: string;
}

export interface TherapistSlotRangeData {
  slots: TherapistSlotData[];
  blocks: {
    id: string;
    dateFrom: string;
    dateTo: string;
    daysOfWeek: string[];
    partsOfDay: string[];
    reason: string;
    notify: boolean;
    createdAt: string;
  }[];
}

export async function getTherapistSlots(
  therapistId: string,
  fromDate: string,
  toDate: string,
): Promise<TherapistSlotRangeData> {
  const params = new URLSearchParams({ from_date: fromDate, to_date: toDate });
  return api.get<TherapistSlotRangeData>(
    `/therapists/${therapistId}/slots?${params.toString()}`,
  );
}
