"use server";

import { api } from "./client";

export interface ReportData {
  id: string;
  patientId: string;
  sessionId?: string | null;
  title: string;
  content: string;
  fileUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TherapistReportData extends ReportData {
  patient: string;
  files: string[];
  date: string;
}

export interface PaginatedReports {
  reports: TherapistReportData[];
  total: number;
}

export interface ReportCreateData {
  patientId: string;
  sessionId?: string;
  title: string;
  content: string;
  fileUrl?: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

export interface PatientSummary {
  id: string;
  name: string;
}

export async function createReport(data: ReportCreateData): Promise<ReportData> {
  return api.post<ReportData>("/reports", data);
}

export async function uploadReport(formData: FormData): Promise<ReportData> {
  return api.upload<ReportData>("/reports", formData);
}

export async function uploadFile(file: File, patientId: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return api.upload<UploadResponse>(`/uploads/${patientId}`, formData);
}

export async function getReports(patientId?: string): Promise<ReportData[]> {
  const query = patientId ? `?patient_id=${patientId}` : "";
  return api.get<ReportData[]>(`/reports${query}`);
}

export async function getTherapistReports(
  page: number = 1,
  limit: number = 6,
): Promise<PaginatedReports> {
  const skip = (page - 1) * limit;
  return api.get<PaginatedReports>(`/reports/therapist?skip=${skip}&limit=${limit}`);
}

export async function getMyPatients(): Promise<PatientSummary[]> {
  const res = await api.get<{ patients: PatientSummary[]; total: number }>("/patients/my-patients");
  return res.patients;
}

export async function deleteReport(reportId: string): Promise<void> {
  return api.delete(`/reports/${reportId}`);
}
