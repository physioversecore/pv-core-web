"use client";

import { useState, useMemo, useCallback } from "react";
import { npr } from "@/lib/cart";
import { Eye, CreditCard, Ban } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminPayments } from "@/hooks/useAdminPayments";
import { useAdminPayouts } from "@/hooks/useAdminPayouts";
import {
  DataTable,
  ActionMenu,
  useRowActions,
  ConfirmDialog,
  FilterBar,
  StatusChip,
  type Column,
  type FilterConfig,
} from "@/components/tables";
import type { AdminPaymentData } from "@/services/api/admin";
import type { AdminPayoutData } from "@/services/api/admin";

export default function AdminPayments() {
  const { t } = useLang();

  // --- Patient Payments state ---
  const [patientSearch, setPatientSearch] = useState("");
  const [patientDateFrom, setPatientDateFrom] = useState("");
  const [patientDateTo, setPatientDateTo] = useState("");
  const [patientStatus, setPatientStatus] = useState("");
  const [patientMethod, setPatientMethod] = useState("");
  const [patientPage, setPatientPage] = useState(1);
  const [editPaymentRow, setEditPaymentRow] = useState<AdminPaymentData | null>(null);
  const [deletePaymentTarget, setDeletePaymentTarget] = useState<AdminPaymentData | null>(null);
  const [viewPaymentRow, setViewPaymentRow] = useState<AdminPaymentData | null>(null);

  const debouncedPatientSearch = useDebounce(patientSearch);
  const patientSort = useTableSort({ defaultColumn: "date" });
  const patientPageSize = 10;

  const {
    items: patientPayments,
    total: patientTotal,
    isLoading: patientLoading,
    deletePayment,
    updatePayment,
  } = useAdminPayments({
    search: debouncedPatientSearch,
    dateFrom: patientDateFrom,
    dateTo: patientDateTo,
    patientId: "",
    therapistId: "",
    status: patientStatus,
    method: patientMethod,
    sortBy: patientSort.sortBy,
    sortOrder: patientSort.sortOrder,
    page: patientPage,
    pageSize: patientPageSize,
  });

  const resetPatientFilters = useCallback(() => {
    setPatientSearch("");
    setPatientDateFrom("");
    setPatientDateTo("");
    setPatientStatus("");
    setPatientMethod("");
    setPatientPage(1);
  }, []);

  const patientFilterValues = useMemo(
    () => ({
      search: patientSearch,
      dateFrom: patientDateFrom,
      dateTo: patientDateTo,
      status: patientStatus,
      method: patientMethod,
    }),
    [patientSearch, patientDateFrom, patientDateTo, patientStatus, patientMethod],
  );

  const handlePatientFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setPatientSearch(value);
      else if (key === "dateFrom") setPatientDateFrom(value);
      else if (key === "dateTo") setPatientDateTo(value);
      else if (key === "status") setPatientStatus(value);
      else if (key === "method") setPatientMethod(value);
      setPatientPage(1);
    },
    [],
  );

  const handleDeletePayment = useCallback(async () => {
    if (!deletePaymentTarget) return;
    try {
      await deletePayment(deletePaymentTarget.id);
      toast.success(t("admin_dashboard.paymentRejected") ?? "Payment deleted");
      setDeletePaymentTarget(null);
    } catch {
      toast.error(t("common.tryAgain") ?? "Something went wrong");
    }
  }, [deletePaymentTarget, deletePayment, t]);

  const handleApprovePayment = useCallback(
    async (row: AdminPaymentData) => {
      try {
        await updatePayment(row.id, { status: "Paid" });
        toast.success(t("admin_dashboard.paymentApproved") ?? "Payment approved");
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [updatePayment, t],
  );

  const handleMarkAsPaidPayment = useCallback(
    async (row: AdminPaymentData) => {
      try {
        await updatePayment(row.id, { status: "Paid" });
        toast.success(t("admin_dashboard.paymentApproved") ?? "Marked as paid");
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [updatePayment, t],
  );

  const handleRefundPayment = useCallback(
    async (row: AdminPaymentData) => {
      try {
        await updatePayment(row.id, { status: "Refunded" });
        toast.success(t("admin_dashboard.paymentRejected") ?? "Payment refunded");
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [updatePayment, t],
  );

  const handleEditPaymentSave = useCallback(
    async (data: Partial<AdminPaymentData>) => {
      if (!editPaymentRow) return;
      try {
        await updatePayment(editPaymentRow.id, data);
        toast.success(t("admin_dashboard.saved") ?? "Saved");
        setEditPaymentRow(null);
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [editPaymentRow, updatePayment, t],
  );

  const patientColumns: Column<AdminPaymentData>[] = useMemo(
    () => [
      {
        key: "id",
        label: t("admin_dashboard.booking") ?? "Booking",
        sortable: true,
        render: (row) => <span className="font-mono text-xs text-secondary">#{row.id}</span>,
      },
      {
        key: "patient",
        label: t("admin_dashboard.patient") ?? "Patient",
        sortable: true,
        render: (row) => <span className="font-medium">{row.patient}</span>,
      },
      {
        key: "therapist",
        label: t("admin_dashboard.therapist") ?? "Therapist",
        render: (row) => <span className="text-text-light">{row.therapist}</span>,
      },
      {
        key: "amount",
        label: t("admin_dashboard.amount") ?? "Amount",
        sortable: true,
        render: (row) => <span>{npr(row.amount)}</span>,
      },
      {
        key: "method",
        label: t("admin_dashboard.method") ?? "Method",
        render: (row) => <span className="text-text-light">{row.method}</span>,
      },
      {
        key: "status",
        label: t("admin_dashboard.status") ?? "Status",
        sortable: true,
        render: (row) => <StatusChip status={row.status} />,
      },
      {
        key: "date",
        label: t("admin_dashboard.joined") ?? "Joined",
        sortable: true,
        render: (row) => <span className="text-text-light">{row.date}</span>,
      },
    ],
    [t],
  );

  const renderPaymentActions = useCallback(
    (row: AdminPaymentData) => {
      const actions = useRowActions({
        onEdit: () => setEditPaymentRow(row),
        onDelete: () => setDeletePaymentTarget(row),
        isActive: true,
        showDeactivate: false,
        showDelete: true,
      });

      actions.unshift({
        key: "view",
        label: t("admin_dashboard.view") ?? "View details",
        icon: <Eye size={14} />,
        onClick: () => setViewPaymentRow(row),
      });

      if (row.status === "Pending") {
        actions.unshift(
          {
            key: "markPaid",
            label: t("admin_dashboard.markAsPaid") ?? "Mark as paid",
            icon: <CreditCard size={14} />,
            onClick: () => handleMarkAsPaidPayment(row),
          },
          {
            key: "refund",
            label: t("admin_dashboard.refund") ?? "Refund",
            icon: <Ban size={14} />,
            variant: "destructive" as const,
            onClick: () => handleRefundPayment(row),
          },
        );
      }

      if (row.status === "Paid") {
        actions.unshift({
          key: "refund",
          label: t("admin_dashboard.refund") ?? "Refund",
          icon: <Ban size={14} />,
          variant: "destructive" as const,
          onClick: () => handleRefundPayment(row),
        });
      }

      return <ActionMenu actions={actions} />;
    },
    [handleApprovePayment, handleMarkAsPaidPayment, handleRefundPayment, t],
  );

  const patientFilterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "search",
        type: "search",
        label: t("admin_dashboard.patient") ?? "Patient",
        placeholder: t("admin_dashboard.searchPlaceholder") ?? "Search patient name...",
      },
      {
        key: "status",
        type: "select",
        label: t("admin_dashboard.status") ?? "Status",
        placeholder: "All statuses",
        options: [
          { value: "Paid", label: t("admin_dashboard.paid") ?? "Paid" },
          { value: "Pending", label: t("admin_dashboard.pending") ?? "Pending" },
          { value: "Refunded", label: t("admin_dashboard.refunded") ?? "Refunded" },
        ],
      },
      {
        key: "method",
        type: "select",
        label: t("admin_dashboard.method") ?? "Method",
        placeholder: "All methods",
        options: [
          { value: "eSewa", label: "eSewa" },
          { value: "Khalti", label: "Khalti" },
          { value: "Cash", label: "Cash" },
          { value: "Bank", label: "Bank" },
        ],
      },
      { key: "dateFrom", type: "date", label: t("admin_dashboard.joined") ?? "From date" },
      { key: "dateTo", type: "date", label: "To date" },
    ],
    [t],
  );

  // --- Therapist Payouts state ---
  const [payoutSearch, setPayoutSearch] = useState("");
  const [payoutDateFrom, setPayoutDateFrom] = useState("");
  const [payoutDateTo, setPayoutDateTo] = useState("");
  const [payoutStatus, setPayoutStatus] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutPage, setPayoutPage] = useState(1);
  const [editPayoutRow, setEditPayoutRow] = useState<AdminPayoutData | null>(null);
  const [deletePayoutTarget, setDeletePayoutTarget] = useState<AdminPayoutData | null>(null);
  const [viewPayoutRow, setViewPayoutRow] = useState<AdminPayoutData | null>(null);

  const debouncedPayoutSearch = useDebounce(payoutSearch);
  const payoutSort = useTableSort({ defaultColumn: "date" });
  const payoutPageSize = 10;

  const {
    items: therapistPayouts,
    total: payoutTotal,
    isLoading: payoutLoading,
    deletePayout,
    updatePayout,
  } = useAdminPayouts({
    search: debouncedPayoutSearch,
    dateFrom: payoutDateFrom,
    dateTo: payoutDateTo,
    therapistId: "",
    status: payoutStatus,
    method: payoutMethod,
    sortBy: payoutSort.sortBy,
    sortOrder: payoutSort.sortOrder,
    page: payoutPage,
    pageSize: payoutPageSize,
  });

  const resetPayoutFilters = useCallback(() => {
    setPayoutSearch("");
    setPayoutDateFrom("");
    setPayoutDateTo("");
    setPayoutStatus("");
    setPayoutMethod("");
    setPayoutPage(1);
  }, []);

  const payoutFilterValues = useMemo(
    () => ({
      search: payoutSearch,
      dateFrom: payoutDateFrom,
      dateTo: payoutDateTo,
      status: payoutStatus,
      method: payoutMethod,
    }),
    [payoutSearch, payoutDateFrom, payoutDateTo, payoutStatus, payoutMethod],
  );

  const handlePayoutFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setPayoutSearch(value);
      else if (key === "dateFrom") setPayoutDateFrom(value);
      else if (key === "dateTo") setPayoutDateTo(value);
      else if (key === "status") setPayoutStatus(value);
      else if (key === "method") setPayoutMethod(value);
      setPayoutPage(1);
    },
    [],
  );

  const handleDeletePayout = useCallback(async () => {
    if (!deletePayoutTarget) return;
    try {
      await deletePayout(deletePayoutTarget.id);
      toast.success(t("admin_dashboard.paymentRejected") ?? "Payout deleted");
      setDeletePayoutTarget(null);
    } catch {
      toast.error(t("common.tryAgain") ?? "Something went wrong");
    }
  }, [deletePayoutTarget, deletePayout, t]);

  const handleMarkAsPaidPayout = useCallback(
    async (row: AdminPayoutData) => {
      try {
        await updatePayout(row.id, { status: "Paid" });
        toast.success(t("admin_dashboard.paymentApproved") ?? "Marked as paid");
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [updatePayout, t],
  );

  const handleDisputePayout = useCallback(
    async (row: AdminPayoutData) => {
      try {
        await updatePayout(row.id, { status: "Pending" });
        toast.success(t("admin_dashboard.paymentRejected") ?? "Payout disputed");
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [updatePayout, t],
  );

  const handleEditPayoutSave = useCallback(
    async (data: Partial<AdminPayoutData>) => {
      if (!editPayoutRow) return;
      try {
        await updatePayout(editPayoutRow.id, data);
        toast.success(t("admin_dashboard.saved") ?? "Saved");
        setEditPayoutRow(null);
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [editPayoutRow, updatePayout, t],
  );

  const payoutColumns: Column<AdminPayoutData>[] = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        sortable: true,
        render: (row) => <span className="font-mono text-xs text-secondary">#{row.id}</span>,
      },
      {
        key: "therapist",
        label: t("admin_dashboard.therapist") ?? "Therapist",
        sortable: true,
        render: (row) => <span className="font-medium">{row.therapist}</span>,
      },
      {
        key: "amount",
        label: t("admin_dashboard.amount") ?? "Amount",
        sortable: true,
        render: (row) => <span>{npr(row.amount)}</span>,
      },
      {
        key: "sessionsCovered",
        label: t("admin_dashboard.sessions") ?? "Sessions",
        render: (row) => <span className="font-mono text-xs">{row.sessionsCovered}</span>,
      },
      {
        key: "method",
        label: t("admin_dashboard.method") ?? "Method",
        render: (row) => <span className="text-text-light">{row.method}</span>,
      },
      {
        key: "status",
        label: t("admin_dashboard.status") ?? "Status",
        sortable: true,
        render: (row) => <StatusChip status={row.status} />,
      },
      {
        key: "date",
        label: t("admin_dashboard.joined") ?? "Joined",
        sortable: true,
        render: (row) => <span className="text-text-light">{row.date}</span>,
      },
    ],
    [t],
  );

  const renderPayoutActions = useCallback(
    (row: AdminPayoutData) => {
      const actions = useRowActions({
        onEdit: () => setEditPayoutRow(row),
        onDelete: () => setDeletePayoutTarget(row),
        isActive: true,
        showDeactivate: false,
        showDelete: true,
      });

      actions.unshift({
        key: "view",
        label: t("admin_dashboard.view") ?? "View details",
        icon: <Eye size={14} />,
        onClick: () => setViewPayoutRow(row),
      });

      if (row.status !== "Paid") {
        actions.unshift({
          key: "markPaid",
          label: t("admin_dashboard.markAsPaid") ?? "Mark as paid",
          icon: <CreditCard size={14} />,
          onClick: () => handleMarkAsPaidPayout(row),
        });
      }

      if (row.status === "Paid") {
        actions.unshift({
          key: "dispute",
          label: t("admin_dashboard.dispute") ?? "Dispute",
          icon: <Ban size={14} />,
          variant: "destructive" as const,
          onClick: () => handleDisputePayout(row),
        });
      }

      return <ActionMenu actions={actions} />;
    },
    [handleMarkAsPaidPayout, handleDisputePayout, t],
  );

  const payoutFilterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "search",
        type: "search",
        label: t("admin_dashboard.therapist") ?? "Therapist",
        placeholder: t("admin_dashboard.searchTherapist") ?? "Search therapist name...",
      },
      {
        key: "status",
        type: "select",
        label: t("admin_dashboard.status") ?? "Status",
        placeholder: "All statuses",
        options: [
          { value: "Paid", label: t("admin_dashboard.paid") ?? "Paid" },
          { value: "Pending", label: t("admin_dashboard.pending") ?? "Pending" },
          { value: "Processing", label: t("admin_dashboard.processing") ?? "Processing" },
        ],
      },
      {
        key: "method",
        type: "select",
        label: t("admin_dashboard.method") ?? "Method",
        placeholder: "All methods",
        options: [
          { value: "Bank", label: "Bank" },
          { value: "Cash", label: "Cash" },
        ],
      },
      { key: "dateFrom", type: "date", label: t("admin_dashboard.joined") ?? "From date" },
      { key: "dateTo", type: "date", label: "To date" },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
      {/* Patient Transactions */}
      <div className="card-soft p-5">
        <h3 className="font-display text-xl mb-4">{t("admin_dashboard.patientTransactions") ?? "Patient Transactions"}</h3>

        <FilterBar
          filters={patientFilterConfig}
          values={patientFilterValues}
          onChange={handlePatientFilterChange}
          onClear={resetPatientFilters}
          expandable
        />

        <DataTable
          columns={patientColumns}
          data={patientPayments}
          total={patientTotal}
          isLoading={patientLoading}
          sortColumn={patientSort.sort.column}
          sortOrder={patientSort.sort.direction}
          onSortToggle={(col) => {
            patientSort.toggleSort(col);
            setPatientPage(1);
          }}
          page={patientPage}
          pageSize={patientPageSize}
          onPageChange={setPatientPage}
          renderActions={renderPaymentActions}
          emptyMessage={t("admin_dashboard.noTransactions") ?? "No transactions found"}
        />
      </div>

      {/* Therapist Payouts */}
      <div className="card-soft p-5">
        <h3 className="font-display text-xl mb-4">{t("admin_dashboard.pendingPayouts") ?? "Pending Payouts"}</h3>

        <FilterBar
          filters={payoutFilterConfig}
          values={payoutFilterValues}
          onChange={handlePayoutFilterChange}
          onClear={resetPayoutFilters}
          expandable
        />

        <DataTable
          columns={payoutColumns}
          data={therapistPayouts}
          total={payoutTotal}
          isLoading={payoutLoading}
          sortColumn={payoutSort.sort.column}
          sortOrder={payoutSort.sort.direction}
          onSortToggle={(col) => {
            payoutSort.toggleSort(col);
            setPayoutPage(1);
          }}
          page={payoutPage}
          pageSize={payoutPageSize}
          onPageChange={setPayoutPage}
          renderActions={renderPayoutActions}
          emptyMessage={t("admin_dashboard.noPayouts") ?? "No payouts found"}
        />
      </div>

      {/* View Payment Details */}
      {viewPaymentRow && (
        <ViewDetailsDialog
          title={t("admin_dashboard.paymentDetails") ?? "Payment Details"}
          onClose={() => setViewPaymentRow(null)}
          rows={[
            { label: t("admin_dashboard.booking") ?? "Booking ID", value: `#${viewPaymentRow.id}` },
            { label: t("admin_dashboard.patient") ?? "Patient", value: viewPaymentRow.patient },
            { label: t("admin_dashboard.therapist") ?? "Therapist", value: viewPaymentRow.therapist },
            { label: t("admin_dashboard.amount") ?? "Amount", value: npr(viewPaymentRow.amount) },
            { label: t("admin_dashboard.method") ?? "Method", value: viewPaymentRow.method },
            { label: t("admin_dashboard.status") ?? "Status", value: viewPaymentRow.status },
            { label: t("admin_dashboard.joined") ?? "Date", value: viewPaymentRow.date },
          ]}
        />
      )}

      {/* View Payout Details */}
      {viewPayoutRow && (
        <ViewDetailsDialog
          title={t("admin_dashboard.payoutDetails") ?? "Payout Details"}
          onClose={() => setViewPayoutRow(null)}
          rows={[
            { label: "ID", value: `#${viewPayoutRow.id}` },
            { label: t("admin_dashboard.therapist") ?? "Therapist", value: viewPayoutRow.therapist },
            { label: t("admin_dashboard.amount") ?? "Amount", value: npr(viewPayoutRow.amount) },
            { label: t("admin_dashboard.sessions") ?? "Sessions", value: String(viewPayoutRow.sessionsCovered) },
            { label: t("admin_dashboard.method") ?? "Method", value: viewPayoutRow.method },
            { label: t("admin_dashboard.status") ?? "Status", value: viewPayoutRow.status },
            { label: t("admin_dashboard.joined") ?? "Date", value: viewPayoutRow.date },
          ]}
        />
      )}

      {/* Edit Payment Dialog */}
      {editPaymentRow && (
        <EditPaymentDialog
          payment={editPaymentRow}
          onClose={() => setEditPaymentRow(null)}
          onSave={handleEditPaymentSave}
        />
      )}

      {/* Edit Payout Dialog */}
      {editPayoutRow && (
        <EditPayoutDialog
          payout={editPayoutRow}
          onClose={() => setEditPayoutRow(null)}
          onSave={handleEditPayoutSave}
        />
      )}

      {/* Delete Payment Confirm */}
      <ConfirmDialog
        open={!!deletePaymentTarget}
        onOpenChange={(open) => !open && setDeletePaymentTarget(null)}
        onConfirm={handleDeletePayment}
        title={t("common.delete") ?? "Delete payment"}
        description={`${t("common.confirm") ?? "Are you sure you want to delete"} ${deletePaymentTarget?.id ?? ""}?`}
      />

      {/* Delete Payout Confirm */}
      <ConfirmDialog
        open={!!deletePayoutTarget}
        onOpenChange={(open) => !open && setDeletePayoutTarget(null)}
        onConfirm={handleDeletePayout}
        title={t("common.delete") ?? "Delete payout"}
        description={`${t("common.confirm") ?? "Are you sure you want to delete"} ${deletePayoutTarget?.id ?? ""}?`}
      />
    </div>
  );
}

function ViewDetailsDialog({
  title,
  onClose,
  rows,
}: {
  title: string;
  onClose: () => void;
  rows: { label: string; value: string }[];
}) {
  const { t } = useLang();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg mb-4">{title}</h3>
        <div className="space-y-2.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
              <span className="text-xs font-mono text-text-light uppercase">{row.label}</span>
              <span className="text-sm font-medium">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer">
            {t("common.close") ?? "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditPaymentDialog({
  payment,
  onClose,
  onSave,
}: {
  payment: AdminPaymentData;
  onClose: () => void;
  onSave: (data: Partial<AdminPaymentData>) => Promise<void>;
}) {
  const { t } = useLang();
  const [amount, setAmount] = useState(payment.amount);
  const [method, setMethod] = useState(payment.method);
  const [status, setStatus] = useState(payment.status);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ amount, method: method as AdminPaymentData["method"], status: status as AdminPaymentData["status"] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg mb-4">{t("admin_dashboard.edit") ?? "Edit Payment"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.amount") ?? "Amount"}</label>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm" />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.method") ?? "Method"}</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as AdminPaymentData["method"])} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm">
              <option value="eSewa">eSewa</option>
              <option value="Khalti">Khalti</option>
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.status") ?? "Status"}</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as AdminPaymentData["status"])} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm">
              <option value="Paid">{t("admin_dashboard.paid") ?? "Paid"}</option>
              <option value="Pending">{t("admin_dashboard.pending") ?? "Pending"}</option>
              <option value="Refunded">{t("admin_dashboard.refunded") ?? "Refunded"}</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer">{t("common.cancel") ?? "Cancel"}</button>
            <button type="submit" disabled={saving} className="chip !bg-secondary !text-white cursor-pointer disabled:opacity-50">{saving ? t("common.loading") : (t("common.save") ?? "Save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPayoutDialog({
  payout,
  onClose,
  onSave,
}: {
  payout: AdminPayoutData;
  onClose: () => void;
  onSave: (data: Partial<AdminPayoutData>) => Promise<void>;
}) {
  const { t } = useLang();
  const [amount, setAmount] = useState(payout.amount);
  const [method, setMethod] = useState(payout.method);
  const [status, setStatus] = useState(payout.status);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ amount, method: method as AdminPayoutData["method"], status: status as AdminPayoutData["status"] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg mb-4">{t("admin_dashboard.edit") ?? "Edit Payout"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.amount") ?? "Amount"}</label>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm" />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.method") ?? "Method"}</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as AdminPayoutData["method"])} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm">
              <option value="Bank">Bank</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.status") ?? "Status"}</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as AdminPayoutData["status"])} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm">
              <option value="Paid">{t("admin_dashboard.paid") ?? "Paid"}</option>
              <option value="Pending">{t("admin_dashboard.pending") ?? "Pending"}</option>
              <option value="Processing">{t("admin_dashboard.processing") ?? "Processing"}</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer">{t("common.cancel") ?? "Cancel"}</button>
            <button type="submit" disabled={saving} className="chip !bg-secondary !text-white cursor-pointer disabled:opacity-50">{saving ? t("common.loading") : (t("common.save") ?? "Save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
