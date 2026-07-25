"use server";

import { api } from "./client";
import type { PatientProfile, TherapistProfile } from "@/types";

export async function getPatientProfile(): Promise<PatientProfile> {
  return api.get<PatientProfile>("/patients/me/profile");
}

export async function updatePatientProfile(data: Partial<PatientProfile>): Promise<PatientProfile> {
  return api.put<PatientProfile>("/patients/me/profile", data);
}

export async function getTherapistProfile(): Promise<TherapistProfile> {
  return api.get<TherapistProfile>("/therapists/me/profile");
}

export async function updateTherapistProfile(data: Partial<TherapistProfile>): Promise<TherapistProfile> {
  return api.put<TherapistProfile>("/therapists/me/profile", data);
}
