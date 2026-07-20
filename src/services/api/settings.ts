"use server";

import { api } from "./client";

export interface Currency {
  code: string;
  name: string;
  flag: string;
  symbol: string;
  rate: number;
}

export interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
  type: string;
  subtype?: string;
}

export async function getCurrencies(): Promise<Currency[]> {
  try {
    const res = await api.get<{ currencies: Currency[] }>("/settings/currencies");
    return res.currencies ?? [];
  } catch {
    return [];
  }
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const res = await api.get<{ methods: PaymentMethod[] }>("/settings/payment-methods");
    return res.methods ?? [];
  } catch {
    return [];
  }
}
