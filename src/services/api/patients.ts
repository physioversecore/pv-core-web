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
