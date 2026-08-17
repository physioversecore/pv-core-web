"use server";

import { clinics, type ClinicData } from "@/constants/landing";

export interface ClinicListResponse {
  clinics: ClinicData[];
  total: number;
}

export async function getClinics(): Promise<ClinicListResponse> {
  return { clinics, total: clinics.length };
}
