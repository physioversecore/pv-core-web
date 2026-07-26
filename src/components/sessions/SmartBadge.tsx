"use client";

import { isToday, isTomorrow, isPast, hoursUntil } from "@/lib/format";

interface SmartBadgeProps {
  date: string;
  time: string;
  status: string;
}

export function SmartBadge({ date, time, status }: SmartBadgeProps) {
  if (status !== "SCHEDULED" && status !== "IN_PROGRESS") return null;

  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber/15 text-amber">
        <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
        In Progress
      </span>
    );
  }

  if (isToday(date)) {
    const h = hoursUntil(date, time);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${h <= 2 ? "bg-red/10 text-red" : "bg-amber/15 text-amber"}`}>
        {h <= 2 ? (
          <><span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" /> Due soon</>
        ) : (
          <>Today</>
        )}
      </span>
    );
  }

  if (isTomorrow(date)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
        Tomorrow
      </span>
    );
  }

  if (isPast(date, time)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-border text-slate">
        Overdue
      </span>
    );
  }

  return null;
}
