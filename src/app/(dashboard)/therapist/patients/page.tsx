"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { useLang } from "@/context/i18n";
import { usePagination } from "@/hooks/usePagination";
import { useTherapistPatients } from "@/hooks/useTherapistPatients";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Search,
  X,
  Calendar,
  ChevronDown,
  Phone,
  Activity,
  Clock,
  FileText,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  phone: string;
  condition: string;
  sessions: number;
  last: string;
  notes: string;
}

const CONDITION_OPTIONS = [
  "Post-surgery",
  "Back Pain",
  "Sports Injury",
  "Post-stroke rehab",
  "Frozen shoulder",
];

const LAST_VISIT_OPTIONS = [
  { label: "All Time", value: "all" },
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 3 months", value: "90" },
] as const;

function formatLastVisit(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export default function Patients() {
  const { t } = useLang();
  const [selected, setSelected] = useState<Patient | null>(null);

  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [lastVisitFilter, setLastVisitFilter] = useState("all");

  const pagination = usePagination({ pageSize: 10 });

  const { patients, total, isLoading, refetch, isRefetching } = useTherapistPatients({
    pagination,
    search,
    condition: conditionFilter,
    lastVisit: lastVisitFilter,
  });

  const totalPages = pagination.totalPages(total);

  const hasFilters =
    search.trim() !== "" ||
    conditionFilter !== "" ||
    lastVisitFilter !== "all";

  function handleSearchChange(value: string) {
    setSearch(value);
    pagination.reset();
  }

  function handleConditionChange(value: string) {
    setConditionFilter(value);
    pagination.reset();
  }

  function handleLastVisitChange(value: string) {
    setLastVisitFilter(value);
    pagination.reset();
  }

  function clearFilters() {
    setSearch("");
    setConditionFilter("");
    setLastVisitFilter("all");
    pagination.reset();
  }

  return (
    <>
      {/* ─── Search & Filters ─── */}
      <div className="card-soft p-4 mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
            <input
              type="text"
              placeholder="Search by name, phone, or ID…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={conditionFilter}
              onChange={(e) => handleConditionChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">All Conditions</option>
              {CONDITION_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={lastVisitFilter}
              onChange={(e) => handleLastVisitChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {LAST_VISIT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
          </div>
          <div className="relative py-0.5">
            <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
            <span className="text-[11px] text-text-light">
              {total} patient{total !== 1 ? "s" : ""} found
            </span>
          </div>
        )}
      </div>

      {/* ─── Patient Table ─── */}
      <div className="card-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left bg-surface/60 text-xs uppercase tracking-wider font-mono text-text-light">
            <tr>
              <th className="p-3">{t("therapist_dashboard.patientLabel")}</th>
              <th className="p-3">Phone</th>
              <th className="p-3">{t("therapist_dashboard.condition")}</th>
              <th className="p-3">{t("therapist_dashboard.sessions")}</th>
              <th className="p-3">{t("therapist_dashboard.lastVisit")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />
                      <div className="h-4 w-28 bg-surface rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="h-4 w-24 bg-surface rounded animate-pulse" />
                  </td>
                  <td className="p-3">
                    <div className="h-4 w-20 bg-surface rounded animate-pulse" />
                  </td>
                  <td className="p-3">
                    <div className="h-4 w-8 bg-surface rounded animate-pulse" />
                  </td>
                  <td className="p-3">
                    <div className="h-4 w-32 bg-surface rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : (
              patients.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-surface/40 cursor-pointer"
                  onClick={() => setSelected(p)}
                >
                  <td className="p-3 flex items-center gap-2">
                    <Avatar name={p.name} size={32} />
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="p-3 text-text-light">{p.phone || "—"}</td>
                  <td className="p-3 text-text-light">{p.condition || "—"}</td>
                  <td className="p-3">{p.sessions}</td>
                  <td className="p-3 text-text-light">{formatLastVisit(p.last)}</td>
                </tr>
              ))
            )}
            {!isLoading && patients.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-text-light text-sm"
                >
                  No patients match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ─── Pagination ─── */}
        {total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="text-xs text-text-light whitespace-nowrap">
              Showing {pagination.skip + 1}–{Math.min(pagination.skip + pagination.pageSize, total)} of {total}
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
                      pagination.nextPage(total);
                    }}
                    aria-disabled={!pagination.canNext(total)}
                    className={
                      !pagination.canNext(total)
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* ─── Patient Detail Sheet ─── */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
          <SheetHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar name={selected?.name ?? ""} size={56} />
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-lg">{selected?.name}</SheetTitle>
                <SheetDescription className="text-xs">
                  {selected?.condition || "No condition recorded"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {selected && (
            <div className="mt-5 space-y-5">
              <Section title="Contact">
                <InfoRow icon={<Phone size={14} />} label="Phone" value={selected.phone || "—"} />
              </Section>
              <Section title={t("therapist_dashboard.sessions")}>
                <InfoRow icon={<Activity size={14} />} label={t("therapist_dashboard.totalSessions")} value={String(selected.sessions)} />
              </Section>
              <Section title="Activity">
                <InfoRow icon={<Clock size={14} />} label={t("therapist_dashboard.lastVisit")} value={formatLastVisit(selected.last)} />
              </Section>
              <Section title="Notes">
                <InfoRow icon={<FileText size={14} />} label="Notes" value={selected.notes || "—"} />
              </Section>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-mono uppercase tracking-wider text-text-light mb-3">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-text-light shrink-0">{icon}</span>
      <span className="text-text-light min-w-[80px]">{label}</span>
      <span className="font-medium ml-auto">{value}</span>
    </div>
  );
}
