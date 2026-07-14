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

export async function uploadFile(file: File, patientId: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return api.upload<UploadResponse>(`/uploads/${patientId}`, formData);
}

export async function getReports(patientId?: string): Promise<ReportData[]> {
  const query = patientId ? `?patient_id=${patientId}` : "";
  return api.get<ReportData[]>(`/reports${query}`);
}

export async function getMyPatients(): Promise<PatientSummary[]> {
  return api.get<PatientSummary[]>("/patients/my-patients");
}
