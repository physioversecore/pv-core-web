"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/Avatar";
import { BookingModal } from "@/components/BookingModal";
import { TherapistCard } from "@/components/TherapistCard";
import { toast } from "sonner";
import { formatDate } from "@/utils/format";
import type { Therapist, Session } from "@/types";
import { getTherapists } from "@/services/api/therapists";
import { getSessions, updateSession } from "@/services/api/sessions";
import { useLang } from "@/context/i18n";

const TABS = ["sessionsUpcoming", "sessionsPast", "sessionsCancelled"] as const;

export default function Sessions() {
  const { t } = useLang();
  const [tab, setTab] = useState<(typeof TABS)[number]>("sessionsUpcoming");
  const [picker, setPicker] = useState(false);
  const [book, setBook] = useState<Therapist | null>(null);
  const queryClient = useQueryClient();

  const { data: sessionsData } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => getSessions(),
  });

  const { data: therapistsData } = useQuery({
    queryKey: ["therapists"],
    queryFn: () => getTherapists(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateSession(id, { status: "CANCELLED" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success(t("patient_dashboard.sessionsCancelled"));
    },
    onError: () => toast.error(t("patient_dashboard.cancel")),
  });

  const allTherapists: Therapist[] = (therapistsData?.therapists ?? []).map((_t) => ({
    ..._t,
    gender: _t.gender as "Male" | "Female",
  }));

  const sessions: Session[] = (sessionsData?.sessions ?? []).map((s) => {
    const therapist = allTherapists.find((t) => t.id === s.therapistId);
    return {
      id: s.id,
      therapist: therapist?.name ?? "—",
      therapistId: s.therapistId,
      date: s.date,
      time: s.time,
      type: s.type === "HOME_VISIT" ? "Home visit" : s.type,
      status: mapStatus(s.status),
    };
  });

  const filter = (s: Session) =>
    tab === "sessionsUpcoming" ? s.status === "Confirmed" || s.status === "Pending" : tab === "sessionsPast" ? s.status === "Completed" : s.status === "Cancelled";

  const cancel = (id: string) => cancelMutation.mutate(id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-1 p-1 bg-surface rounded-full">
          {TABS.map((_t) => (
            <button key={_t} onClick={() => setTab(_t)} className={`px-4 py-1.5 rounded-full text-sm font-medium ${tab === _t ? "bg-white text-secondary shadow-sm" : "text-text-light"}`}>
              {t(`patient_dashboard.${_t}`)}
            </button>
          ))}
        </div>
        <button onClick={() => setPicker(true)} className="btn-primary !py-2 !px-4 text-sm">{t("patient_dashboard.bookNewSession")}</button>
      </div>

      <div className="space-y-3">
        {sessions.filter(filter).map((s) => (
          <div key={s.id} className="card-soft p-4 flex items-center gap-4 flex-wrap">
            <Avatar name={s.therapist} size={44} />
            <div className="flex-1 min-w-[180px]">
              <div className="font-medium">{s.therapist}</div>
              <div className="text-xs text-text-light">{formatDate(s.date)} · {s.time} · {s.type}</div>
            </div>
            <span className={`chip ${s.status === "Confirmed" || s.status === "SCHEDULED" ? "!bg-pine !text-white" : s.status === "Completed" ? "!bg-amber !text-white" : "!bg-border !text-slate"}`}>
              {s.status === "SCHEDULED" ? t("patient_dashboard.confirmed") : s.status === "Confirmed" ? t("patient_dashboard.confirmed") : s.status === "Completed" ? t("therapist_dashboard.completed") : s.status === "Cancelled" ? t("therapist_dashboard.cancelled") : s.status}
            </span>
            <div className="flex gap-2">
              {tab === "sessionsUpcoming" && (
                <>
                  <button onClick={() => toast(t("patient_dashboard.rescheduleSent"))} className="btn-outline !py-1.5 !px-3 text-xs">{t("patient_dashboard.reschedule")}</button>
                  <button onClick={() => cancel(s.id)} className="btn-outline !py-1.5 !px-3 text-xs">{t("patient_dashboard.cancel")}</button>
                </>
              )}
              {tab === "sessionsPast" && <button onClick={() => toast.success(t("patient_dashboard.reviewSubmitted"))} className="btn-primary !py-1.5 !px-3 text-xs">{t("common.rateReview")}</button>}
            </div>
          </div>
        ))}
        {sessions.filter(filter).length === 0 && <p className="text-text-light text-sm">{t("patient_dashboard.noSessions")}</p>}
      </div>

      {picker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-text/60 backdrop-blur-sm" onClick={() => setPicker(false)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background rounded-3xl border border-border shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl">{t("patient_dashboard.pickTherapist")}</h3>
              <button onClick={() => setPicker(false)} className="p-2 rounded-full hover:bg-surface">✕</button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allTherapists.map((th) => <TherapistCard key={th.id} t={th} onBook={(thr) => { setPicker(false); setBook(thr); }} />)}
            </div>
          </div>
        </div>
      )}

      {book && <BookingModal therapist={book} onClose={() => setBook(null)} />}
    </div>
  );
}

function mapStatus(status: string): Session["status"] {
  switch (status) {
    case "SCHEDULED": return "Confirmed";
    case "COMPLETED": return "Completed";
    case "CANCELLED": return "Cancelled";
    default: return status as Session["status"];
  }
}
