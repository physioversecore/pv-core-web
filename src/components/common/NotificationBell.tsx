import { Bell, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Role } from "@/types";
import { useLang } from "@/context/i18n";
import { useNotifications } from "@/hooks/useNotifications";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import type { AdminNotificationData } from "@/services/api/admin";

export function NotificationBell({ role }: { role: Role }) {
  return role === "admin" ? <AdminNotificationBell /> : <UserNotificationBell />;
}

function UserNotificationBell() {
  const { t } = useLang();
  const { notifications, unread, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2.5 rounded-full hover:bg-surface"
        aria-label={t("notifs.title")}
      >
        <Bell size={18} />
        {unread > 0 && <Badge n={unread} />}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-border rounded-2xl shadow-xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h4 className="font-display text-base">{t("notifs.title")}</h4>
            {unread > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-xs text-secondary hover:underline"
              >
                {t("notifs.markAllRead")}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 && (
              <p className="p-6 text-center text-sm text-text-light">{t("notifs.empty")}</p>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 flex gap-2 items-start ${n.readAt ? "" : "bg-surface"}`}
              >
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.readAt ? "bg-border" : "bg-primary"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{n.title}</p>
                  {n.body && <p className="text-xs text-text-light mt-0.5">{n.body}</p>}
                  <p className="text-xs text-text-light mt-0.5 font-mono">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.readAt && (
                  <button
                    onClick={() => markRead(n.id)}
                    aria-label="Mark read"
                    className="mt-1 text-text-light hover:text-secondary"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminNotificationBell() {
  const { t } = useLang();
  const { items, unreadCount, markRead, markAllRead } = useAdminNotifications({
    category: "",
    page: 1,
    pageSize: 10,
  });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2.5 rounded-full hover:bg-surface"
        aria-label={t("notifs.title")}
      >
        <Bell size={18} />
        {unreadCount > 0 && <Badge n={unreadCount} />}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-border rounded-2xl shadow-xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h4 className="font-display text-base">{t("notifs.title")}</h4>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-xs text-secondary hover:underline"
              >
                {t("notifs.markAllRead")}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {items.length === 0 && (
              <p className="p-6 text-center text-sm text-text-light">{t("notifs.empty")}</p>
            )}
            {items.map((n) => (
              <AdminNotificationRow key={n.id} notification={n} onRead={markRead} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full grid place-items-center">
      {n}
    </span>
  );
}

function AdminNotificationRow({
  notification: n,
  onRead,
}: {
  notification: AdminNotificationData;
  onRead: (id: string) => Promise<unknown>;
}) {
  return (
    <div
      className={`p-3 flex gap-2 items-start ${n.read ? "" : "bg-surface"}`}
      onClick={() => !n.read && onRead(n.id)}
    >
      <span
        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? "bg-border" : "bg-primary"}`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">{n.message}</p>
        <p className="text-xs text-text-light mt-0.5 font-mono">
          {formatRelativeTime(n.timestamp)}
        </p>
      </div>
      {!n.read && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRead(n.id);
          }}
          aria-label="Mark read"
          className="mt-1 text-text-light hover:text-secondary"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
