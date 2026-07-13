"use client";

import { useState, useMemo, useCallback } from "react";
import { Phone, ArrowUpRight, Eye, AlertTriangle } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminIncidents } from "@/hooks/useAdminIncidents";
import { DashboardStat } from "@/components/dashboard/DashboardStat";
import {
  DataTable,
  FilterBar,
  StatusChip,
  type Column,
  type FilterConfig,
} from "@/components/tables";
import type { AdminIncidentData } from "@/services/api/admin";
import { toast } from "sonner";

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function SafetyIncidentsPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "reportedAt" });
  const pageSize = 10;

  const { items, total, isLoading, escalate } = useAdminIncidents({
    search: debouncedSearch,
    severity,
    status,
    reportedBy,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const activeIncidents = items.filter((i) => i.status === "Active");

  const resetFilters = useCallback(() => {
    setSearch("");
    setSeverity("");
    setStatus("");
    setReportedBy("");
    setPage(1);
  }, []);

  const filterValues = useMemo(
    () => ({ search, severity, status, reportedBy }),
    [search, severity, status, reportedBy],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setSearch(value);
      else if (key === "severity") setSeverity(value);
      else if (key === "status") setStatus(value);
      else if (key === "reportedBy") setReportedBy(value);
      setPage(1);
    },
    [],
  );

  const columns: Column<AdminIncidentData>[] = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        render: (row) => <span className="font-mono text-xs">{row.id}</span>,
      },
      {
        key: "reportedBy",
        label: "Reported by",
        render: (row) => <span className="text-text-light">{row.reportedBy}</span>,
      },
      {
        key: "therapist",
        label: "Involving",
        render: (row) => (
          <span className="text-text-light text-xs">
            {row.therapist} ↔ {row.patient}
          </span>
        ),
      },
      {
        key: "severity",
        label: "Severity",
        render: (row) => <StatusChip status={row.severity} />,
      },
      {
        key: "summary",
        label: "Summary",
        render: (row) => (
          <span className="text-xs text-text-light line-clamp-2 max-w-[250px]">{row.summary}</span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusChip status={row.status} />,
      },
      {
        key: "reportedAt",
        label: "Reported",
        sortable: true,
        render: (row) => (
          <span className="font-mono text-xs text-text-light">{formatRelativeTime(row.reportedAt)}</span>
        ),
      },
    ],
    [],
  );

  const renderActions = useCallback(
    (row: AdminIncidentData) => (
      <div className="flex items-center justify-end gap-1">
        {row.status === "Active" ? (
          <>
            <button
              className="chip !bg-secondary !text-white cursor-pointer !text-[0.6rem]"
              title="Call now"
            >
              <Phone size={11} className="inline mr-1" /> Call
            </button>
            <button
              onClick={() => { escalate(row.id); toast.success("Incident escalated to Super Admin"); }}
              className="chip !bg-destructive/10 !text-destructive cursor-pointer !text-[0.6rem]"
              title="Escalate"
            >
              <ArrowUpRight size={11} className="inline mr-1" /> Escalate
            </button>
          </>
        ) : (
          <button
            className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition cursor-pointer"
            title="View"
          >
            <Eye size={15} />
          </button>
        )}
      </div>
    ),
    [escalate],
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      { key: "search", type: "search", label: "Search", placeholder: "Search by name or ID…" },
      {
        key: "severity",
        type: "select",
        label: "Severity",
        placeholder: "All severities",
        options: [
          { value: "Critical", label: "Critical" },
          { value: "High", label: "High" },
          { value: "Medium", label: "Medium" },
        ],
      },
      {
        key: "status",
        type: "select",
        label: "Status",
        placeholder: "All statuses",
        options: [
          { value: "Active", label: "Active" },
          { value: "Investigating", label: "Investigating" },
          { value: "Resolved", label: "Resolved" },
        ],
      },
      {
        key: "reportedBy",
        type: "select",
        label: "Reported by",
        placeholder: "All",
        options: [
          { value: "Patient", label: "Patient" },
          { value: "Therapist", label: "Therapist" },
        ],
      },
    ],
    [],
  );

  return (
    <div>
      {activeIncidents.length > 0 && (
        <div className="bg-destructive text-white rounded-xl p-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} />
            <span className="font-medium">
              {activeIncidents.length} active incident{activeIncidents.length > 1 ? "s" : ""} needs immediate attention
              {" — reported "}
              {formatRelativeTime(activeIncidents[0].reportedAt)}
            </span>
          </div>
          <button className="bg-white text-destructive font-bold px-4 py-2 rounded-full text-xs cursor-pointer hover:bg-white/90 transition">
            Respond now
          </button>
        </div>
      )}

      <div className="mb-5">
        <h2 className="font-display text-xl">Safety Incidents</h2>
        <p className="text-sm text-text-light mt-1">
          Anything reported during a home visit that isn&apos;t a routine complaint — these get an immediate response, not a queue.
        </p>
      </div>

      <div className="stats-grid">
        <DashboardStat label="Active incidents" value={String(activeIncidents.length)} sub="Critical severity" variant={activeIncidents.length > 0 ? "amber" : "default"} />
        <DashboardStat label="Avg response time" value="4 min" sub="Within SLA (10 min)" />
        <DashboardStat label="Resolved this month" value="3" sub="All within SLA" />
        <DashboardStat label="Repeat locations" value="0" sub="No pattern detected" />
      </div>

      <div className="card-soft p-5">
        <FilterBar
          filters={filterConfig}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={resetFilters}
        />
        <DataTable
          columns={columns}
          data={items}
          total={total}
          isLoading={isLoading}
          sortColumn={sort.column}
          sortOrder={sort.direction}
          onSortToggle={(col) => { toggleSort(col); setPage(1); }}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          renderActions={renderActions}
          rowClassName={(row) =>
            row.status === "Active" ? "bg-destructive/5" : undefined
          }
          emptyMessage="No incidents found"
        />
      </div>
    </div>
  );
}
