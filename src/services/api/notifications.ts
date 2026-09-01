"use server";

import { api } from "./client";

/**
 * The per-user in-app feed. Distinct from `/admin/notifications`, which is an
 * admin-scoped view synthesised from sessions rather than stored rows.
 */
export interface NotificationData {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt?: string | null;
  refType?: string | null;
  refId?: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationData[];
  total: number;
  unread: number;
}

export async function getNotifications(params?: {
  skip?: number;
  limit?: number;
}): Promise<NotificationListResponse> {
  const sp = new URLSearchParams();
  if (params?.skip) sp.set("skip", String(params.skip));
  if (params?.limit) sp.set("limit", String(params.limit));
  return api.get<NotificationListResponse>(`/notifications?${sp.toString()}`);
}

export async function markNotificationRead(id: string): Promise<NotificationData> {
  return api.post<NotificationData>(`/notifications/${id}/read`, {});
}

export async function markAllNotificationsRead(): Promise<void> {
  return api.post("/notifications/read-all", {});
}
