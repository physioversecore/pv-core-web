"use server";

import { api } from "./client";
import type {
  Package,
  PackagePurchase,
  PackagePurchaseDetail,
  PackagePurchaseListResponse,
} from "@/types";

export interface PackageListResponse {
  packages: Package[];
  total: number;
}

export async function getPackages(params?: {
  skip?: number;
  limit?: number;
}): Promise<PackageListResponse> {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  return api.get<PackageListResponse>(`/packages?${sp.toString()}`);
}

export async function purchasePackage(
  packageId: string,
  paymentMethod: string,
): Promise<PackagePurchase> {
  return api.post<PackagePurchase>(`/packages/${packageId}/purchase`, {
    paymentMethod,
  });
}

export async function getMyPackages(): Promise<PackagePurchaseListResponse> {
  return api.get<PackagePurchaseListResponse>("/packages/my-purchases");
}

export async function getActivePackage(): Promise<PackagePurchaseDetail | null> {
  try {
    return await api.get<PackagePurchaseDetail>("/packages/my-purchases/active");
  } catch {
    return null;
  }
}
