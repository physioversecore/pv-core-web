"use client";

import { useState } from "react";
import { MOCK_SESSIONS, THERAPISTS, formatDate, type Session, type Therapist } from "@/lib/mock";
import { Avatar } from "@/components/Avatar";
import { BookingModal } from "@/components/BookingModal";
import { TherapistCard } from "@/components/TherapistCard";
import { toast } from "sonner";

const TABS = ["Upcoming", "Past", "Cancelled"] as const;

export default function Sessions() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Upcoming");
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [picker, setPicker] = useState(false);
  const [book, setBook] = useState<Therapist | null>(null);

  const filter = (s: Session) =>
    tab === "Upcoming" ? s.status === "Confirmed" : tab === "Past" ? s.status === "Completed" : s.status === "Cancelled";

  const cancel = (id: string) => {
    setSessions((p) => p.map((s) => (s.id === id ? { ...s, status: "Cancelled" } : s)));
    toast.success("Session cancelled");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-1 p-1 bg-surface rounded-full">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-sm font-medium ${tab === t ? "bg-white text-secondary shadow-sm" : "text-text-light"}`}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => setPicker(true)} className="btn-primary !py-2 !px-4 text-sm">Book a new session</button>
      </div>

      <div className="space-y-3">
        {sessions.filter(filter).map((s) => (
          <div key={s.id} className="card-soft p-4 flex items-center gap-4 flex-wrap">
            <Avatar name={s.therapist} size={44} />
            <div className="flex-1 min-w-[180px]">
              <div className="font-medium">{s.therapist}</div>
              <div className="text-xs text-text-light">{formatDate(s.date)} · {s.time} · {s.type}</div>
            </div>
            <span className={`chip ${s.status === "Confirmed" ? "!bg-secondary !text-white" : s.status === "Completed" ? "!bg-primary !text-white" : "!bg-border !text-text-light"}`}>{s.status}</span>
            <div className="flex gap-2">
              {tab === "Upcoming" && (
                <>
                  <button onClick={() => toast("Reschedule sent to therapist")} className="btn-outline !py-1.5 !px-3 text-xs">Reschedule</button>
                  <button onClick={() => cancel(s.id)} className="btn-outline !py-1.5 !px-3 text-xs">Cancel</button>
                </>
              )}
              {tab === "Past" && <button onClick={() => toast.success("Review submitted")} className="btn-primary !py-1.5 !px-3 text-xs">Rate & Review</button>}
            </div>
          </div>
        ))}
        {sessions.filter(filter).length === 0 && <p className="text-text-light text-sm">No sessions here yet.</p>}
      </div>

      {picker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-text/60 backdrop-blur-sm" onClick={() => setPicker(false)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background rounded-3xl border border-border shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl">Pick a therapist</h3>
              <button onClick={() => setPicker(false)} className="p-2 rounded-full hover:bg-surface">✕</button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {THERAPISTS.map((t) => <TherapistCard key={t.id} t={t} onBook={(th) => { setPicker(false); setBook(th); }} />)}
            </div>
          </div>
        </div>
      )}

      {book && <BookingModal therapist={book} onClose={() => setBook(null)} />}
    </div>
  );
}
