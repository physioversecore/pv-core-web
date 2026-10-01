"use server";

import { api } from "./client";

export interface PaymentData {
  id: string;
  userId: string;
  amount: number;
  status: string;
  method: string;
  sessionId?: string;
  currency: string;
  platformFee: number;
  paymentType?: string;
  transactionRef?: string;
  cardLast4?: string;
  walletMobile?: string;
  billingCountry?: string;
}

export interface ConfirmPaymentResult {
  payment: PaymentData;
  result: string;
}

/** Server-side gateway verification. Called by the webhook route handler and
 *  by the confirmation page to re-check a payment whose webhook was missing or
 *  could not confirm the very first time. */
export async function confirmPayment(
  paymentId: string,
  params: Record<string, string> = {},
): Promise<ConfirmPaymentResult> {
  return api.post<ConfirmPaymentResult>(`/payments/${paymentId}/confirm`, { params });
}

/** Current stored status of a payment (no gateway call). */
export async function getPaymentStatus(paymentId: string): Promise<PaymentData> {
  return api.get<PaymentData>(`/payments/${paymentId}/status`);
}
