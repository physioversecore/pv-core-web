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
