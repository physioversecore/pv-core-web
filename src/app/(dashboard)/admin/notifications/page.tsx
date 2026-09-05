"use client";

import { useState, useMemo, useCallback } from "react";
import { Calendar, CalendarClock, AlertTriangle, CreditCard, Settings, CheckCheck, Banknote, Clock, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import type { AdminNotificationData } from "@/services/api/admin";

type CategoryFilter = "" | "booking" | "reschedule" | "complaint" | "payment" | "system" | "refund" | "leave" | "verification" | "therapist";

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  booking: { icon: <Calendar size={16} />, color: "text-info", bg: "bg-info/10" },
  reschedule: { icon: <CalendarClock size={16} />, color: "text-primary", bg: "bg-primary/10" },
  complaint: { icon: <AlertTriangle size={16} />, color: "text-danger", bg: "bg-danger/10" },
  payment: { icon: <CreditCard size={16} />, color: "text-success", bg: "bg-success/10" },
  refund: { icon: <Banknote size={16} />, color: "text-warning", bg: "bg-warning/10" },
  leave: { icon: <Clock size={16} />, color: "text-info", bg: "bg-info/10" },
  verification: { icon: <ShieldCheck size={16} />, color: "text-success", bg: "bg-success/10" },
  therapist: { icon: <UserRound size={16} />, color: "text-primary", bg: "bg-primary/10" },
  system: { icon: <Settings size={16} />, color: "text-text-light", bg: "bg-muted" },
};

export default function AdminNotifications() {
  const { t } = useLang();
  const [category, setCategory] = useState<CategoryFilter>("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { items, total, unreadCount, isLoading, isRefetching, refetch, markRead, markAllRead } = useAdminNotifications({
    category,
    page,
    pageSize,
  });

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllRead();
      toast.success(t("notifications.allRead") ?? "All notifications marked as read");
    } catch {
      toast.error(t("common.tryAgain") ?? "Something went wrong");
    }
  }, [markAllRead, t]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      try {
        await markRead(id);
      } catch {
        // silent
      }
    },
    [markRead],
  );

  const categories = useMemo(() => [
    { key: "", label: t("admin_dashboard.filterAll") ?? "All", count: total },
    { key: "booking", label: t("admin_dashboard.filterBookings") ?? "Bookings" },
    { key: "reschedule", label: t("admin_dashboard.filterReschedules") ?? "Reschedules" },
    { key: "complaint", label: t("admin_dashboard.filterComplaints") ?? "Complaints" },
    { key: "payment", label: t("admin_dashboard.filterPayments") ?? "Payments" },
    { key: "refund", label: "Refunds" },
    { key: "leave", label: "Leaves" },
    { key: "verification", label: "Verification" },
    { key: "therapist", label: "Therapists" },
    { key: "system", label: t("admin_dashboard.filterSystem") ?? "System" },
  ], [total, t]);

  return (
    <div>
      <div className="card-soft p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h3 className="font-display text-xl">{t("notifications.title") ?? "Notifications"}</h3>
            <p className="text-sm text-text-light mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                : (t("notifications.subtitle") ?? "Every cancellation, reschedule, payment and complaint, in one feed.")
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
            <button onClick={handleMarkAllRead} className="btn-outline !py-2 !px-3 text-xs cursor-pointer">
              <CheckCheck size={14} className="inline mr-1" /> {t("admin_dashboard.markAllRead") ?? "Mark all as read"}
            </button>
          </div>
        </div>

        <div className="tabs-filter mb-5">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setCategory(cat.key as CategoryFilter); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                category === cat.key ? "tab-active" : "text-text-light hover:text-text"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-surface" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-surface rounded w-3/4" />
                  <div className="h-2 bg-surface rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-light">
            {t("notifications.empty") ?? "No notifications in this category."}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: AdminNotificationData;
  onMarkRead: (id: string) => void;
}) {
  const config = CATEGORY_CONFIG[notification.category] ?? CATEGORY_CONFIG.system;

  const handleClick = () => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
  };

  const highlightBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div
      onClick={handleClick}
      className={`flex gap-3 p-4 transition-colors cursor-pointer hover:bg-muted/30 ${
        !notification.read ? "bg-primary-light/30" : ""
      }`}
    >
      <div className={`w-8 h-8 rounded-full ${config.bg} ${config.color} flex items-center justify-center shrink-0`}>
        {config.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          {highlightBold(notification.message)}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-text-light font-mono">
            {formatRelativeTime(notification.timestamp)}
          </span>
          {notification.actionLabel && notification.actionHref && (
            <a
              href={notification.actionHref}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-secondary hover:underline font-medium"
            >
              {notification.actionLabel}
            </a>
          )}
        </div>
      </div>

      {!notification.read && (
        <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
      )}
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
