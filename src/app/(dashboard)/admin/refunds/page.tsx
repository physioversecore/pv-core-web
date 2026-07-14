"use client";

import { useState, useMemo, useCallback } from "react";
import { npr } from "@/lib/cart";
import { Eye, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminRefunds } from "@/hooks/useAdminRefunds";
import { DashboardStat } from "@/components/dashboard";
import {
  DataTable,
  ActionMenu,
  useRowActions,
  ConfirmDialog,
  FilterBar,
  StatusChip,
  type Column,
  type FilterConfig,
  type StatusType,
} from "@/components/tables";

export default function AdminRefunds() {
  const { t } = useLang();

  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [viewRow, setViewRow] = useState<RefundRow | null>(null);
  const [denyTarget, setDenyTarget] = useState<RefundRow | null>(null);
  const [denyReason, setDenyReason] = useState("");
  const [denySaving, setDenySaving] = useState(false);

  const debouncedSearch = useDebounce(search);
  const sort = useTableSort({ defaultColumn: "filed" });
  const pageSize = 10;

  const {
    items,
    total,
    isLoading,
    approveRefund,
    denyRefund,
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
      const actions: ReturnType<typeof useRowActions> = [];

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
            variant: "destructive" as const,
            onClick: () => setDenyTarget(row),
          },
        );
      } else {
        actions.push({
          key: "view",
          label: t("admin_dashboard.view") ?? "View details",
          icon: <Eye size={14} />,
          onClick: () => setViewRow(row),
        });
      }

      return <ActionMenu actions={actions} />;
    },
    [handleApprove, t],
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
      <div>
        <h2 className="font-display text-2xl">Refunds &amp; Disputes</h2>
        <p className="text-sm text-text-light mt-1">
          Money-back cases — separate from Complaints, since not every refund starts as one.
        </p>
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
};
