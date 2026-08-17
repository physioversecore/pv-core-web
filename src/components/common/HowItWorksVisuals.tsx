"use client";

import { Activity, Calendar, FileText, Search, Star, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "./Avatar";

export const VISUAL_CARD =
  "flex w-full max-w-sm h-[300px] sm:h-[360px] flex-col justify-center rounded-2xl bg-white p-3.5 shadow-2xl ring-1 ring-black/5 sm:p-4";

export function VisualFrame({ tone, children }: { tone: "a" | "b" | "c"; children: ReactNode }) {
  return (
    <div className={`feature-visual feature-visual-${tone}`}>
      <div className="feature-visual-grid" aria-hidden />
      <div className="relative z-10 flex h-full w-full items-center justify-center p-4 sm:p-8">{children}</div>
    </div>
  );
}

function TherapistRow({ name, spec, rating, price }: { name: string; spec: string; rating: string; price: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border p-2.5">
      <Avatar name={name} size={32} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-semibold text-text">{name}</div>
        <div className="truncate text-[10.5px] text-text-light">{spec}</div>
      </div>
      <div className="flex items-center gap-1 text-[12px] font-semibold text-text">
        <Star size={11} className="fill-secondary text-secondary" />
        {rating}
      </div>
      <div className="text-[10.5px] font-medium text-secondary">{price}</div>
    </div>
  );
}

export function SearchVisual() {
  return (
    <VisualFrame tone="a">
      <div className={VISUAL_CARD}>
        <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5">
          <Search size={15} className="shrink-0 text-text-light" />
          <span className="text-[13px] text-text-light">Sports injury · Kathmandu</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-secondary">Physiotherapy</span>
          <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-secondary">Female</span>
          <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-secondary">4.8+</span>
        </div>
        <div className="mt-4 space-y-2.5">
          <TherapistRow name="Anisha Shrestha" spec="Sports rehab" rating="4.9" price="Rs 1,200" />
          <TherapistRow name="Prakash Gurung" spec="Ortho rehab" rating="4.8" price="Rs 1,000" />
        </div>
      </div>
    </VisualFrame>
  );
}

export function BookingVisual() {
  return (
    <VisualFrame tone="b">
      <div className={VISUAL_CARD}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-semibold text-text">Home visit · 45 min</div>
            <div className="text-[11px] text-text-light">Dr. Anisha Shrestha</div>
          </div>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10.5px] font-semibold text-white">4.9 ★</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["Mon 12", "Tue 13", "Wed 14"].map((d, i) => (
            <div
              key={d}
              className={`rounded-lg border py-2 text-center text-[11px] font-medium ${i === 1 ? "border-secondary bg-secondary text-white" : "border-border text-text-light"}`}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {["9:00", "10:00", "11:00"].map((tm, i) => (
            <div
              key={tm}
              className={`rounded-lg border py-1.5 text-center text-[11px] font-medium ${i === 2 ? "border-secondary text-secondary" : "border-border text-text-light"}`}
            >
              {tm}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="chip !bg-surface !text-text">eSewa</span>
          <span className="chip !bg-surface !text-text">Khalti</span>
          <span className="chip !bg-surface !text-text">Cash</span>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-voltage-lime px-3.5 py-2.5">
          <span className="text-[13px] font-semibold text-carbon-ink">Confirm booking</span>
          <span className="text-[12px] font-semibold text-carbon-ink">Rs 1,200</span>
        </div>
      </div>
    </VisualFrame>
  );
}

export function RecoveryVisual() {
  return (
    <VisualFrame tone="c">
      <div className={VISUAL_CARD}>
        <div className="flex items-center gap-3.5">
          <div
            className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full"
            style={{ background: "conic-gradient(var(--color-secondary) 75%, var(--color-surface) 0)" }}
          >
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-[12px] font-bold text-secondary">75%</div>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-text">Recovery progress</div>
            <div className="mt-0.5 text-[11px] text-text-light">12 of 16 sessions · knee rehab</div>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-surface p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-secondary">
            <FileText size={12} />
            Session report · Visit 12
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/70" />
          <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-white/70" />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-border px-3 py-2">
          <span className="text-[11px] text-text-light">Next visit</span>
          <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-text">
            <Calendar size={12} className="text-secondary" />
            Fri 14 · 2:00 PM
          </span>
        </div>
      </div>
    </VisualFrame>
  );
}

export function ServiceStackVisual({
  items,
  iconMap,
  accent = "a",
}: {
  items: Array<{ id: string; name: string; description: string; iconName: string }>;
  iconMap: Record<string, LucideIcon>;
  accent?: "a" | "b";
}) {
  return (
    <div className={`w-full feature-visual feature-visual-${accent}`}>
      <div className="feature-visual-grid" aria-hidden />
      <div className="relative z-10 flex h-full w-full items-center justify-center p-4 sm:p-8">
        <div className={VISUAL_CARD}>
          <div className="space-y-2.5">
            {items.slice(0, 3).map((s, i) => {
              const Icon = iconMap[s.iconName] || Activity;
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-white p-2.5"
                  style={{ transform: `translateX(${i * 6}px)` }}
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-secondary" style={{ background: "var(--color-surface)" }}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-text">{s.name}</div>
                    <div className="truncate text-[11px] text-text-light">{s.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
