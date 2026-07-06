import { Bell, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Role } from "@/lib/auth";

interface Note { id: string; title: string; time: string; unread?: boolean; }

const FEEDS: Record<Role, Note[]> = {
  patient: [
    { id: "p1", title: "Dr. Rajesh Shrestha confirmed your session today at 4:00 PM", time: "5 min ago", unread: true },
    { id: "p2", title: "New report uploaded: Range of motion improving", time: "2 hr ago", unread: true },
    { id: "p3", title: "Your medicine order #ORD-204 is out for delivery", time: "Yesterday" },
  ],
  therapist: [
    { id: "t1", title: "New booking request from Anita Sharma — Fri 27 Jun", time: "12 min ago", unread: true },
    { id: "t2", title: "Payout of Rs 12,750 approved by admin", time: "3 hr ago", unread: true },
    { id: "t3", title: "Sita Gurung rated you 5★", time: "Yesterday" },
  ],
  admin: [
    { id: "a1", title: "2 therapist applications waiting verification", time: "Just now", unread: true },
    { id: "a2", title: "Refund dispute opened on #BK-1039", time: "1 hr ago", unread: true },
    { id: "a3", title: "Weekly payout batch ready (12 therapists, Rs 78K)", time: "Yesterday" },
  ],
};

export function NotificationBell({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Note[]>(FEEDS[role] ?? []);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((i) => i.unread).length;

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative p-2.5 rounded-full hover:bg-surface" aria-label="Notifications">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full grid place-items-center">{unread}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-border rounded-2xl shadow-xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h4 className="font-display text-base">Notifications</h4>
            <button onClick={() => setItems((p) => p.map((i) => ({ ...i, unread: false })))} className="text-xs text-secondary hover:underline">Mark all read</button>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {items.length === 0 && <p className="p-6 text-center text-sm text-text-light">No notifications.</p>}
            {items.map((n) => (
              <div key={n.id} className={`p-3 flex gap-2 items-start ${n.unread ? "bg-surface" : ""}`}>
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.unread ? "bg-primary" : "bg-border"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{n.title}</p>
                  <p className="text-xs text-text-light mt-0.5 font-mono">{n.time}</p>
                </div>
                <button onClick={() => setItems((p) => p.filter((x) => x.id !== n.id))} className="text-text-light hover:text-secondary"><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
