"use server";

import { api } from "./client";

export interface TherapistToRate {
  sessionId: string;
  therapistId: string;
  therapistName: string;
  sessionDate: string;
  sessionType: string;
}

export interface ReviewResponse {
  id: string;
  sessionId: string;
  patientId: string;
  therapistId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

interface ReviewListResponse {
  reviews: ReviewResponse[];
  total: number;
}

export async function getTherapistsToRate(limit?: number): Promise<TherapistToRate[]> {
  const query = limit ? `?limit=${limit}` : "";
  return api.get<TherapistToRate[]>(`/reviews/therapists-to-rate${query}`);
}

export async function submitReview(data: {
  sessionId: string;
  rating: number;
  comment?: string;
}): Promise<ReviewResponse> {
  return api.post<ReviewResponse>("/reviews", data);
}

export async function getMyReviews(): Promise<ReviewListResponse> {
  return api.get<ReviewListResponse>("/reviews");
}
