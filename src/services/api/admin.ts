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

export interface PatientComplaintPayload {
  patientId: string;
  patient: string;
  therapistId: string;
  therapist: string;
  bookingId?: string;
  category: string;
  priority: "Normal" | "Urgent";
  description: string;
  evidenceUrls?: string[];
  preferredOutcome?: string;
}

export async function submitPatientComplaint(data: PatientComplaintPayload) {
  return api.post<AdminComplaintData>("/admin/complaints", {
    ...data,
    type: "patient",
    status: "Open",
    filed: new Date().toISOString(),
  });
}

export async function getPatientComplaints(patientId: string) {
  return api.get<ListResponse<AdminComplaintData>>(
    `/admin/complaints?type=patient&complainantId=${patientId}`
  );
}

export interface TherapistComplaintPayload {
  therapistId: string;
  therapist: string;
  patientId: string;
  patient: string;
  bookingId?: string;
  category: string;
  priority: "Normal" | "Urgent";
  description: string;
  evidenceUrls?: string[];
  preferredOutcome?: string;
}

export async function submitTherapistComplaint(data: TherapistComplaintPayload) {
  return api.post<AdminComplaintData>("/admin/complaints", {
    ...data,
    type: "therapist",
    status: "Open",
    filed: new Date().toISOString(),
  });
}

export async function getTherapistComplaints(therapistId: string) {
  return api.get<ListResponse<AdminComplaintData>>(
    `/admin/complaints?type=therapist&complainantId=${therapistId}`
  );
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

// --- Service Areas ---
export interface AdminServiceAreaData {
  id: string;
  name: string;
  localities: string[];
  assignedTherapists: number;
  bookingsThisMonth: number;
  status: "Active" | "Low coverage";
}

export interface AdminServiceAreaListParams extends AdminListParams {
  status?: string;
}

export async function getAdminServiceAreas(params?: AdminServiceAreaListParams) {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.status) sp.set("status", params.status);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  return api.get<ListResponse<AdminServiceAreaData>>(`/admin/service-areas?${sp.toString()}`);
}

export async function createAdminServiceArea(data: { name: string; localities: string[]; therapistIds?: string[] }) {
  return api.post<AdminServiceAreaData>("/admin/service-areas", data);
}

export async function updateAdminServiceArea(id: string, data: Partial<AdminServiceAreaData>) {
  return api.put<AdminServiceAreaData>(`/admin/service-areas/${id}`, data);
}

export async function assignTherapistToZone(zoneId: string, therapistId: string) {
  return api.post(`/admin/service-areas/${zoneId}/assign`, { therapistId });
}

// --- Leave & Availability ---
export interface AdminLeaveData {
  id: string;
  therapist: string;
  therapistId: string;
  dateFrom: string;
  dateTo: string;
  reason: string;
  bookingsAffected: number;
  status: "Pending" | "Approved" | "Declined";
}

export interface AdminLeaveListParams extends AdminListParams {
  status?: string;
  therapistId?: string;
}

export async function getAdminLeaves(params?: AdminLeaveListParams) {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.status) sp.set("status", params.status);
  if (params?.therapistId) sp.set("therapistId", params.therapistId);
  if (params?.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params?.dateTo) sp.set("dateTo", params.dateTo);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  return api.get<ListResponse<AdminLeaveData>>(`/admin/leaves?${sp.toString()}`);
}

export async function approveLeave(id: string) {
  return api.put<AdminLeaveData>(`/admin/leaves/${id}`, { status: "Approved" });
}

export async function declineLeave(id: string, reason?: string) {
  return api.put<AdminLeaveData>(`/admin/leaves/${id}`, { status: "Declined", reason });
}

// --- Therapist Verification ---
export interface AdminVerificationData {
  id: string;
  therapist: string;
  therapistId: string;
  documentType: "Practice license" | "Government ID" | "Certification";
  uploaded: string;
  expires: string | null;
  status: "Pending review" | "Verified" | "Expiring soon" | "Expired" | "Rejected";
}

export interface AdminVerificationListParams extends AdminListParams {
  documentType?: string;
  status?: string;
}

export async function getAdminVerifications(params?: AdminVerificationListParams) {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.documentType) sp.set("documentType", params.documentType);
  if (params?.status) sp.set("status", params.status);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  return api.get<ListResponse<AdminVerificationData>>(`/admin/verifications?${sp.toString()}`);
}

export async function approveVerification(id: string) {
  return api.put<AdminVerificationData>(`/admin/verifications/${id}`, { status: "Verified" });
}

export async function rejectVerification(id: string, note: string) {
  return api.put<AdminVerificationData>(`/admin/verifications/${id}`, { status: "Rejected", note });
}

export async function suspendTherapistBookings(id: string) {
  return api.put(`/admin/verifications/${id}/suspend`, {});
}

// --- Therapist Performance ---
export interface AdminPerformanceData {
  id: string;
  name: string;
  avgRating: number;
  sessions: number;
  reviews: number;
  trend: number;
  linkedComplaints: number;
  status: "Good standing" | "Needs review" | "Under probation" | "Removed";
}

export interface AdminPerformanceListParams extends AdminListParams {
  status?: string;
  minRating?: number;
}

export async function getAdminPerformance(params?: AdminPerformanceListParams) {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.status) sp.set("status", params.status);
  if (params?.minRating) sp.set("minRating", String(params.minRating));
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  return api.get<ListResponse<AdminPerformanceData>>(`/admin/performance?${sp.toString()}`);
}

export async function scheduleReview(id: string, data: { date: string; adminId: string; notes: string }) {
  return api.post(`/admin/performance/${id}/schedule-review`, data);
}

export async function placeOnProbation(id: string, data: { note: string; reviewBy: string }) {
  return api.put<AdminPerformanceData>(`/admin/performance/${id}/probation`, data);
}

export async function removeFromTeam(id: string, reason: string) {
  return api.put<AdminPerformanceData>(`/admin/performance/${id}/remove`, { reason });
}

// --- Safety Incidents ---
export interface AdminIncidentData {
  id: string;
  reportedBy: "Patient" | "Therapist";
  therapist: string;
  patient: string;
  severity: "Critical" | "High" | "Medium";
  summary: string;
  status: "Active" | "Investigating" | "Resolved";
  reportedAt: string;
}

export interface AdminIncidentListParams extends AdminListParams {
  severity?: string;
  status?: string;
  reportedBy?: string;
}

export async function getAdminIncidents(params?: AdminIncidentListParams) {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.severity) sp.set("severity", params.severity);
  if (params?.status) sp.set("status", params.status);
  if (params?.reportedBy) sp.set("reportedBy", params.reportedBy);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  return api.get<ListResponse<AdminIncidentData>>(`/admin/incidents?${sp.toString()}`);
}

export async function escalateIncident(id: string) {
  return api.put<AdminIncidentData>(`/admin/incidents/${id}/escalate`, {});
}

export async function resolveIncident(id: string, outcome: string) {
  return api.put<AdminIncidentData>(`/admin/incidents/${id}/resolve`, { outcome });
}

// --- Activity Log ---
export interface AdminActivityLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorId: string | null;
  actionType: string;
  description: string;
}

export interface AdminActivityLogListParams extends AdminListParams {
  adminId?: string;
  actionType?: string;
}

export async function getAdminActivityLog(params?: AdminActivityLogListParams) {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.adminId) sp.set("adminId", params.adminId);
  if (params?.actionType) sp.set("actionType", params.actionType);
  if (params?.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params?.dateTo) sp.set("dateTo", params.dateTo);
  return api.get<ListResponse<AdminActivityLogEntry>>(`/admin/activity-log?${sp.toString()}`);
}

// --- Analytics ---
export interface AdminAnalyticsStats {
  revenueMTD: string;
  revenueChange: string;
  cancellationRate: string;
  cancellationChange: string;
  repeatBookingRate: string;
  repeatChange: string;
  avgSessionRating: string;
  ratingNote: string;
}

export interface ZoneBookingStat {
  zone: string;
  bookings: number;
  isWarning?: boolean;
}

export interface TherapistCancellationStat {
  therapist: string;
  rate: number;
  isWarning?: boolean;
  isAmber?: boolean;
}

export interface RevenueMonthStat {
  month: string;
  revenue: string;
}

export async function getAdminAnalyticsStats() {
  return api.get<AdminAnalyticsStats>("/admin/analytics/stats");
}

export async function getBookingsByZone(dateRange?: string) {
  const sp = new URLSearchParams();
  if (dateRange) sp.set("dateRange", dateRange);
  return api.get<ZoneBookingStat[]>(`/admin/analytics/bookings-by-zone?${sp.toString()}`);
}

export async function getCancellationRateByTherapist(dateRange?: string) {
  const sp = new URLSearchParams();
  if (dateRange) sp.set("dateRange", dateRange);
  return api.get<TherapistCancellationStat[]>(`/admin/analytics/cancellation-rate?${sp.toString()}`);
}

export async function getRevenueTrend(months?: number) {
  const sp = new URLSearchParams();
  if (months) sp.set("months", String(months));
  return api.get<RevenueMonthStat[]>(`/admin/analytics/revenue-trend?${sp.toString()}`);
}

// --- Refunds & Disputes ---
export type RefundReason = "No-show" | "Double charge" | "Service quality" | "Cancellation";
export type RefundStatus = "Pending" | "Approved" | "Denied";

export interface AdminRefundData {
  id: string;
  patient: string;
  patientId: string;
  bookingId: string;
  amount: number;
  reason: RefundReason;
  status: RefundStatus;
  filed: string;
  resolvedAt?: string;
  denyReason?: string;
}

export interface AdminRefundListParams extends AdminListParams {
  reason?: string;
  status?: string;
}

export async function getAdminRefunds(params?: AdminRefundListParams) {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.search) sp.set("search", params.search);
  if (params?.reason) sp.set("reason", params.reason);
  if (params?.status) sp.set("status", params.status);
  if (params?.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params?.dateTo) sp.set("dateTo", params.dateTo);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  return api.get<ListResponse<AdminRefundData>>(`/admin/refunds?${sp.toString()}`);
}

export async function approveRefund(id: string) {
  return api.put<AdminRefundData>(`/admin/refunds/${id}`, { status: "Approved" });
}

export async function denyRefund(id: string, reason: string) {
  return api.put<AdminRefundData>(`/admin/refunds/${id}`, { status: "Denied", denyReason: reason });
}

export async function getAdminRefundStats() {
  return api.get<{ pending: number; refundedThisMonth: number; disputeRate: number; avgResolutionDays: number }>("/admin/refunds/stats");
}
