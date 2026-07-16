"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Check,
  X,
  Send,
  Ban,
  Eye,
  Phone,
  AlertTriangle,
  SlidersHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminVerifications } from "@/hooks/useAdminVerifications";
import { DashboardStat } from "@/components/dashboard/DashboardStat";
import {
  DataTable,
  ActionMenu,
  FilterBar,
  StatusChip,
  ConfirmDialog,
  type Column,
  type FilterConfig,
  type ActionItem,
} from "@/components/tables";
import type { AdminVerificationData } from "@/services/api/admin";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VerificationPage() {
  const [search, setSearch] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reviewRow, setReviewRow] = useState<AdminVerificationData | null>(null);

  const [previewRow, setPreviewRow] = useState<AdminVerificationData | null>(null);
  const [callLoading, setCallLoading] = useState<string | null>(null);
  const [escalateRow, setEscalateRow] = useState<AdminVerificationData | null>(null);
  const [localOverrides, setLocalOverrides] = useState<
    Record<string, Partial<AdminVerificationData>>
  >({});

  const [editRow, setEditRow] = useState<AdminVerificationData | null>(null);
  const [editForm, setEditForm] = useState({
    documentType: "",
    status: "",
    severity: "",
    expires: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminVerificationData | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState("");
  const [reportedByFilter, setReportedByFilter] = useState("");

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({
    defaultColumn: "therapist",
  });
  const pageSize = 10;

  const { items, total, isLoading, approveVerif, rejectVerif, editVerif, deleteVerif } =
    useAdminVerifications({
      search: debouncedSearch,
      documentType,
      status,
      severity: severityFilter,
      reportedBy: reportedByFilter,
      sortBy,
      sortOrder,
      page,
      pageSize,
    });

  const itemsWithOverrides = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        ...localOverrides[item.id],
      })),
    [items, localOverrides],
  );

  const resetFilters = useCallback(() => {
    setSearch("");
    setDocumentType("");
    setStatus("");
    setSeverityFilter("");
    setReportedByFilter("");
    setPage(1);
  }, []);

  const filterValues = useMemo(
    () => ({ search, documentType, status }),
    [search, documentType, status],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setSearch(value);
      else if (key === "documentType") setDocumentType(value);
      else if (key === "status") setStatus(value);
      setPage(1);
    },
    [],
  );

  const hasAdvancedFilters = severityFilter !== "" || reportedByFilter !== "";

  const clearAdvancedFilters = useCallback(() => {
    setSeverityFilter("");
    setReportedByFilter("");
    setPage(1);
  }, []);

  const handleCall = useCallback((row: AdminVerificationData) => {
    setCallLoading(row.id);
    setTimeout(() => {
      setCallLoading(null);
      if (row.phone) {
        window.location.href = `tel:${row.phone}`;
      } else {
        toast(
          `Calling ${row.therapist}... (mock action — API not yet connected)`,
        );
      }
    }, 1000);
  }, []);

  const handleEscalate = useCallback(() => {
    if (!escalateRow) return;
    setLocalOverrides((prev) => ({
      ...prev,
      [escalateRow.id]: {
        ...prev[escalateRow.id],
        status: "Escalated",
      },
    }));
    toast.success(`${escalateRow.therapist} has been escalated`);
    setEscalateRow(null);
  }, [escalateRow]);

  const handleEditSave = useCallback(async () => {
    if (!editRow) return;
    setEditSaving(true);
    try {
      const payload: Partial<AdminVerificationData> = {};
      if (editForm.documentType) payload.documentType = editForm.documentType as AdminVerificationData["documentType"];
      if (editForm.status) payload.status = editForm.status as AdminVerificationData["status"];
      if (editForm.severity) payload.severity = editForm.severity as AdminVerificationData["severity"];
      if (editForm.expires !== undefined) payload.expires = editForm.expires || null;
      await editVerif(editRow.id, payload);
      setLocalOverrides((prev) => ({
        ...prev,
        [editRow.id]: { ...prev[editRow.id], ...payload },
      }));
      toast.success(`Verification for ${editRow.therapist} updated`);
      setEditRow(null);
    } catch {
      toast.error("Failed to update verification");
    } finally {
      setEditSaving(false);
    }
  }, [editRow, editForm, editVerif]);

  const handleDeleteSubmit = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteSaving(true);
    try {
      await deleteVerif(deleteTarget.id);
      setLocalOverrides((prev) => {
        const next = { ...prev };
        delete next[deleteTarget.id];
        return next;
      });
      toast.success(`Verification for ${deleteTarget.therapist} deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete verification");
    } finally {
      setDeleteSaving(false);
    }
  }, [deleteTarget, deleteVerif]);

  const columns: Column<AdminVerificationData>[] = useMemo(
    () => [
      {
        key: "therapist",
        label: "Therapist",
        sortable: true,
        render: (row) => <span className="font-medium">{row.therapist}</span>,
      },
      {
        key: "documentType",
        label: "Document",
        render: (row) => (
          <span className="text-text-light">{row.documentType}</span>
        ),
      },
      {
        key: "uploaded",
        label: "Uploaded",
        sortable: true,
        render: (row) => (
          <span className="font-mono text-xs text-text-light">
            {formatDate(row.uploaded)}
          </span>
        ),
      },
      {
        key: "expires",
        label: "Expires",
        sortable: true,
        render: (row) => (
          <span className="font-mono text-xs text-text-light">
            {row.expires ? formatDate(row.expires) : "—"}
          </span>
        ),
      },
      {
        key: "severity",
        label: "Severity",
        render: (row) =>
          row.severity ? (
            <StatusChip status={row.severity} />
          ) : (
            <span className="text-text-muted">—</span>
          ),
      },
      {
        key: "reportedBy",
        label: "Reported By",
        render: (row) => (
          <span className="text-text-light text-sm">
            {row.reportedBy ?? "—"}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusChip status={row.status} />,
      },
    ],
    [],
  );

  const renderActions = useCallback(
    (row: AdminVerificationData) => {
      const actions: ActionItem[] = [
        {
          key: "preview",
          label: "Preview",
          icon: <Eye size={14} />,
          onClick: () => setPreviewRow(row),
        },
        {
          key: "call",
          label: "Call",
          icon: <Phone size={14} />,
          onClick: () => handleCall(row),
        },
      ];

      if (row.status !== "Escalated") {
        actions.push({
          key: "escalate",
          label: "Escalate",
          icon: <AlertTriangle size={14} />,
          onClick: () => setEscalateRow(row),
        });
      }

      if (row.status === "Pending review") {
        actions.push({
          key: "review",
          label: "Review",
          icon: <Eye size={14} />,
          onClick: () => setReviewRow(row),
        });
        actions.push({
          key: "approve",
          label: "Approve",
          icon: <Check size={14} />,
          onClick: () => approveVerif(row.id),
        });
      } else if (row.status === "Expiring soon") {
        actions.push({
          key: "remind",
          label: "Remind",
          icon: <Send size={14} />,
          onClick: () => toast(`Reminder sent to ${row.therapist}`),
        });
      } else if (row.status === "Expired") {
        actions.push({
          key: "suspend",
          label: "Suspend",
          icon: <Ban size={14} />,
          variant: "destructive",
          onClick: () => {
            setLocalOverrides((prev) => ({
              ...prev,
              [row.id]: { ...prev[row.id], status: "Expired" },
            }));
            toast.success(`${row.therapist} bookings suspended`);
          },
        });
      }

      actions.push({
        key: "edit",
        label: "Edit",
        icon: <Pencil size={14} />,
        onClick: () => {
          setEditForm({
            documentType: row.documentType,
            status: row.status,
            severity: row.severity ?? "",
            expires: row.expires ?? "",
          });
          setEditRow(row);
        },
      });

      actions.push({
        key: "delete",
        label: "Delete",
        icon: <Trash2 size={14} />,
        variant: "destructive",
        onClick: () => setDeleteTarget(row),
      });

      return <ActionMenu actions={actions} />;
    },
    [approveVerif, handleCall],
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "search",
        type: "search",
        label: "Therapist",
        placeholder: "Search therapist…",
      },
      {
        key: "documentType",
        type: "select",
        label: "Document type",
        placeholder: "All types",
        options: [
          { value: "Practice license", label: "Practice license" },
          { value: "Government ID", label: "Government ID" },
          { value: "Certification", label: "Certification" },
        ],
      },
      {
        key: "status",
        type: "select",
        label: "Status",
        placeholder: "All statuses",
        options: [
          { value: "Pending review", label: "Pending review" },
          { value: "Verified", label: "Verified" },
          { value: "Expiring soon", label: "Expiring soon" },
          { value: "Expired", label: "Expired" },
          { value: "Rejected", label: "Rejected" },
          { value: "Escalated", label: "Escalated" },
        ],
      },
    ],
    [],
  );

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-xl">Therapist Verification</h2>
        <p className="text-sm text-text-light mt-1">
          License, ID, and certificate checks — no one takes a home visit
          unverified.
        </p>
      </div>

      <div className="stats-grid">
        <DashboardStat
          label="Pending review"
          value="3"
          sub="Needs a decision"
          variant="amber"
        />
        <DashboardStat
          label="Verified this month"
          value="4"
          sub="All documents current"
        />
        <DashboardStat
          label="Expiring in 30 days"
          value="2"
          sub="License renewal due"
          variant="amber"
        />
        <DashboardStat
          label="Expired / rejected"
          value="1"
          sub="Suspended from bookings"
        />
      </div>

      <div className="card-soft p-5">
        <FilterBar
          filters={filterConfig}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={resetFilters}
        />

        <div className="mb-4">
          <button
            onClick={() => setFilterPanelOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filterPanelOpen || hasAdvancedFilters
                ? "bg-secondary text-white"
                : "text-text-light hover:text-text hover:bg-muted"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          {filterPanelOpen && (
            <div className="flex flex-wrap items-end gap-3 mt-3 p-3 bg-surface/50 rounded-xl">
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[0.65rem] uppercase font-mono text-text-light">
                  Severity
                </label>
                <Select
                  value={severityFilter}
                  onValueChange={(v) => {
                    setSeverityFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-48 rounded-full border-border text-sm">
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[0.65rem] uppercase font-mono text-text-light">
                  Status
                </label>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-48 rounded-full border-border text-sm">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending review">
                      Pending review
                    </SelectItem>
                    <SelectItem value="Verified">Verified</SelectItem>
                    <SelectItem value="Expiring soon">
                      Expiring soon
                    </SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[0.65rem] uppercase font-mono text-text-light">
                  Reported By
                </label>
                <Select
                  value={reportedByFilter}
                  onValueChange={(v) => {
                    setReportedByFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-48 rounded-full border-border text-sm">
                    <SelectValue placeholder="All reporters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="System">System</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Patient">Patient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasAdvancedFilters && (
                <button
                  onClick={clearAdvancedFilters}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium text-text-light hover:text-text hover:bg-muted transition-colors cursor-pointer"
                >
                  <X size={12} />
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={itemsWithOverrides}
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
            row.status === "Expiring soon" ||
            row.status === "Expired" ||
            row.status === "Escalated"
              ? "bg-primary/5"
              : undefined
          }
          emptyMessage="No verification records found"
        />
      </div>

      {previewRow && (
        <PreviewModal
          verification={previewRow}
          onClose={() => setPreviewRow(null)}
        />
      )}

      <ConfirmDialog
        open={!!escalateRow}
        onOpenChange={(open) => !open && setEscalateRow(null)}
        onConfirm={handleEscalate}
        title="Escalate this case?"
        description={`Escalate this verification case for <strong>${escalateRow?.therapist ?? ""}</strong> to the next review level?`}
      />

      {reviewRow && (
        <ReviewDrawer
          verification={reviewRow}
          onClose={() => setReviewRow(null)}
          onApprove={() => {
            approveVerif(reviewRow.id);
            setReviewRow(null);
          }}
        />
      )}

      {editRow && (
        <EditDrawer
          verification={editRow}
          form={editForm}
          onFormChange={setEditForm}
          onClose={() => setEditRow(null)}
          onSave={handleEditSave}
          saving={editSaving}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteSubmit}
        title="Delete this verification?"
        description={`Permanently delete the verification record for <strong>${deleteTarget?.therapist ?? ""}</strong> (${deleteTarget?.documentType ?? ""})? This action cannot be undone.`}
      />
    </div>
  );
}

function PreviewModal({
  verification,
  onClose,
}: {
  verification: AdminVerificationData;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            Verification Details
          </DialogTitle>
          <DialogDescription>
            {verification.therapist} · {verification.documentType}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusChip status={verification.status} />
            {verification.severity && (
              <StatusChip status={verification.severity} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                Document
              </span>
              <span>{verification.documentType}</span>
            </div>
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                Reported By
              </span>
              <span>{verification.reportedBy ?? "—"}</span>
            </div>
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                Uploaded
              </span>
              <span className="font-mono text-xs">
                {formatDate(verification.uploaded)}
              </span>
            </div>
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                Expires
              </span>
              <span className="font-mono text-xs">
                {verification.expires
                  ? formatDate(verification.expires)
                  : "No expiry"}
              </span>
            </div>
            {verification.phone && (
              <div>
                <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                  Phone
                </span>
                <span className="font-mono text-xs">
                  {verification.phone}
                </span>
              </div>
            )}
          </div>
          <div className="bg-surface rounded-xl p-6 text-center text-text-muted text-sm">
            Document preview area
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReviewDrawer({
  verification,
  onClose,
  onApprove,
}: {
  verification: AdminVerificationData;
  onClose: () => void;
  onApprove: () => void;
}) {
  const [rejectNote, setRejectNote] = useState("");

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">Review Document</SheetTitle>
          <SheetDescription>
            {verification.therapist} · {verification.documentType}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-3">
            <StatusChip status={verification.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                Uploaded
              </span>
              <span className="font-mono text-xs">
                {formatDate(verification.uploaded)}
              </span>
            </div>
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                Expires
              </span>
              <span className="font-mono text-xs">
                {verification.expires
                  ? formatDate(verification.expires)
                  : "No expiry"}
              </span>
            </div>
          </div>
          <div className="bg-surface rounded-xl p-8 text-center text-text-muted text-sm">
            Document preview area
          </div>
          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Rejection note (required on reject)
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm min-h-[80px]"
              placeholder="Reason for rejection…"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              className="chip !bg-success !text-white cursor-pointer"
            >
              <Check size={12} className="inline mr-1" /> Approve
            </button>
            <button className="chip !bg-destructive !text-white cursor-pointer">
              <X size={12} className="inline mr-1" /> Reject
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EditDrawer({
  verification,
  form,
  onFormChange,
  onClose,
  onSave,
  saving,
}: {
  verification: AdminVerificationData;
  form: { documentType: string; status: string; severity: string; expires: string };
  onFormChange: (f: { documentType: string; status: string; severity: string; expires: string }) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">Edit Verification</SheetTitle>
          <SheetDescription>
            {verification.therapist} · {verification.documentType}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Document Type
            </label>
            <Select
              value={form.documentType}
              onValueChange={(v) => onFormChange({ ...form, documentType: v })}
            >
              <SelectTrigger className="h-9 w-full rounded-full border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Practice license">Practice license</SelectItem>
                <SelectItem value="Government ID">Government ID</SelectItem>
                <SelectItem value="Certification">Certification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Status
            </label>
            <Select
              value={form.status}
              onValueChange={(v) => onFormChange({ ...form, status: v })}
            >
              <SelectTrigger className="h-9 w-full rounded-full border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending review">Pending review</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Expiring soon">Expiring soon</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Severity
            </label>
            <Select
              value={form.severity}
              onValueChange={(v) => onFormChange({ ...form, severity: v })}
            >
              <SelectTrigger className="h-9 w-full rounded-full border-border text-sm">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Expiry Date
            </label>
            <Input
              type="date"
              value={form.expires}
              onChange={(e) => onFormChange({ ...form, expires: e.target.value })}
              className="h-9 w-full rounded-full border-border text-sm"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="chip !bg-success !text-white cursor-pointer disabled:opacity-50"
            >
              <Check size={12} className="inline mr-1" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={onClose}
              className="chip cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
