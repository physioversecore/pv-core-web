"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Phone,
  ArrowUpRight,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
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
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Incident {
  id: string;
  reportedBy: "Patient" | "Therapist";
  therapist: string;
  patient: string;
  phone?: string;
  severity: "Critical" | "High" | "Medium";
  summary: string;
  status: "Active" | "Investigating" | "Resolved" | "Escalated";
  reportedAt: string;
  assignedTo?: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "INC-007",
    reportedBy: "Patient",
    therapist: "Sujan Karki",
    patient: "Hari Bahadur Rai",
    phone: "+977-9841001234",
    severity: "Critical",
    summary:
      "Patient reports feeling unsafe, therapist behaving inappropriately mid-session",
    status: "Active",
    reportedAt: new Date(Date.now() - 6 * 60000).toISOString(),
  },
  {
    id: "INC-006",
    reportedBy: "Therapist",
    therapist: "Anita Tamang",
    patient: "Sita Gurung",
    phone: "+977-9851005678",
    severity: "Medium",
    summary: "Aggressive family member present at home during session",
    status: "Investigating",
    reportedAt: "2026-07-10T14:00:00",
  },
  {
    id: "INC-004",
    reportedBy: "Patient",
    therapist: "Rajesh Shrestha",
    patient: "Nabin Khadka",
    severity: "High",
    summary: "Therapist left session early without explanation",
    status: "Resolved",
    reportedAt: "2026-07-04T10:00:00",
  },
];

const MOCK_STAFF = [
  "Rita Sharma",
  "Deepak Basnet",
  "Sunita Maharjan",
  "Arjun Thapa",
  "Priya Adhikari",
];

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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function SafetyIncidentsPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [page, setPage] = useState(1);

  // Mock incidents state
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);

  // Modal states
  const [previewIncident, setPreviewIncident] = useState<Incident | null>(null);
  const [editIncident, setEditIncident] = useState<Incident | null>(null);
  const [assignIncident, setAssignIncident] = useState<Incident | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Incident | null>(null);
  const [resolveTarget, setResolveTarget] = useState<Incident | null>(null);
  const [escalateTarget, setEscalateTarget] = useState<Incident | null>(null);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({
    defaultColumn: "reportedAt",
  });
  const pageSize = 10;

  // Local filtering / sorting (mock data)
  const filteredIncidents = useMemo(() => {
    let result = [...incidents];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.therapist.toLowerCase().includes(q) ||
          r.patient.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q),
      );
    }
    if (severity) result = result.filter((r) => r.severity === severity);
    if (status) result = result.filter((r) => r.status === status);
    if (reportedBy) result = result.filter((r) => r.reportedBy === reportedBy);

    result.sort((a, b) => {
      if (a.status === "Active" && b.status !== "Active") return -1;
      if (b.status === "Active" && a.status !== "Active") return 1;
      if (sortBy) {
        const aVal = a[sortBy as keyof Incident] ?? "";
        const bVal = b[sortBy as keyof Incident] ?? "";
        const cmp = String(aVal).localeCompare(String(bVal), undefined, {
          numeric: true,
        });
        return sortOrder === "desc" ? -cmp : cmp;
      }
      return 0;
    });
    return result;
  }, [incidents, debouncedSearch, severity, status, reportedBy, sortBy, sortOrder]);

  const total = filteredIncidents.length;
  const pagedIncidents = filteredIncidents.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const activeIncidents = incidents.filter((i) => i.status === "Active");
  const resolvedCount = incidents.filter((i) => i.status === "Resolved").length;

  /* ------ helpers ------ */

  const updateIncident = useCallback(
    (id: string, patch: Partial<Incident>) => {
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? { ...inc, ...patch } : inc)),
      );
    },
    [],
  );

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

  const handleCall = useCallback(
    async (row: Incident) => {
      if (row.phone) {
        toast.info(`Calling ${row.therapist} at ${row.phone}…`);
      } else {
        toast.info(
          `Calling ${row.reportedBy === "Patient" ? row.patient : row.therapist}… (mock action)`,
        );
      }
      await sleep(800);
    },
    [],
  );

  const handleEscalateConfirm = useCallback(async () => {
    if (!escalateTarget) return;
    await sleep(600);
    updateIncident(escalateTarget.id, { status: "Escalated" });
    toast.success(`Incident ${escalateTarget.id} escalated to next level`);
    setEscalateTarget(null);
  }, [escalateTarget, updateIncident]);

  const handleEditSave = useCallback(
    async (data: Partial<Incident>) => {
      if (!editIncident) return;
      await sleep(700);
      updateIncident(editIncident.id, data);
      toast.success(`Incident ${editIncident.id} updated`);
      setEditIncident(null);
    },
    [editIncident, updateIncident],
  );

  const handleAssignConfirm = useCallback(
    async (staffName: string) => {
      if (!assignIncident) return;
      await sleep(600);
      updateIncident(assignIncident.id, { assignedTo: staffName });
      toast.success(`${assignIncident.id} assigned to ${staffName}`);
      setAssignIncident(null);
    },
    [assignIncident, updateIncident],
  );

  const handleResolveConfirm = useCallback(async () => {
    if (!resolveTarget) return;
    await sleep(600);
    updateIncident(resolveTarget.id, { status: "Resolved" });
    toast.success(`Incident ${resolveTarget.id} marked as resolved`);
    setResolveTarget(null);
  }, [resolveTarget, updateIncident]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const removed = deleteTarget;
    const removedId = removed.id;
    setIncidents((prev) => prev.filter((inc) => inc.id !== removedId));
    toast.success(`Incident ${removedId} deleted`, {
      action: {
        label: "Undo",
        onClick: () => setIncidents((prev) => [removed, ...prev]),
      },
      duration: 5000,
    });
    setDeleteTarget(null);
  }, [deleteTarget]);

  /* ------ columns ------ */

  const columns: Column<Incident>[] = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        render: (row) => <span className="font-mono text-xs">{row.id}</span>,
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
    (row: Incident) => {
      const isResolved = row.status === "Resolved";
      const isActive = row.status === "Active";

      const actions: ActionItem[] = [
        {
          key: "preview",
          label: "Preview",
          icon: <Eye size={14} />,
          onClick: () => setPreviewIncident(row),
        },
        {
          key: "edit",
          label: "Edit",
          icon: <Pencil size={14} />,
          onClick: () => setEditIncident(row),
        },
        {
          key: "assign",
          label: "Assign",
          icon: <UserPlus size={14} />,
          onClick: () => setAssignIncident(row),
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
          <button className="bg-white text-destructive font-bold px-4 py-2 rounded-full text-xs cursor-pointer hover:bg-white/90 transition">
            Respond now
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h2 className="font-display text-xl">Safety Incidents</h2>
        <p className="text-sm text-text-light mt-1">
          Anything reported during a home visit that isn&apos;t a routine
          complaint — these get an immediate response, not a queue.
        </p>
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
          label="Avg response time"
          value="4 min"
          sub="Within SLA (10 min)"
        />
        <DashboardStat
          label="Resolved this month"
          value={String(resolvedCount)}
          sub="All within SLA"
        />
        <DashboardStat
          label="Repeat locations"
          value="0"
          sub="No pattern detected"
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
          data={pagedIncidents}
          total={total}
          isLoading={false}
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
              Incident Details — {previewIncident.id}
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

      {/* ---- Edit modal ---- */}
      {editIncident && (
        <EditIncidentModal
          incident={editIncident}
          onClose={() => setEditIncident(null)}
          onSave={handleEditSave}
        />
      )}

      {/* ---- Assign modal ---- */}
      {assignIncident && (
        <AssignIncidentModal
          incident={assignIncident}
          staff={MOCK_STAFF}
          onClose={() => setAssignIncident(null)}
          onConfirm={handleAssignConfirm}
        />
      )}

      {/* ---- Resolve confirm ---- */}
      <ConfirmDialog
        open={!!resolveTarget}
        onOpenChange={(open) => !open && setResolveTarget(null)}
        onConfirm={handleResolveConfirm}
        title="Mark as Resolved"
        description={`Mark <strong>${resolveTarget?.id ?? ""}</strong> as resolved?`}
      />

      {/* ---- Escalate confirm ---- */}
      <ConfirmDialog
        open={!!escalateTarget}
        onOpenChange={(open) => !open && setEscalateTarget(null)}
        onConfirm={handleEscalateConfirm}
        title="Escalate Incident"
        description={`Escalate incident <strong>${escalateTarget?.id ?? ""}</strong> to next level?`}
      />

      {/* ---- Delete confirm ---- */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Incident"
        description={`Delete incident <strong>${deleteTarget?.id ?? ""}</strong>? This cannot be undone.`}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Edit Modal                                                         */
/* ------------------------------------------------------------------ */

function EditIncidentModal({
  incident,
  onClose,
  onSave,
}: {
  incident: Incident;
  onClose: () => void;
  onSave: (data: Partial<Incident>) => Promise<void>;
}) {
  const [summary, setSummary] = useState(incident.summary);
  const [severity, setSeverity] = useState(incident.severity);
  const [status, setStatus] = useState(incident.status);
  const [therapist, setTherapist] = useState(incident.therapist);
  const [patient, setPatient] = useState(incident.patient);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ summary, severity, status, therapist, patient });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg mb-4">
          Edit — {incident.id}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-mono text-text-light uppercase">
              Therapist
            </label>
            <input
              value={therapist}
              onChange={(e) => setTherapist(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">
              Patient
            </label>
            <input
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">
              Severity
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Incident["severity"])}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Incident["status"])}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            >
              <option value="Active">Active</option>
              <option value="Investigating">Investigating</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">
              Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              required
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="chip !bg-secondary !text-white cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Assign Modal                                                       */
/* ------------------------------------------------------------------ */

function AssignIncidentModal({
  incident,
  staff,
  onClose,
  onConfirm,
}: {
  incident: Incident;
  staff: string[];
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState(incident.assignedTo ?? "");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await onConfirm(selected);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg mb-1">
          Assign — {incident.id}
        </h3>
        <p className="text-sm text-text-light mb-4">
          Select a staff member to assign this incident to.
        </p>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm mb-4"
        >
          <option value="">Select staff…</option>
          {staff.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected || loading}
            className="chip !bg-secondary !text-white cursor-pointer disabled:opacity-50"
          >
            {loading ? "Assigning…" : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
