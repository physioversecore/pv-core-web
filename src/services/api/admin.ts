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

// --- Complaints ---
export interface AdminComplaintData {
  id: string;
  type: "patient" | "therapist";
  complainant: string;
  complainantId: string;
  against: string;
  againstId: string;
  category: string;
  priority: "Normal" | "Urgent";
  status: "Open" | "Under review" | "Resolved" | "Dismissed";
  filed: string;
  description: string;
  bookingId?: string;
  notes?: string[];
}

export interface AdminComplaintListParams extends AdminListParams {
  type?: "patient" | "therapist";
}

export async function getAdminComplaints(params?: AdminComplaintListParams) {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.type) sp.set("type", params.type);
  if (params?.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params?.dateTo) sp.set("dateTo", params.dateTo);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);

  return api.get<ListResponse<AdminComplaintData>>(`/admin/complaints?${sp.toString()}`);
}

export async function updateAdminComplaint(id: string, data: Partial<AdminComplaintData>) {
  return api.put<AdminComplaintData>(`/admin/complaints/${id}`, data);
}

// --- Notifications ---
export interface AdminNotificationData {
  id: string;
  category: "booking" | "reschedule" | "complaint" | "payment" | "system";
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface AdminNotificationListParams {
  skip?: number;
  limit?: number;
  category?: string;
  read?: boolean;
}

export async function getAdminNotifications(params?: AdminNotificationListParams) {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.category) sp.set("category", params.category);
  if (params?.read !== undefined) sp.set("read", String(params.read));

  return api.get<ListResponse<AdminNotificationData>>(`/admin/notifications?${sp.toString()}`);
}

export async function markNotificationRead(id: string) {
  return api.put<AdminNotificationData>(`/admin/notifications/${id}`, { read: true });
}

export async function markAllNotificationsRead() {
  return api.put(`/admin/notifications/read-all`, {});
}

// --- Admin Bookings (trail/history) ---
export interface AdminBookingTrailEvent {
  id: string;
  type: "cancelled" | "rebooked" | "confirmed";
  timestamp: string;
  description: string;
  dotColor: "danger" | "secondary";
}

export interface AdminBookingData {
  id: string;
  patient: string;
  patientId: string;
  patientPhone?: string;
  patientEmail?: string;
  therapist: string;
  therapistId: string;
  therapistPhone?: string;
  therapistEmail?: string;
  date: string;
  originalTime: string;
  sessionType: string;
  status: "Confirmed" | "Cancelled" | "Rescheduled";
  trail: AdminBookingTrailEvent[];
  paymentStatus?: "Paid" | "Pending" | "Refunded";
  sessionNotes?: string;
}

export interface AdminBookingListParams extends AdminListParams {
  status?: string;
}

export async function getAdminBookings(params?: AdminBookingListParams) {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.status) sp.set("status", params.status);
  if (params?.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params?.dateTo) sp.set("dateTo", params.dateTo);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);

  return api.get<ListResponse<AdminBookingData>>(`/admin/bookings?${sp.toString()}`);
}

// --- Admin Team ---
export type AdminRoleName = "Super Admin" | "Support Admin" | "Finance Admin";

export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  role: AdminRoleName;
  isActive: boolean;
  permissions: string[];
  permissionSummary: string;
}

export async function getAdminUsers() {
  return api.get<ListResponse<AdminUserData>>("/admin/team");
}

export async function inviteAdminUser(data: { email: string; name: string; role: AdminRoleName }) {
  return api.post<AdminUserData>("/admin/team/invite", data);
}

export async function updateAdminUserRole(id: string, role: AdminRoleName) {
  return api.put<AdminUserData>(`/admin/team/${id}`, { role });
}

export async function deactivateAdminUser(id: string) {
  return api.put<AdminUserData>(`/admin/team/${id}`, { isActive: false });
}

export async function reactivateAdminUser(id: string) {
  return api.put<AdminUserData>(`/admin/team/${id}`, { isActive: true });
}
