"use server";

import { api } from "./client";
import type { Package } from "@/types";

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
