"use server";

import { api } from "./client";
import type { UserData } from "./auth";
import type { TherapistData } from "./therapists";

export async function updatePatientProfile(data: Partial<UserData>) {
  return api.put<UserData>("/auth/me", data);
}

export async function updateTherapistProfile(data: Partial<TherapistData>) {
  return api.put<TherapistData>("/therapists/me", data);
}
