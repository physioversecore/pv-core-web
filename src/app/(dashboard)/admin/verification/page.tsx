"use client";

import { useState, useMemo, useCallback } from "react";
import { Check, X, Send, Ban, Eye } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminVerifications } from "@/hooks/useAdminVerifications";
import { DashboardStat } from "@/components/dashboard/DashboardStat";
import {
  DataTable,
  FilterBar,
  StatusChip,
  type Column,
  type FilterConfig,
} from "@/components/tables";
import type { AdminVerificationData } from "@/services/api/admin";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function VerificationPage() {
  const [search, setSearch] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reviewRow, setReviewRow] = useState<AdminVerificationData | null>(null);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "therapist" });
  const pageSize = 10;

  const { items, total, isLoading, approveVerif, rejectVerif } = useAdminVerifications({
    search: debouncedSearch,
    documentType,
    status,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const resetFilters = useCallback(() => {
    setSearch("");
    setDocumentType("");
    setStatus("");
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
        render: (row) => <span className="text-text-light">{row.documentType}</span>,
      },
      {
        key: "uploaded",
        label: "Uploaded",
        sortable: true,
        render: (row) => (
          <span className="font-mono text-xs text-text-light">{formatDate(row.uploaded)}</span>
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
        key: "status",
        label: "Status",
        render: (row) => <StatusChip status={row.status} />,
      },
    ],
    [],
  );

  const renderActions = useCallback(
    (row: AdminVerificationData) => (
      <div className="flex items-center justify-end gap-1">
        {row.status === "Pending review" ? (
          <>
            <button
              onClick={() => setReviewRow(row)}
              className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition cursor-pointer"
              title="Review"
            >
              <Eye size={15} />
            </button>
            <button
              onClick={() => approveVerif(row.id)}
              className="p-1.5 rounded-lg hover:bg-success/10 text-success transition cursor-pointer"
              title="Approve"
            >
              <Check size={15} />
            </button>
          </>
        ) : row.status === "Expiring soon" ? (
          <button
            className="chip !bg-primary/15 !text-primary cursor-pointer !text-[0.6rem]"
            title="Send reminder"
          >
            <Send size={11} className="inline mr-1" /> Remind
          </button>
        ) : row.status === "Expired" ? (
          <button
            className="chip !bg-destructive/10 !text-destructive cursor-pointer !text-[0.6rem]"
            title="Suspend bookings"
          >
            <Ban size={11} className="inline mr-1" /> Suspend
          </button>
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
    [approveVerif],
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      { key: "search", type: "search", label: "Therapist", placeholder: "Search therapist…" },
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
          License, ID, and certificate checks — no one takes a home visit unverified.
        </p>
      </div>

      <div className="stats-grid">
        <DashboardStat label="Pending review" value="3" sub="Needs a decision" variant="amber" />
        <DashboardStat label="Verified this month" value="4" sub="All documents current" />
        <DashboardStat label="Expiring in 30 days" value="2" sub="License renewal due" variant="amber" />
        <DashboardStat label="Expired / rejected" value="1" sub="Suspended from bookings" />
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
            row.status === "Expiring soon" || row.status === "Expired"
              ? "bg-primary/5"
              : undefined
          }
          emptyMessage="No verification records found"
        />
      </div>

      {reviewRow && (
        <ReviewDrawer verification={reviewRow} onClose={() => setReviewRow(null)} onApprove={() => { approveVerif(reviewRow.id); setReviewRow(null); }} />
      )}
    </div>
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
          <SheetDescription>{verification.therapist} · {verification.documentType}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-3">
            <StatusChip status={verification.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">Uploaded</span>
              <span className="font-mono text-xs">{formatDate(verification.uploaded)}</span>
            </div>
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">Expires</span>
              <span className="font-mono text-xs">{verification.expires ? formatDate(verification.expires) : "No expiry"}</span>
            </div>
          </div>
          <div className="bg-surface rounded-xl p-8 text-center text-text-muted text-sm">
            Document preview area
          </div>
          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">Rejection note (required on reject)</label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm min-h-[80px]"
              placeholder="Reason for rejection…"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={onApprove} className="chip !bg-success !text-white cursor-pointer">
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
