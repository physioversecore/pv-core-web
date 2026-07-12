"use server";

import { api } from "./client";

export interface AdminPatientData {
  id: string;
  name: string;
  city: string;
  sessions: number;
  therapist: string;
  therapistId: string;
  joined: string;
  isActive: boolean;
  phone?: string;
  email?: string;
}

export interface AdminTherapistData {
  id: string;
  name: string;
  city: string;
  specialty: string;
  rating: number;
  sessions: number;
  status: "Verified" | "Under review" | "Suspended";
  joined: string;
  isActive: boolean;
  phone?: string;
  email?: string;
}

export interface AdminPaymentData {
  id: string;
  patient: string;
  patientId: string;
  therapist: string;
  therapistId: string;
  amount: number;
  method: "eSewa" | "Khalti" | "Cash" | "Bank";
  status: "Paid" | "Pending" | "Refunded";
  date: string;
}

interface ListResponse<T> {
  items: T[];
  total: number;
}

export interface AdminListParams {
  skip?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getAdminPatients(params?: AdminListParams & { therapistId?: string }) {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params?.dateTo) sp.set("dateTo", params.dateTo);
  if (params?.therapistId) sp.set("therapistId", params.therapistId);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);

  return api.get<ListResponse<AdminPatientData>>(`/admin/patients?${sp.toString()}`);
}

export async function updateAdminPatient(id: string, data: Partial<AdminPatientData>) {
  return api.put<AdminPatientData>(`/admin/patients/${id}`, data);
}

export async function deleteAdminPatient(id: string) {
  return api.delete(`/admin/patients/${id}`);
}

export async function toggleAdminPatientStatus(id: string, isActive: boolean) {
  return api.put<AdminPatientData>(`/admin/patients/${id}`, { isActive });
}

export async function getAdminTherapists(params?: AdminListParams) {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params?.dateTo) sp.set("dateTo", params.dateTo);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);

  return api.get<ListResponse<AdminTherapistData>>(`/admin/therapists?${sp.toString()}`);
}

export async function updateAdminTherapist(id: string, data: Partial<AdminTherapistData>) {
  return api.put<AdminTherapistData>(`/admin/therapists/${id}`, data);
}

export async function deleteAdminTherapist(id: string) {
  return api.delete(`/admin/therapists/${id}`);
}

export async function toggleAdminTherapistStatus(id: string, status: AdminTherapistData["status"]) {
  return api.put<AdminTherapistData>(`/admin/therapists/${id}`, { status });
}

export async function getAdminPayments(params?: AdminListParams & { patientId?: string; therapistId?: string }) {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params?.dateTo) sp.set("dateTo", params.dateTo);
  if (params?.patientId) sp.set("patientId", params.patientId);
  if (params?.therapistId) sp.set("therapistId", params.therapistId);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);

  return api.get<ListResponse<AdminPaymentData>>(`/admin/payments?${sp.toString()}`);
}

export async function updateAdminPayment(id: string, data: Partial<AdminPaymentData>) {
  return api.put<AdminPaymentData>(`/admin/payments/${id}`, data);
}

export async function deleteAdminPayment(id: string) {
  return api.delete(`/admin/payments/${id}`);
}

// --- Payment Stats ---
export interface AdminPaymentStats {
  revenueThisMonth: number;
  revenueChangePercent: number;
  platformCommission: number;
  commissionPercent: number;
  pendingPayouts: number;
  pendingPayoutsNote: string;
  disputes: number;
  disputesNote: string;
}

export async function getAdminPaymentStats() {
  return api.get<AdminPaymentStats>("/admin/payments/stats");
}

// --- Payouts ---
export interface AdminPayoutData {
  id: string;
  therapist: string;
  therapistId: string;
  amount: number;
  status: "Paid" | "Pending" | "Processing";
  date: string;
  sessionsCovered: number;
  method: "Bank" | "Cash";
}

export async function getAdminPayouts(params?: AdminListParams & { therapistId?: string }) {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params?.dateTo) sp.set("dateTo", params.dateTo);
  if (params?.therapistId) sp.set("therapistId", params.therapistId);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);

  return api.get<ListResponse<AdminPayoutData>>(`/admin/payouts?${sp.toString()}`);
}

export async function updateAdminPayout(id: string, data: Partial<AdminPayoutData>) {
  return api.put<AdminPayoutData>(`/admin/payouts/${id}`, data);
}

export async function deleteAdminPayout(id: string) {
  return api.delete(`/admin/payouts/${id}`);
}
