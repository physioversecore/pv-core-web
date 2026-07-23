"use client";

import { useState, useMemo, useCallback } from "react";
import { npr } from "@/lib/cart";
import { Eye, CheckCircle, XCircle, ExternalLink, Pencil, Trash2, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminRefunds } from "@/hooks/useAdminRefunds";
import { type RefundReason, type RefundStatus, type AdminCreateRefundPayload } from "@/services/api/admin";
import { DashboardStat } from "@/components/dashboard";
import { LogManualCaseModal } from "@/components/refunds/LogManualCaseModal";
import {
  DataTable,
  ActionMenu,
  ConfirmDialog,
  FilterBar,
  StatusChip,
  type Column,
  type FilterConfig,
  type StatusType,
} from "@/components/tables";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminRefunds() {
  const { t } = useLang();

  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [viewRow, setViewRow] = useState<RefundRow | null>(null);
  const [editRow, setEditRow] = useState<RefundRow | null>(null);
  const [editForm, setEditForm] = useState({ amount: "", reason: "", status: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RefundRow | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [denyTarget, setDenyTarget] = useState<RefundRow | null>(null);
  const [denyReason, setDenyReason] = useState("");
  const [denySaving, setDenySaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ patientId: "", bookingId: "", amount: "", reason: "" });
  const [addSaving, setAddSaving] = useState(false);
  const [manualCaseOpen, setManualCaseOpen] = useState(false);
  const [assignRow, setAssignRow] = useState<RefundRow | null>(null);
  const [assignee, setAssignee] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);

  const debouncedSearch = useDebounce(search);
  const sort = useTableSort({ defaultColumn: "filed" });
  const pageSize = 10;

  const {
    items,
    total,
    isLoading,
    createRefund,
    approveRefund,
    denyRefund,
    updateRefund,
    deleteRefund,
    assignRefund,
  } = useAdminRefunds({
    search: debouncedSearch,
    reason,
    status,
    dateFrom,
    dateTo,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    page,
    pageSize,
  });

  const resetFilters = useCallback(() => {
    setSearch("");
    setReason("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, []);

  const filterValues = useMemo(
    () => ({ search, reason, status, dateFrom, dateTo }),
    [search, reason, status, dateFrom, dateTo],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setSearch(value);
      else if (key === "reason") setReason(value === "all" ? "" : value);
      else if (key === "status") setStatus(value === "all" ? "" : value);
      else if (key === "dateFrom") setDateFrom(value);
      else if (key === "dateTo") setDateTo(value);
      setPage(1);
    },
    [],
  );

  const handleApprove = useCallback(
    async (row: RefundRow) => {
      try {
        await approveRefund(row.id);
        toast.success("Refund approved");
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [approveRefund, t],
  );

  const handleDenySubmit = useCallback(async () => {
    if (!denyTarget || !denyReason.trim()) return;
    setDenySaving(true);
    try {
      await denyRefund(denyTarget.id, denyReason.trim());
      toast.success("Refund denied");
      setDenyTarget(null);
      setDenyReason("");
    } catch {
      toast.error(t("common.tryAgain") ?? "Something went wrong");
    } finally {
      setDenySaving(false);
    }
  }, [denyTarget, denyReason, denyRefund, t]);

  const handleEditOpen = useCallback((row: RefundRow) => {
    setEditRow(row);
    setEditForm({ amount: String(row.amount), reason: row.reason, status: row.status });
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editRow) return;
    setEditSaving(true);
    try {
      await updateRefund(editRow.id, {
        amount: Number(editForm.amount),
        reason: editForm.reason as RefundReason,
        status: editForm.status as RefundStatus,
      });
      toast.success("Refund updated");
      setEditRow(null);
    } catch {
      toast.error(t("common.tryAgain") ?? "Something went wrong");
    } finally {
      setEditSaving(false);
    }
  }, [editRow, editForm, updateRefund, t]);

  const handleDeleteSubmit = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteSaving(true);
    try {
      await deleteRefund(deleteTarget.id);
      toast.success("Refund deleted");
      setDeleteTarget(null);
    } catch {
      toast.error(t("common.tryAgain") ?? "Something went wrong");
    } finally {
      setDeleteSaving(false);
    }
  }, [deleteTarget, deleteRefund, t]);

  const handleAddSubmit = useCallback(async () => {
    if (!addForm.patientId.trim() || !addForm.bookingId.trim() || !addForm.amount || !addForm.reason) return;
    setAddSaving(true);
    try {
      await createRefund({
        patientId: addForm.patientId.trim(),
        bookingId: addForm.bookingId.trim(),
        amount: Number(addForm.amount),
        reason: addForm.reason as RefundReason,
      });
      toast.success("Refund created");
      setAddOpen(false);
      setAddForm({ patientId: "", bookingId: "", amount: "", reason: "" });
    } catch {
      toast.error(t("common.tryAgain") ?? "Something went wrong");
    } finally {
      setAddSaving(false);
    }
  }, [addForm, createRefund, t]);

  const handleAssignSubmit = useCallback(async () => {
    if (!assignRow || !assignee.trim()) return;
    setAssignSaving(true);
    try {
      await assignRefund(assignRow.id, assignee.trim());
      toast.success(`Refund ${assignRow.id} assigned`);
      setAssignRow(null);
      setAssignee("");
    } catch {
      toast.error("Failed to assign refund");
    } finally {
      setAssignSaving(false);
    }
  }, [assignRow, assignee, assignRefund]);

  const columns: Column<RefundRow>[] = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        sortable: true,
        render: (row) => <span className="font-mono text-xs text-secondary">{row.id}</span>,
      },
      {
        key: "patient",
        label: t("admin_dashboard.patient") ?? "Patient",
        sortable: true,
        render: (row) => <span className="font-medium">{row.patient}</span>,
      },
      {
        key: "bookingId",
        label: "Booking",
        render: (row) => (
          <a
            href={`/admin/bookings?search=${row.bookingId}`}
            className="font-mono text-xs text-secondary hover:underline inline-flex items-center gap-1"
          >
            {row.bookingId}
            <ExternalLink size={10} />
          </a>
        ),
      },
      {
        key: "amount",
        label: t("admin_dashboard.amount") ?? "Amount",
        sortable: true,
        render: (row) => <span className="font-medium">{npr(row.amount)}</span>,
      },
      {
        key: "reason",
        label: "Reason",
        sortable: true,
        render: (row) => <span className="text-text-light">{row.reason}</span>,
      },
      {
        key: "status",
        label: t("admin_dashboard.status") ?? "Status",
        sortable: true,
        render: (row) => <StatusChip status={row.status} />,
      },
      {
        key: "assigneeId",
        label: "Assignee",
        render: (row) => (
          <span className="text-text-light text-xs">
            {row.assigneeId || <span className="text-text-light/50">Unassigned</span>}
          </span>
        ),
      },
      {
        key: "source",
        label: "Source",
        render: (row) => (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            row.source === "ADMIN_MANUAL"
              ? "bg-amber-100 text-amber-700"
              : "bg-surface text-text-light"
          }`}>
            {row.source === "ADMIN_MANUAL" ? "Manual" : "Patient"}
          </span>
        ),
      },
      {
        key: "filed",
        label: "Filed",
        sortable: true,
        render: (row) => <span className="text-text-light">{row.filed}</span>,
      },
    ],
    [t],
  );

  const renderActions = useCallback(
    (row: RefundRow) => {
      const actions: { key: string; label: string; icon: React.ReactNode; variant?: "default" | "destructive"; tooltip?: string; onClick: () => void }[] = [
        {
          key: "preview",
          label: t("admin_dashboard.view") ?? "Preview",
          icon: <Eye size={14} />,
          onClick: () => setViewRow(row),
        },
        {
          key: "edit",
          label: t("admin_dashboard.edit") ?? "Edit",
          icon: <Pencil size={14} />,
          onClick: () => handleEditOpen(row),
        },
        {
          key: "assign",
          label: t("admin_dashboard.assign") ?? "Assign",
          icon: <UserPlus size={14} />,
          tooltip: row.assigneeId ? `Assigned to: ${row.assigneeId}` : undefined,
          onClick: () => { setAssignRow(row); setAssignee(row.assigneeId ?? ""); },
        },
      ];

      if (row.status === "Pending") {
        actions.push(
          {
            key: "approve",
            label: "Approve",
            icon: <CheckCircle size={14} />,
            onClick: () => handleApprove(row),
          },
          {
            key: "deny",
            label: "Deny",
            icon: <XCircle size={14} />,
            variant: "destructive",
            onClick: () => setDenyTarget(row),
          },
        );
      }

      actions.push({
        key: "delete",
        label: t("admin_dashboard.delete") ?? "Delete",
        icon: <Trash2 size={14} />,
        variant: "destructive",
        onClick: () => setDeleteTarget(row),
      });

      return <ActionMenu actions={actions} />;
    },
    [handleApprove, handleEditOpen, t],
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "search",
        type: "search",
        label: t("admin_dashboard.patient") ?? "Patient",
        placeholder: "Search patient name or booking ID...",
      },
      {
        key: "reason",
        type: "select",
        label: "Reason",
        placeholder: "All reasons",
        options: [
          { value: "all", label: "All" },
          { value: "No-show", label: "No-show" },
          { value: "Double charge", label: "Double charge" },
          { value: "Service quality", label: "Service quality" },
          { value: "Cancellation", label: "Cancellation" },
        ],
      },
      {
        key: "status",
        type: "select",
        label: t("admin_dashboard.status") ?? "Status",
        placeholder: "All statuses",
        options: [
          { value: "all", label: "All" },
          { value: "Pending", label: "Pending" },
          { value: "Approved", label: "Approved" },
          { value: "Denied", label: "Denied" },
        ],
      },
      { key: "dateFrom", type: "date", label: "From date" },
      { key: "dateTo", type: "date", label: "To date" },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl">Refunds &amp; Disputes</h2>
          <p className="text-sm text-text-light mt-1">
            Money-back cases — separate from Complaints, since not every refund starts as one.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setManualCaseOpen(true)}
            className="chip !bg-amber-600 !text-white cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} />
            Log Manual Case
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="chip !bg-secondary !text-white cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} />
            Add Refund
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <DashboardStat label="Pending refunds" value="2" sub="Needs a decision" />
        <DashboardStat label="Refunded this month" value={npr(8200)} sub="Across 6 cases" />
        <DashboardStat label="Dispute rate" value="1.4%" sub="↓ 0.3% vs last month" />
        <DashboardStat label="Avg resolution time" value="1.2 days" sub="Within target" />
      </div>

      {/* Refunds Table */}
      <div className="card-soft p-5">
        <h3 className="font-display text-xl mb-4">Cases</h3>

        <FilterBar
          filters={filterConfig}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={resetFilters}
          expandable
        />

        <DataTable
          columns={columns}
          data={items}
          total={total}
          isLoading={isLoading}
          sortColumn={sort.sort.column}
          sortOrder={sort.sort.direction}
          onSortToggle={(col) => {
            sort.toggleSort(col);
            setPage(1);
          }}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          renderActions={renderActions}
          emptyMessage="No refund cases found"
        />
      </div>

      {/* View Details Dialog */}
      {viewRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewRow(null)}>
          <div className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-4">Refund Details</h3>
            <div className="space-y-2.5">
              {[
                { label: "Case ID", value: viewRow.id },
                { label: "Patient", value: viewRow.patient },
                { label: "Booking", value: viewRow.bookingId },
                { label: "Amount", value: npr(viewRow.amount) },
                { label: "Reason", value: viewRow.reason },
                { label: "Status", value: viewRow.status },
                { label: "Filed", value: viewRow.filed },
                { label: "Source", value: viewRow.source === "ADMIN_MANUAL" ? "Manual (Admin)" : "Patient submitted" },
                ...(viewRow.assigneeId ? [{ label: "Assignee", value: viewRow.assigneeId }] : []),
                ...(viewRow.notes ? [{ label: "Notes", value: viewRow.notes }] : []),
                ...(viewRow.complaintId ? [{ label: "Linked Complaint", value: viewRow.complaintId }] : []),
                ...(viewRow.resolvedAt ? [{ label: "Resolved", value: viewRow.resolvedAt }] : []),
                ...(viewRow.denyReason ? [{ label: "Deny reason", value: viewRow.denyReason }] : []),
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-xs font-mono text-text-light uppercase">{r.label}</span>
                  <span className="text-sm font-medium">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <button type="button" onClick={() => setViewRow(null)} className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer">
                {t("common.close") ?? "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditRow(null)}>
          <div className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-1">Edit Refund</h3>
            <p className="text-sm text-text-light mb-4">
              Case <span className="font-mono font-medium text-text">{editRow.id}</span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-text-light uppercase">Amount (NPR)</label>
                <Input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-text-light uppercase">Reason</label>
                <Select value={editForm.reason} onValueChange={(v) => setEditForm((f) => ({ ...f, reason: v }))}>
                  <SelectTrigger className="mt-1 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No-show">No-show</SelectItem>
                    <SelectItem value="Double charge">Double charge</SelectItem>
                    <SelectItem value="Service quality">Service quality</SelectItem>
                    <SelectItem value="Cancellation">Cancellation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-mono text-text-light uppercase">Status</label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setEditRow(null)}
                className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer"
              >
                {t("common.cancel") ?? "Cancel"}
              </button>
              <button
                type="button"
                disabled={editSaving}
                onClick={handleEditSave}
                className="chip !bg-secondary !text-white cursor-pointer disabled:opacity-50"
              >
                {editSaving ? (t("common.loading") ?? "Loading...") : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={handleDeleteSubmit}
        title="Delete Refund"
        description={`Are you sure you want to delete refund <strong>${deleteTarget?.id}</strong> for <strong>${deleteTarget ? npr(deleteTarget.amount) : ""}</strong>? This action cannot be undone.`}
      />

      {/* Deny Dialog */}
      {denyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setDenyTarget(null); setDenyReason(""); }}>
          <div className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-1">Deny Refund</h3>
            <p className="text-sm text-text-light mb-4">
              Case <span className="font-mono font-medium text-text">{denyTarget.id}</span> — {npr(denyTarget.amount)}
            </p>
            <div>
              <label className="text-xs font-mono text-text-light uppercase">Reason (required)</label>
              <textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="Explain why this refund is being denied..."
                rows={3}
                className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => { setDenyTarget(null); setDenyReason(""); }}
                className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer"
              >
                {t("common.cancel") ?? "Cancel"}
              </button>
              <button
                type="button"
                disabled={!denyReason.trim() || denySaving}
                onClick={handleDenySubmit}
                className="chip !bg-destructive !text-white cursor-pointer disabled:opacity-50"
              >
                {denySaving ? (t("common.loading") ?? "Loading...") : "Deny Refund"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Refund Dialog */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setAddOpen(false)}>
          <div className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-1">Add Refund</h3>
            <p className="text-sm text-text-light mb-4">
              Create a new refund or dispute case.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-text-light uppercase">Patient ID</label>
                <Input
                  value={addForm.patientId}
                  onChange={(e) => setAddForm((f) => ({ ...f, patientId: e.target.value }))}
                  placeholder="Enter patient ID"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-text-light uppercase">Booking ID</label>
                <Input
                  value={addForm.bookingId}
                  onChange={(e) => setAddForm((f) => ({ ...f, bookingId: e.target.value }))}
                  placeholder="Enter booking ID"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-text-light uppercase">Amount (NPR)</label>
                <Input
                  type="number"
                  value={addForm.amount}
                  onChange={(e) => setAddForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-text-light uppercase">Reason</label>
                <Select value={addForm.reason} onValueChange={(v) => setAddForm((f) => ({ ...f, reason: v }))}>
                  <SelectTrigger className="mt-1 h-9">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No-show">No-show</SelectItem>
                    <SelectItem value="Double charge">Double charge</SelectItem>
                    <SelectItem value="Service quality">Service quality</SelectItem>
                    <SelectItem value="Cancellation">Cancellation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer"
              >
                {t("common.cancel") ?? "Cancel"}
              </button>
              <button
                type="button"
                disabled={!addForm.patientId.trim() || !addForm.bookingId.trim() || !addForm.amount || !addForm.reason || addSaving}
                onClick={handleAddSubmit}
                className="chip !bg-secondary !text-white cursor-pointer disabled:opacity-50"
              >
                {addSaving ? (t("common.loading") ?? "Loading...") : "Create Refund"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Refund Dialog */}
      {assignRow && (
        <Dialog open onOpenChange={(open) => { if (!open) { setAssignRow(null); setAssignee(""); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">{t("admin_dashboard.assign") ?? "Assign Refund"}</DialogTitle>
              <DialogDescription>{assignRow.id} — {npr(assignRow.amount)}</DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              {assignRow.assigneeId && (
                <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-xl px-3 py-2 text-sm">
                  <UserPlus size={14} className="text-secondary" />
                  <span className="text-text-light">Currently assigned:</span>
                  <span className="font-medium">{assignRow.assigneeId}</span>
                </div>
              )}

              <div>
                <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
                  Assign to
                </label>
                <Input
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Enter assignee name or ID"
                />
              </div>
            </div>

            <DialogFooter className="mt-2">
              <button
                onClick={() => { setAssignRow(null); setAssignee(""); }}
                className="px-4 py-2 rounded-xl text-sm text-text-light hover:bg-muted transition cursor-pointer"
              >
                {t("common.cancel") ?? "Cancel"}
              </button>
              <button
                onClick={handleAssignSubmit}
                disabled={assignSaving || !assignee.trim()}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-secondary text-white hover:opacity-90 transition cursor-pointer disabled:opacity-50"
              >
                {assignSaving ? "Saving..." : "Assign"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Log Manual Case Modal */}
      <LogManualCaseModal open={manualCaseOpen} onClose={() => setManualCaseOpen(false)} />
    </div>
  );
}

type RefundRow = {
  id: string;
  patient: string;
  patientId: string;
  bookingId: string;
  amount: number;
  reason: string;
  status: StatusType;
  filed: string;
  resolvedAt?: string;
  denyReason?: string;
  assigneeId?: string;
  source?: string;
  complaintId?: string;
  notes?: string;
};
