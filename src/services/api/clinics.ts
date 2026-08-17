"use server";

import { api } from "./client";
import type { Clinic } from "@/types";

export interface ClinicListResponse {
  clinics: Clinic[];
  total: number;
}

export async function getClinics(params?: {
  skip?: number;
  limit?: number;
  search?: string;
  city?: string;
}): Promise<ClinicListResponse> {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.city) sp.set("city", params.city);
  return api.get<ClinicListResponse>(`/clinics?${sp.toString()}`);
}
