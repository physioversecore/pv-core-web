"use client";

import { useState, useMemo, useCallback } from "react";
import { Download } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAdminActivityLog } from "@/hooks/useAdminActivityLog";
import { FilterBar, type FilterConfig } from "@/components/tables";
import { toast } from "sonner";

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  const isToday = diffDay === 0;

  if (isToday) {
    return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  }
  if (diffDay === 1) {
    return `Yesterday, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivityLogPage() {
  const [search, setSearch] = useState("");
  const [adminId, setAdminId] = useState("");
  const [actionType, setActionType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);
  const pageSize = 15;

  const { items, total, isLoading } = useAdminActivityLog({
    search: debouncedSearch,
    adminId,
    actionType,
    dateFrom,
    dateTo,
    page,
    pageSize,
  });

  const resetFilters = useCallback(() => {
    setSearch("");
    setAdminId("");
    setActionType("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, []);

  const filterValues = useMemo(
    () => ({ search, adminId, actionType, dateFrom, dateTo }),
    [search, adminId, actionType, dateFrom, dateTo],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setSearch(value);
      else if (key === "adminId") setAdminId(value);
      else if (key === "actionType") setActionType(value);
      else if (key === "dateFrom") setDateFrom(value);
      else if (key === "dateTo") setDateTo(value);
      setPage(1);
    },
    [],
  );

  const exportCsv = useCallback(() => {
    const header = "Timestamp,Actor,Action,Description\n";
    const body = items
      .map((r) => `${r.timestamp},${r.actor},"${r.actionType}","${r.description.replace(/"/g, '""')}"`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activity-log.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported audit log");
  }, [items]);

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      { key: "search", type: "search", label: "Search", placeholder: "Search admin or entity…" },
      {
        key: "adminId",
        type: "select",
        label: "Admin",
        placeholder: "All admins",
        options: [
          { value: "a1", label: "Admin User" },
          { value: "a2", label: "Roshani Sharma" },
          { value: "a3", label: "Bikash Karki" },
          { value: "system", label: "System" },
        ],
      },
      {
        key: "actionType",
        type: "select",
        label: "Action type",
        placeholder: "All actions",
        options: [
          { value: "Complaint resolved", label: "Complaint resolved" },
          { value: "Therapist removed", label: "Therapist removed" },
          { value: "Role changed", label: "Role changed" },
          { value: "Performance review", label: "Performance review" },
          { value: "Payout run", label: "Payout run" },
          { value: "Refund issued", label: "Refund issued" },
        ],
      },
      { key: "dateFrom", type: "date", label: "From date" },
      { key: "dateTo", type: "date", label: "To date" },
    ],
    [],
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div>
          <h2 className="font-display text-xl">Activity Log</h2>
          <p className="text-sm text-text-light mt-1">
            A complete, admin-level audit trail — every action taken across the platform.
          </p>
        </div>
        <button onClick={exportCsv} className="btn-outline !py-2 !px-3 text-xs cursor-pointer">
          <Download size={14} className="inline mr-1" /> Export audit log
        </button>
      </div>

      <div className="card-soft p-5">
        <FilterBar
          filters={filterConfig}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={resetFilters}
        />

        {isLoading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">No log entries found</p>
        ) : (
          <div className="space-y-0 divide-y divide-border">
            {items.map((entry) => (
              <div key={entry.id} className="py-3.5 px-1">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[0.65rem] text-text-light uppercase">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                      <span className="text-xs font-medium text-text">{entry.actor}</span>
                    </div>
                    <p className="text-sm text-text leading-relaxed">
                      {highlightDescription(entry.description)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {total > pageSize && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="btn-outline !py-2 !px-4 text-xs cursor-pointer"
            >
              Load more
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-text-muted mt-4 text-center italic">
        Audit entries are immutable — they can be filtered and exported, but never edited or deleted.
      </p>
    </div>
  );
}

function highlightDescription(desc: string) {
  const parts = desc.split(/(—|CMP-\d+|BKG-\d+|Rs [\d,]+L?|[\d.]+ avg)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("CMP-") || part.startsWith("BKG-") || part.startsWith("Rs ")) {
          return <span key={i} className="font-mono text-xs bg-surface px-1.5 py-0.5 rounded">{part}</span>;
        }
        if (part === "—") {
          return <span key={i} className="text-text-muted mx-0.5">—</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
