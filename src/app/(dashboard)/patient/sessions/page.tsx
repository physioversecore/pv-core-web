"use client";

import { useState, useMemo, Suspense } from "react";
import { Search, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { TherapistCard } from "@/components/TherapistCard";
import { BookingModal } from "@/components/BookingModal";
import { SessionDrawer } from "@/components/modals/SessionDrawer";
import { CancelConfirmModal } from "@/components/modals/CancelConfirmModal";
import { RescheduleModal } from "@/components/modals/RescheduleModal";
import { RateCard } from "../components/RateCard";
import { ViewToggle, type ViewMode } from "@/components/sessions/ViewToggle";
import { SessionRow } from "@/components/sessions/SessionRow";
import { SessionCard } from "@/components/sessions/SessionCard";
import { SessionTable } from "@/components/sessions/SessionTable";
import { SessionSkeleton } from "@/components/sessions/SessionSkeleton";
import { useSessions, useSessionDetail } from "@/hooks/useSessions";
import { useTherapistsToRate } from "@/hooks/useTherapistsToRate";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { useLang } from "@/context/i18n";
import { getTherapists } from "@/services/api/therapists";
import { mapSessionStatus } from "@/lib/format";
import type { Therapist } from "@/types";
import type { SessionData } from "@/services/api/sessions";
import { X } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const TABS = ["sessionsUpcoming", "sessionsPast", "sessionsCancelled"] as const;
const PAGE_SIZE = 15;

function SessionsContent() {
  const { t } = useLang();
  const [tab, setTab] = useState<(typeof TABS)[number]>("sessionsUpcoming");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState("General");
  const [bookTherapist, setBookTherapist] = useState<Therapist | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<SessionData | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<SessionData | null>(null);
  const [rateTarget, setRateTarget] = useState<SessionData | null>(null);

  const { sessions, isLoading, isRefetching, refetch, cancelSession, isCancelling, rescheduleSession, isRescheduling } = useSessions();
  const { therapistsToRate } = useTherapistsToRate();
  const { data: therapistsData } = useQuery({
    queryKey: ["therapists"],
    queryFn: () => getTherapists(),
  });
  const { data: detailSession } = useSessionDetail(selectedId);

  const therapists = useMemo(
    () => (therapistsData?.therapists ?? []).map((t) => ({ ...t, gender: t.gender as "Male" | "Female" })),
    [therapistsData],
  );

  const specialties = useMemo(
    () => Array.from(new Set(therapists.map((t) => t.specialty).filter(Boolean))),
    [therapists],
  );

  const filteredTherapists = useMemo(
    () => (specialtyFilter === "all" ? therapists : therapists.filter((t) => t.specialty === specialtyFilter)),
    [therapists, specialtyFilter],
  );

  const filtered = useMemo(() => {
    let list = [...sessions];

    // Filter by tab
    if (tab === "sessionsUpcoming") {
      list = list.filter((s) => mapSessionStatus(s.status) === "Confirmed");
    } else if (tab === "sessionsPast") {
      list = list.filter((s) => mapSessionStatus(s.status) === "Completed");
    } else {
      list = list.filter((s) => mapSessionStatus(s.status) === "Cancelled");
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.therapistName?.toLowerCase().includes(q));
    }

    return list;
  }, [sessions, tab, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const rateableIds = useMemo(
    () => new Set(therapistsToRate.map((r) => r.sessionId)),
    [therapistsToRate],
  );

  const handleCancel = (id: string) => {
    const s = sessions.find((s) => s.id === id);
    if (s) setCancelTarget(s);
  };

  const handleReschedule = (id: string) => {
    const s = sessions.find((s) => s.id === id);
    if (s) setRescheduleTarget(s);
  };

  const handleRate = (id: string) => {
    const s = sessions.find((s) => s.id === id);
    if (s) setRateTarget(s);
  };

  const handleCancelConfirm = (reason?: string) => {
    if (!cancelTarget) return;
    cancelSession({ id: cancelTarget.id, reason });
    setCancelTarget(null);
  };

  const handleRescheduleConfirm = (newDate: string, newTime: string) => {
    if (!rescheduleTarget) return;
    rescheduleSession(
      { id: rescheduleTarget.id, newDate, newTime },
      {
        onSuccess: () => setRescheduleTarget(null),
      },
    );
  };

  const handleTabChange = (newTab: typeof TABS[number]) => {
    setTab(newTab);
    setPage(1);
  };

  const rowProps = {
    onCancel: handleCancel,
    onReschedule: handleReschedule,
    onRate: handleRate,
    onClick: setSelectedId,
    rateableIds,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-1 p-1 bg-surface rounded-full">
          {TABS.map((_t) => (
            <button
              key={_t}
              onClick={() => handleTabChange(_t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                tab === _t ? "bg-white text-secondary shadow-sm" : "text-text-light hover:text-text"
              }`}
            >
              {t(`patient_dashboard.${_t}`)}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setPickerOpen(true); setSpecialtyFilter("General"); }}
          className="btn-primary !py-2 !px-4 text-sm hidden md:inline-flex"
        >
          {t("patient_dashboard.bookNewSession")}
        </button>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => { setPickerOpen(true); setSpecialtyFilter("General"); }}
        className="fixed bottom-6 right-6 z-50 md:hidden w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary-hover active:scale-95 fab-float"
      >
        <Plus size={24} />
      </button>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by therapist..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-white text-sm"
          />
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {/* Session list */}
      {isLoading ? (
        <SessionSkeleton view={view} />
      ) : paged.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3 opacity-30">
            {tab === "sessionsUpcoming" ? "📅" : tab === "sessionsPast" ? "✅" : "🗑️"}
          </div>
          <p className="text-text-light text-sm mb-4">
            {search
              ? "No sessions match your search."
              : tab === "sessionsUpcoming"
              ? "No upcoming sessions."
              : tab === "sessionsPast"
              ? "No past sessions."
              : "No cancelled sessions."}
          </p>
          {!search && tab === "sessionsUpcoming" && (
            <button onClick={() => { setPickerOpen(true); setSpecialtyFilter("General"); }} className="btn-primary !py-2 !px-4 text-sm">
              {t("patient_dashboard.bookNewSession")}
            </button>
          )}
        </div>
      ) : (
        <>
          {view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paged.map((s) => (
                <SessionCard key={s.id} session={s} {...rowProps} />
              ))}
            </div>
          ) : (
            <div className="card-soft overflow-hidden">
              <SessionTable sessions={paged} {...rowProps} />
            </div>
          ) 
          // : (
          //   <div className="space-y-3">
          //     {paged.map((s) => (
          //       <SessionRow key={s.id} session={s} {...rowProps} />
          //     ))}
          //   </div>
          // )
          }

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline !py-1.5 !px-3 text-xs disabled:opacity-30"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    p === page
                      ? "bg-secondary text-white"
                      : "text-text-light hover:bg-surface"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-outline !py-1.5 !px-3 text-xs disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Session detail drawer */}
      {detailSession && selectedId && (
        <SessionDrawer
          session={detailSession}
          onClose={() => setSelectedId(null)}
          onCancel={(id) => {
            setSelectedId(null);
            setTimeout(() => handleCancel(id), 200);
          }}
          onReschedule={(id) => {
            setSelectedId(null);
            setTimeout(() => handleReschedule(id), 200);
          }}
        />
      )}

      {/* Cancel confirmation */}
      {cancelTarget && (
        <CancelConfirmModal
          therapistName={cancelTarget.therapistName || "Therapist"}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
          isPending={isCancelling}
        />
      )}

      {/* Reschedule modal */}
      {rescheduleTarget && (
        <RescheduleModal
          therapistId={rescheduleTarget.therapistId}
          therapistName={rescheduleTarget.therapistName || "Therapist"}
          sessionId={rescheduleTarget.id}
          currentDate={rescheduleTarget.date}
          currentTime={rescheduleTarget.time}
          onConfirm={handleRescheduleConfirm}
          onClose={() => setRescheduleTarget(null)}
          isPending={isRescheduling}
        />
      )}

      {/* Rate therapist modal (reuses RateCard from the RateTherapist section) */}
      {rateTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-text/60 backdrop-blur-sm" onClick={() => setRateTarget(null)} />
          <div className="relative w-full max-w-md bg-background rounded-3xl border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-xl">{t("patient_dashboard.rateYourTherapist")}</h3>
                <p className="text-sm text-text-light">{t("patient_dashboard.rateDesc")}</p>
              </div>
              <button
                onClick={() => setRateTarget(null)}
                className="p-2 rounded-full hover:bg-surface text-text-light shrink-0"
              >
                <X size={18} />
              </button>
            </div>
            <RateCard
              sessionId={rateTarget.id}
              therapistName={rateTarget.therapistName || "Therapist"}
              sessionDate={rateTarget.date}
              sessionType={rateTarget.type || ""}
            />
          </div>
        </div>
      )}

      {/* Therapist picker */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-text/60 backdrop-blur-sm" onClick={() => setPickerOpen(false)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background rounded-3xl border border-border shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl">{t("patient_dashboard.pickTherapist")}</h3>
              <button onClick={() => setPickerOpen(false)} className="p-2 rounded-full hover:bg-surface">✕</button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-light mb-1">Specialty</label>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl border border-border bg-white text-sm"
              >
                <option value="all">All</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTherapists.map((th) => (
                <TherapistCard
                  key={th.id}
                  t={th}
                  onBook={(thr) => {
                    setPickerOpen(false);
                    setBookTherapist(thr);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking modal */}
      {bookTherapist && (
        <BookingModal therapist={bookTherapist} onClose={() => setBookTherapist(null)} />
      )}
    </div>
  );
}

export default function SessionsPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<SessionSkeleton view="grid" />}>
        <SessionsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
