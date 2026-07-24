"use server";

import { api } from "./client";
import type { UserData } from "./auth";
import type { TherapistData } from "./therapists";
import type { PatientProfile } from "@/types";

export async function getPatientProfile(): Promise<PatientProfile> {
  return api.get<PatientProfile>("/patients/me/profile");
}

export async function updatePatientProfile(data: Partial<PatientProfile>): Promise<PatientProfile> {
  return api.put<PatientProfile>("/patients/me/profile", data);
}

export async function updateTherapistProfile(data: Partial<TherapistData>) {
  return api.put<TherapistData>("/therapists/me", data);
}
