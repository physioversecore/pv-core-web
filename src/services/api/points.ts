"use server";

import { api } from "./client";

export interface PointBalance {
  balance: number;
  pending: number;
  earned: number;
  used: number;
  referred: number;
  /** Rs per point, so the client never hardcodes the rate. */
  pointToNpr: number;
}

export interface PointTransaction {
  id: string;
  delta: number;
  type: string;
  status: string;
  reason?: string | null;
  refType?: string | null;
  refId?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export interface PointTransactionListResponse {
  transactions: PointTransaction[];
  total: number;
}

/** INVITED -> JOINED -> PENDING -> REWARDED, or REVERSED. */
export interface ReferralEntry {
  id: string;
  name: string;
  state: string;
  points?: number | null;
  joinedAt?: string | null;
}

export interface ReferralSummary {
  code: string;
  link: string;
  awardPoints: number;
  referrals: ReferralEntry[];
}

export interface ApplyPointsResponse {
  pointsApplied: number;
  discountAmount: number;
  /** The therapist is still paid in full; the platform funds the discount. */
  sessionFee: number;
  payable: number;
}

export async function getPointBalance(): Promise<PointBalance> {
  return api.get<PointBalance>("/points/me");
}

export async function getPointTransactions(params?: {
  skip?: number;
  limit?: number;
}): Promise<PointTransactionListResponse> {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  return api.get<PointTransactionListResponse>(`/points/me/transactions?${sp.toString()}`);
}

export async function getReferralSummary(): Promise<ReferralSummary> {
  return api.get<ReferralSummary>("/points/me/referrals");
}

/**
 * Redeem against a session that already exists — redemption needs a session
 * id, so this runs after the booking is created rather than as part of it.
 */
export async function applyPointsToSession(
  sessionId: string,
  points: number,
): Promise<ApplyPointsResponse> {
  return api.post<ApplyPointsResponse>(`/points/sessions/${sessionId}/apply`, { points });
}
