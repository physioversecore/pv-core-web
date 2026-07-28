"use server";

import { api } from "./client";

export interface ServiceData {
  id: string;
  name: string;
  description: string;
  category: string;
  iconName: string;
  isActive: boolean;
  sortOrder: number;
}

interface ServiceListResponse {
  services: ServiceData[];
  total: number;
}

export async function getServices(params?: {
  category?: string;
  skip?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.skip) searchParams.set("skip", String(params.skip));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  return api.get<ServiceListResponse>(
    `/services?${searchParams.toString()}`,
  );
}

export async function getService(id: string) {
  return api.get<ServiceData>(`/services/${id}`);
}
