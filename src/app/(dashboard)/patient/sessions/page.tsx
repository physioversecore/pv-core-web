"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
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
import { usePagination } from "@/hooks/usePagination";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useTherapistsToRate } from "@/hooks/useTherapistsToRate";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { useLang } from "@/context/i18n";
import { getTherapists, getTherapist } from "@/services/api/therapists";
import { isPast } from "@/lib/format";
import { useDebounce } from "@/hooks/useDebounce";
import { CITIES, SPECIALTIES } from "@/constants";
import type { Therapist } from "@/types";
import type { SessionData } from "@/services/api/sessions";
import { X } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const TABS = ["sessionsUpcoming", "tabCompleted", "sessionsCancelledPast"] as const;

const isScheduled = (s: SessionData) =>
  s.status === "SCHEDULED" || s.status === "IN_PROGRESS";

function SessionsContent() {
  const { t } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<(typeof TABS)[number]>("sessionsUpcoming");
  const [view, setView] = useState<ViewMode>("compact");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: 10 });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [bookTherapist, setBookTherapist] = useState<Therapist | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<SessionData | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<SessionData | null>(null);
  const [rateTarget, setRateTarget] = useState<SessionData | null>(null);

  // Deep-link booking: /patient/sessions?book={therapistId} opens that therapist's booking modal.
  // Clear the book param from the URL once opened so closing the modal isn't re-triggered.
  const bookParam = searchParams.get("book");
  const { data: bookParamTherapist } = useQuery({
    queryKey: ["therapist", bookParam],
    queryFn: () => getTherapist(bookParam!),
    enabled: !!bookParam,
  });
  useEffect(() => {
    if (bookParam && bookParamTherapist) {
      setBookTherapist({
        ...bookParamTherapist,
        gender: bookParamTherapist.gender as Therapist["gender"],
      });
      router.replace("/patient/sessions", { scroll: false });
    }
  }, [bookParam, bookParamTherapist, router]);

  // Therapist picker state (server-side filters + pagination)
  const [pickerQ, setPickerQ] = useState("");
  const [pickerCity, setPickerCity] = useState("");
  const [pickerSpec, setPickerSpec] = useState("");
  const [pickerGender, setPickerGender] = useState("");
  const debouncedPickerQ = useDebounce(pickerQ, 300);
  const pickerPagination = usePagination({ pageSize: 9 });

  const { sessions, isLoading, isRefetching, refetch, cancelSession, isCancelling, rescheduleSession, isRescheduling } = useSessions();
  const { therapistsToRate } = useTherapistsToRate();

  const { data: pickerData, isLoading: pickerLoading } = useQuery({
    queryKey: ["therapists", "picker", pickerPagination.page, debouncedPickerQ, pickerCity, pickerSpec, pickerGender],
    queryFn: () =>
      getTherapists({
        skip: pickerPagination.skip,
        limit: pickerPagination.pageSize,
        search: debouncedPickerQ || undefined,
        city: pickerCity || undefined,
        specialty: pickerSpec || undefined,
        gender: pickerGender || undefined,
      }),
    enabled: pickerOpen,
    placeholderData: (prev) => prev,
  });

  const pickerTherapists: Therapist[] = (pickerData?.therapists ?? []).map((t) => ({
    ...t,
    gender: t.gender as "Male" | "Female",
  }));
  const pickerTotal = pickerData?.total ?? 0;
  const pickerTotalPages = pickerPagination.totalPages(pickerTotal);

  const { data: detailSession } = useSessionDetail(selectedId);

  const filtered = useMemo(() => {
    let list = [...sessions];

    // Filter by tab
    if (tab === "sessionsUpcoming") {
      list = list.filter((s) => isScheduled(s) && !isPast(s.date, s.time));
    } else if (tab === "tabCompleted") {
      list = list.filter((s) => s.status === "COMPLETED");
    } else {
      list = list.filter(
        (s) => s.status === "CANCELLED" || (isScheduled(s) && isPast(s.date, s.time)),
      );
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.therapistName?.toLowerCase().includes(q));
    }

    return list;
  }, [sessions, tab, search]);

  const paged = useMemo(() => {
    const start = pagination.skip;
    return filtered.slice(start, start + pagination.pageSize);
  }, [filtered, pagination.skip, pagination.pageSize]);

  const totalPages = pagination.totalPages(filtered.length);

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
    pagination.reset();
  };

  const hasPickerFilters = !!(pickerQ || pickerCity || pickerSpec || pickerGender);

  const clearPickerFilters = () => {
    setPickerQ("");
    setPickerCity("");
    setPickerSpec("");
    setPickerGender("");
    pickerPagination.reset();
  };

  const closePicker = () => {
    setPickerOpen(false);
    clearPickerFilters();
  };

  const openPicker = () => {
    clearPickerFilters();
    setPickerOpen(true);
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
              className={`px-4 py-1.5 rounded-full text-xs md:text-[20px] font-medium transition ${
                tab === _t ? "bg-white text-secondary shadow-sm" : "text-text-light hover:text-text"
              }`}
            >
              {t(`patient_dashboard.${_t}`)}
            </button>
          ))}
        </div>
        <button
          onClick={openPicker}
          className="btn-primary !py-2 !px-4 text-sm hidden md:inline-flex"
        >
          {t("patient_dashboard.bookNewSession")}
        </button>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={openPicker}
        className="fixed bottom-6 right-6 z-50 md:hidden w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary-hover active:scale-95 fab-float"
      >
        <Plus size={24} />
      </button>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); pagination.reset(); }}
            placeholder="Search by therapist..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-white text-sm"
          />
        </div>
        <ViewToggle view={view} onChange={setView} />
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
      </div>

      {/* Session list */}
      {isLoading ? (
        <SessionSkeleton view={view} />
      ) : paged.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3 opacity-30">
            {tab === "sessionsUpcoming" ? "📅" : tab === "tabCompleted" ? "✅" : "🗑️"}
          </div>
          <p className="text-text-light text-sm mb-4">
            {search
              ? "No sessions match your search."
              : tab === "sessionsUpcoming"
              ? "No upcoming sessions."
              : tab === "tabCompleted"
              ? "No completed sessions."
              : "No cancelled or past sessions."}
          </p>
          {!search && tab === "sessionsUpcoming" && (
            <button onClick={openPicker} className="btn-primary !py-2 !px-4 text-sm">
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
          {filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
              <div className="text-xs text-text-light whitespace-nowrap">
                Showing {pagination.skip + 1}–
                {Math.min(pagination.skip + pagination.pageSize, filtered.length)} of {filtered.length}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={(e) => {
                        e.preventDefault();
                        pagination.prevPage();
                      }}
                      aria-disabled={!pagination.canPrev}
                      className={
                        !pagination.canPrev
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (totalPages <= 7) return true;
                      if (p === 1 || p === totalPages) return true;
                      if (Math.abs(p - pagination.page) <= 1) return true;
                      return false;
                    })
                    .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                        acc.push("ellipsis");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={item}>
                          <PaginationLink
                            isActive={item === pagination.page}
                            onClick={(e) => {
                              e.preventDefault();
                              pagination.goToPage(item);
                            }}
                            className="cursor-pointer"
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={(e) => {
                        e.preventDefault();
                        pagination.nextPage(filtered.length);
                      }}
                      aria-disabled={!pagination.canNext(filtered.length)}
                      className={
                        !pagination.canNext(filtered.length)
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
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
          <button className="absolute inset-0 bg-text/60 backdrop-blur-sm" onClick={closePicker} />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-3xl border border-border shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl">{t("patient_dashboard.pickTherapist")}</h3>
              <button onClick={closePicker} className="p-2 rounded-full hover:bg-surface">✕</button>
            </div>

            {/* Filters */}
            <div className="mb-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="block text-sm font-medium text-text-light">Filters</label>
                {hasPickerFilters && (
                  <button
                    onClick={clearPickerFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-light transition-colors hover:text-secondary"
                  >
                    <X size={14} />
                    {t("common.clearFilters")}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="relative lg:col-span-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
                  <input
                    value={pickerQ}
                    onChange={(e) => { setPickerQ(e.target.value); pickerPagination.reset(); }}
                    placeholder={t("find.placeholderSearch")}
                    className="w-full pl-10 pr-3 h-12 rounded-xl border border-border bg-white text-sm"
                  />
                </div>
                <select
                  value={pickerCity}
                  onChange={(e) => { setPickerCity(e.target.value); pickerPagination.reset(); }}
                  className="px-3 h-12 rounded-xl border border-border bg-white text-sm"
                >
                  <option value="">{t("find.allCities")}</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={pickerSpec}
                  onChange={(e) => { setPickerSpec(e.target.value); pickerPagination.reset(); }}
                  className="px-3 h-12 rounded-xl border border-border bg-white text-sm"
                >
                  <option value="">{t("find.allSpecialties")}</option>
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={pickerGender}
                  onChange={(e) => { setPickerGender(e.target.value); pickerPagination.reset(); }}
                  className="px-3 h-12 rounded-xl border border-border bg-white text-sm"
                >
                  <option value="">{t("find.anyGender")}</option>
                  <option value="Male">{t("find.male")}</option>
                  <option value="Female">{t("find.female")}</option>
                </select>
              </div>
            </div>

            {/* Therapist grid */}
            {pickerLoading && pickerTherapists.length === 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-2xl bg-surface animate-pulse" />
                ))}
              </div>
            ) : pickerTherapists.length === 0 ? (
              <div className="text-center py-12 text-text-light">
                <p>No therapists match your filters.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pickerTherapists.map((th) => (
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
            )}

            {/* Pagination */}
            {pickerTotal > pickerPagination.pageSize && (
              <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-border">
                <div className="text-xs text-text-light whitespace-nowrap">
                  {pickerPagination.skip + 1}–
                  {Math.min(pickerPagination.skip + pickerPagination.pageSize, pickerTotal)} of {pickerTotal}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => pickerPagination.prevPage()}
                    disabled={!pickerPagination.canPrev}
                    className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-surface transition"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: pickerTotalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => pickerPagination.goToPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                        p === pickerPagination.page
                          ? "bg-secondary text-white"
                          : "hover:bg-surface text-text-light"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => pickerPagination.nextPage(pickerTotal)}
                    disabled={!pickerPagination.canNext(pickerTotal)}
                    className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-surface transition"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
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
