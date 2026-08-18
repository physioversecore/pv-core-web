"use server";

import { api } from "./client";

export interface NextSessionData {
  id: string;
  therapistName: string;
  therapistId: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

export interface PatientDashboardData {
  name: string;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  nextSession: NextSessionData | null;
  referralCode: string;
  referralLink: string;
}

export interface ReferralData {
  code: string;
  link: string;
}

export async function getPatientDashboard(): Promise<PatientDashboardData> {
  return api.get<PatientDashboardData>("/patients/me/dashboard");
}

export async function getPatientReferral(): Promise<ReferralData> {
  return api.get<ReferralData>("/patients/me/referral");
}

export interface TherapistPatientData {
  id: string;
  name: string;
  phone: string;
  condition: string;
  sessions: number;
  last: string;
  notes: string;
}

interface TherapistPatientListResponse {
  patients: TherapistPatientData[];
  total: number;
}

export async function getTherapistPatients(params?: {
  skip?: number;
  limit?: number;
  search?: string;
  condition?: string;
  lastVisit?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.skip) searchParams.set("skip", String(params.skip));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.condition) searchParams.set("condition", params.condition);
  if (params?.lastVisit && params.lastVisit !== "all")
    searchParams.set("lastVisit", params.lastVisit);

  return api.get<TherapistPatientListResponse>(
    `/patients/my-patients?${searchParams.toString()}`,
  );
}

// --- Onboarding ---

export interface OnboardingData {
  name?: string;
  phone?: string;
  city?: string;
  address?: string;
  dob?: string;
  gender?: string;
  condition?: string;
  medicalHistory?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dob?: string;
  phone?: string;
  condition?: string;
  gender?: string;
}

export interface OnboardingStatus {
  completed: boolean;
  step?: string;
}

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  return api.get<OnboardingStatus>("/patients/me/onboarding-status");
}

export async function completeOnboarding(data: OnboardingData) {
  return api.post<{ success: boolean }>("/patients/me/onboarding", data);
}

export async function saveOnboardingProgress(step: string, data: Record<string, unknown>) {
  return api.post<{ success: boolean }>("/patients/me/onboarding/progress", { step, ...data });
}

export async function getFamilyMembers() {
  return api.get<FamilyMember[]>("/patients/me/family-members");
}

export async function addFamilyMember(data: Omit<FamilyMember, "id">) {
  return api.post<FamilyMember>("/patients/me/family-members", data);
}

export async function updateFamilyMember(id: string, data: Partial<FamilyMember>) {
  return api.put<FamilyMember>(`/patients/me/family-members/${id}`, data);
}

export async function deleteFamilyMember(id: string) {
  return api.delete<void>(`/patients/me/family-members/${id}`);
}
