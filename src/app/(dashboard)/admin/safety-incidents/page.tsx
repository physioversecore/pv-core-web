"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  ArrowUpRight,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminIncidents } from "@/hooks/useAdminIncidents";
import type { AdminIncidentData } from "@/services/api/admin";
import { DashboardStat } from "@/components/dashboard/DashboardStat";
import {
  DataTable,
  FilterBar,
  StatusChip,
  ActionMenu,
  ConfirmDialog,
  type Column,
  type FilterConfig,
  type ActionItem,
} from "@/components/tables";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function SafetyIncidentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({
    defaultColumn: "reportedAt",
  });
  const pageSize = 10;

  const { items, total, isLoading, isRefetching, refetch, escalate, resolve } =
    useAdminIncidents({
      search: debouncedSearch,
      severity,
      status,
      reportedBy,
      sortBy,
      sortOrder,
      page,
      pageSize,
    });

  // Modal states
  const [previewIncident, setPreviewIncident] = useState<AdminIncidentData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminIncidentData | null>(null);
  const [resolveTarget, setResolveTarget] = useState<AdminIncidentData | null>(null);
  const [escalateTarget, setEscalateTarget] = useState<AdminIncidentData | null>(null);

  const activeIncidents = items.filter((i) => i.status === "Active");
  const resolvedCount = items.filter((i) => i.status === "Resolved").length;

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

  /* ------ action handlers ------ */

  const handleCall = useCallback(async (row: AdminIncidentData) => {
    if (row.phone) {
      toast.info(`Calling ${row.therapist} at ${row.phone}…`);
    } else {
      toast.info(
        `Calling ${row.reportedBy === "Patient" ? row.patient : row.therapist}… (no phone on file)`,
      );
    }
  }, []);

  const handleEscalateConfirm = useCallback(async () => {
    if (!escalateTarget) return;
    try {
      await escalate(escalateTarget.id);
      toast.success(`Incident ${escalateTarget.id} escalated to next level`);
      setEscalateTarget(null);
    } catch {
      toast.error("Failed to escalate incident.");
    }
  }, [escalateTarget, escalate]);

  const handleResolveConfirm = useCallback(async () => {
    if (!resolveTarget) return;
    try {
      await resolve(resolveTarget.id, "Resolved by admin");
      toast.success(`Incident ${resolveTarget.id} marked as resolved`);
      setResolveTarget(null);
    } catch {
      toast.error("Failed to resolve incident.");
    }
  }, [resolveTarget, resolve]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    toast.info(
      `Incident ${deleteTarget.id} can't be deleted from here — use the Complaints view for full case management.`,
    );
    setDeleteTarget(null);
  }, [deleteTarget]);

  /* ------ columns ------ */

  const columns: Column<AdminIncidentData>[] = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        render: (row) => (
          <span className="font-mono text-xs">{row.id.slice(0, 12)}…</span>
        ),
      },
      {
        key: "reportedBy",
        label: "Reported by",
        render: (row) => (
          <span className="text-text-light">{row.reportedBy}</span>
        ),
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
          <span className="text-xs text-text-light line-clamp-2 max-w-[250px]">
            {row.summary}
          </span>
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
          <span className="font-mono text-xs text-text-light">
            {formatRelativeTime(row.reportedAt)}
          </span>
        ),
      },
    ],
    [],
  );

  /* ------ renderActions ------ */

  const renderActions = useCallback(
    (row: AdminIncidentData) => {
      const isResolved = row.status === "Resolved";
      const isActive = row.status === "Active";

      const actions: ActionItem[] = [
        {
          key: "preview",
          label: "Preview",
          icon: <Eye size={14} />,
          onClick: () => setPreviewIncident(row),
        },
      ];

      if (!isResolved) {
        actions.push({
          key: "resolve",
          label: "Mark as Complete",
          icon: <CheckCircle2 size={14} />,
          onClick: () => setResolveTarget(row),
        });
      }

      actions.push({
        key: "delete",
        label: "Delete",
        icon: <Trash2 size={14} />,
        variant: "destructive",
        onClick: () => setDeleteTarget(row),
      });

      return (
        <div className="flex items-center justify-end gap-1">
          {isActive && (
            <>
              <button
                onClick={() => handleCall(row)}
                className="chip !bg-secondary !text-white cursor-pointer !text-[0.6rem]"
                title="Call now"
              >
                <Phone size={11} className="inline mr-1" /> Call
              </button>
              <button
                onClick={() => setEscalateTarget(row)}
                className="chip !bg-destructive/10 !text-destructive cursor-pointer !text-[0.6rem]"
                title="Escalate"
              >
                <ArrowUpRight size={11} className="inline mr-1" /> Escalate
              </button>
            </>
          )}
          <ActionMenu actions={actions} />
        </div>
      );
    },
    [handleCall],
  );

  /* ------ filter config ------ */

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "search",
        type: "search",
        label: "Search",
        placeholder: "Search by name or ID…",
      },
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
          { value: "Escalated", label: "Escalated" },
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

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div>
      {/* Active incident banner */}
      {activeIncidents.length > 0 && (
        <div className="bg-destructive text-white rounded-xl p-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} />
            <span className="font-medium">
              {activeIncidents.length} active incident
              {activeIncidents.length > 1 ? "s" : ""} needs immediate
              attention
              {" — reported "}
              {formatRelativeTime(activeIncidents[0].reportedAt)}
            </span>
          </div>
          <button
            onClick={() => router.push("/admin/complaints")}
            className="bg-white text-destructive font-bold px-4 py-2 rounded-full text-xs cursor-pointer hover:bg-white/90 transition"
          >
            Respond now
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-xl">Safety Incidents</h2>
          <p className="text-sm text-text-light mt-1">
            Anything reported during a home visit that isn&apos;t a routine
            complaint — these get an immediate response, not a queue.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="btn-outline !py-2 !px-3 text-xs cursor-pointer disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <DashboardStat
          label="Active incidents"
          value={String(activeIncidents.length)}
          sub="Critical severity"
          variant={activeIncidents.length > 0 ? "amber" : "default"}
        />
        <DashboardStat
          label="Under investigation"
          value={String(items.filter((i) => i.status === "Investigating").length)}
          sub="Being reviewed"
        />
        <DashboardStat
          label="Resolved"
          value={String(resolvedCount)}
          sub="All within SLA"
        />
        <DashboardStat
          label="Total incidents"
          value={String(total)}
          sub="In current filter"
        />
      </div>

      {/* Table */}
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
          onSortToggle={(col) => {
            toggleSort(col);
            setPage(1);
          }}
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

      {/* ============================================================ */}
      {/*  Modals                                                       */}
      {/* ============================================================ */}

      {/* ---- Preview modal ---- */}
      {previewIncident && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setPreviewIncident(null)}
        >
          <div
            className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg mb-4">
              Incident Details — {previewIncident.id.slice(0, 12)}
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex gap-3">
                <dt className="w-32 font-mono text-text-light uppercase text-xs">
                  ID
                </dt>
                <dd className="font-mono">{previewIncident.id}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 font-mono text-text-light uppercase text-xs">
                  Reported By
                </dt>
                <dd>{previewIncident.reportedBy}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 font-mono text-text-light uppercase text-xs">
                  Involving
                </dt>
                <dd>
                  {previewIncident.therapist} ↔ {previewIncident.patient}
                </dd>
              </div>
              {previewIncident.phone && (
                <div className="flex gap-3">
                  <dt className="w-32 font-mono text-text-light uppercase text-xs">
                    Phone
                  </dt>
                  <dd>{previewIncident.phone}</dd>
                </div>
              )}
              <div className="flex gap-3">
                <dt className="w-32 font-mono text-text-light uppercase text-xs">
                  Severity
                </dt>
                <dd>
                  <StatusChip status={previewIncident.severity} />
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 font-mono text-text-light uppercase text-xs">
                  Summary
                </dt>
                <dd>{previewIncident.summary}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 font-mono text-text-light uppercase text-xs">
                  Status
                </dt>
                <dd>
                  <StatusChip status={previewIncident.status} />
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 font-mono text-text-light uppercase text-xs">
                  Reported At
                </dt>
                <dd>{formatFullDate(previewIncident.reportedAt)}</dd>
              </div>
              {previewIncident.assignedTo && (
                <div className="flex gap-3">
                  <dt className="w-32 font-mono text-text-light uppercase text-xs">
                    Assigned To
                  </dt>
                  <dd>{previewIncident.assignedTo}</dd>
                </div>
              )}
            </dl>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setPreviewIncident(null)}
                className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Resolve confirm ---- */}
      <ConfirmDialog
        open={!!resolveTarget}
        onOpenChange={(open) => !open && setResolveTarget(null)}
        onConfirm={handleResolveConfirm}
        title="Mark as Resolved"
        description={`Mark incident <strong>${resolveTarget?.id.slice(0, 12) ?? ""}</strong> as resolved?`}
      />

      {/* ---- Escalate confirm ---- */}
      <ConfirmDialog
        open={!!escalateTarget}
        onOpenChange={(open) => !open && setEscalateTarget(null)}
        onConfirm={handleEscalateConfirm}
        title="Escalate Incident"
        description={`Escalate incident <strong>${escalateTarget?.id.slice(0, 12) ?? ""}</strong> to next level?`}
      />

      {/* ---- Delete confirm ---- */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Incident"
        description={`Delete incident <strong>${deleteTarget?.id.slice(0, 12) ?? ""}</strong>?`}
      />
    </div>
  );
}
