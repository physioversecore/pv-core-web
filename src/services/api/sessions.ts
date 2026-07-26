"use server";

import { api, AuthError } from "./client";

export interface SessionData {
  id: string;
  therapistId: string;
  therapistName?: string;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  date: string;
  time: string;
  type: string;
  status: string;
  address: string;
  fee: number;
  notes?: string;
}

interface SessionListResponse {
  sessions: SessionData[];
  total: number;
}

export async function getSessions(params?: {
  skip?: number;
  limit?: number;
  therapistId?: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.set("skip", String(params.skip));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.therapistId) searchParams.set("therapistId", params.therapistId);
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);

    return await api.get<SessionListResponse>(
      `/sessions?${searchParams.toString()}`,
    );
  } catch (e) {
    if (e instanceof AuthError) return { sessions: [], total: 0 };
    throw e;
  }
}

export async function getSession(id: string) {
  try {
    return await api.get<SessionData>(`/sessions/${id}`);
  } catch (e) {
    if (e instanceof AuthError) return null;
    throw e;
  }
}

export async function createSession(data: {
  therapistId: string;
  date: string;
  time: string;
  type?: string;
  address: string;
  fee: number;
  notes?: string;
}) {
  return api.post<SessionData>("/sessions", data);
}

export async function updateSession(
  id: string,
  data: { status?: string; date?: string; time?: string; notes?: string },
) {
  return api.put<SessionData>(`/sessions/${id}`, data);
}

export async function deleteSession(id: string) {
  return api.delete(`/sessions/${id}`);
}

export interface BookingPaymentPayload {
  therapistId: string;
  date: string;
  time: string;
  type?: string;
  address: string;
  fee: number;
  notes?: string;
  currency: string;
  paymentMethod: string;
  paymentType: string;
  platformFee: number;
  cardLast4?: string;
  walletMobile?: string;
  billingCountry?: string;
}

export interface BookingPaymentResult {
  session: SessionData;
  payment: {
    id: string;
    amount: number;
    status: string;
    method: string;
    currency: string;
    platformFee: number;
  };
}

export async function processBooking(data: BookingPaymentPayload) {
  return api.post<BookingPaymentResult>("/payments/process", data);
}

export async function rescheduleSession(
  id: string,
  data: { newDate: string; newTime: string },
) {
  return api.patch<SessionData>(`/sessions/${id}/reschedule`, data);
}
