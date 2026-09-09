"use client";

import { Bell, Gift, CalendarClock, CheckCheck } from "lucide-react";
import { useLang } from "@/context/i18n";
import { useNotifications } from "@/hooks/useNotifications";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import type { NotificationData } from "@/services/api/notifications";

/**
 * The signed-in user's own feed. Shared by the patient and therapist
 * dashboards — the rows are identical, only the route differs.
 */
export function NotificationFeed() {
  const { t } = useLang();
  const {
    notifications,
    unread,
    isLoading,
    refetch,
    markRead,
    markAllRead,
    isMarkingAll,
  } = useNotifications();

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="font-display text-lg">{t("notifications.title")}</h2>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={() => markAllRead()}
              disabled={isMarkingAll}
              className="btn-outline !py-1.5 !px-3 text-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCheck size={14} />
              {t("notifications.markAllRead")}
            </button>
          )}
          <RefreshButton onRefresh={() => refetch()} isRefreshing={false} />
        </div>
      </div>

      {unread > 0 && (
        <p className="eyebrow mb-2">
          {t("notifications.unreadCount").replace("{n}", String(unread))}
        </p>
      )}

      {isLoading ? (
        <div className="card-soft divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-surface rounded animate-pulse" />
                <div className="h-3 w-56 bg-surface rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card-soft p-8 text-center">
          <Bell size={32} className="mx-auto text-text-light mb-3 opacity-40" />
          <p className="text-sm text-text-light">{t("notifications.empty")}</p>
        </div>
      ) : (
        <ul className="card-soft divide-y divide-border">
          {notifications.map((n) => (
            <NotificationRow key={n.id} notification={n} onRead={markRead} />
          ))}
        </ul>
      )}
    </div>
  );
}

function iconFor(type: string) {
  if (type.includes("REFERRAL") || type.includes("POINT")) return <Gift size={16} />;
  if (type.includes("SESSION") || type.includes("BOOKING")) return <CalendarClock size={16} />;
  return <Bell size={16} />;
}

function NotificationRow({
  notification: n,
  onRead,
}: {
  notification: NotificationData;
  onRead: (id: string) => Promise<unknown>;
}) {
  const isUnread = !n.readAt;

  return (
    <li className="p-4 flex items-start gap-3">
      <span className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-text-light shrink-0">
        {iconFor(n.type)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text">{n.title}</p>
        <p className="text-sm text-text-light mt-0.5">{n.body}</p>
        <p className="text-xs text-text-light mt-1">
          {new Date(n.createdAt).toLocaleString()}
        </p>
      </div>
      {isUnread && (
        // Clicking the dot is the only way to mark one read; the row itself
        // may later become a link to whatever the notification refers to.
        <button
          onClick={() => onRead(n.id)}
          aria-label="Mark read"
          className="mt-1 w-2.5 h-2.5 rounded-full bg-secondary shrink-0 cursor-pointer"
        />
      )}
    </li>
  );
}
