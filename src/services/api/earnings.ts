"use server";

import { api } from "./client";

export interface TransactionData {
  id: string;
  date: string;
  patient: string;
  sessionType: string;
  fee: number;
  status: "Completed" | "Scheduled" | "Cancelled";
}

export interface PayoutData {
  date: string;
  ref: string;
  method: "eSewa" | "Khalti" | "Bank transfer";
  account: string;
  amount: number;
  status: "Paid" | "Processing" | "Failed";
}

interface TransactionListResponse {
  transactions: TransactionData[];
  total: number;
}

interface PayoutListResponse {
  payouts: PayoutData[];
  total: number;
}

export async function getTherapistTransactions(params?: {
  skip?: number;
  limit?: number;
  period?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.skip) searchParams.set("skip", String(params.skip));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.period) searchParams.set("period", params.period);

  return api.get<TransactionListResponse>(
    `/therapist/earnings/transactions?${searchParams.toString()}`,
  );
}

export async function getTherapistPayouts(params?: {
  skip?: number;
  limit?: number;
  period?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.skip) searchParams.set("skip", String(params.skip));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.period) searchParams.set("period", params.period);

  return api.get<PayoutListResponse>(
    `/therapist/earnings/payouts?${searchParams.toString()}`,
  );
}
