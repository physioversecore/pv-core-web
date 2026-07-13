"use client";

import { useState, useMemo, useCallback } from "react";
import { Avatar } from "@/components/Avatar";
import { Star, Download } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminTherapists } from "@/hooks/useAdminTherapists";
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
import type { AdminTherapistData } from "@/services/api/admin";

export default function AdminTherapists() {
  const { t } = useLang();

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [editRow, setEditRow] = useState<AdminTherapistData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminTherapistData | null>(null);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "name" });
  const pageSize = 10;

  const { items, total, isLoading, deleteTherapist, toggleTherapistStatus, updateTherapist } = useAdminTherapists({
    search: debouncedSearch,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const resetFilters = useCallback(() => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, []);

  const filterValues = useMemo(
    () => ({ search, dateFrom, dateTo }),
    [search, dateFrom, dateTo],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setSearch(value);
      else if (key === "dateFrom") setDateFrom(value);
      else if (key === "dateTo") setDateTo(value);
      setPage(1);
    },
    [],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteTherapist(deleteTarget.id);
      toast.success(t("admin_dashboard.statusUpdated") ?? "Therapist deleted");
      setDeleteTarget(null);
    } catch {
      toast.error(t("common.tryAgain") ?? "Something went wrong");
    }
  }, [deleteTarget, deleteTherapist, t]);

  const handleToggleStatus = useCallback(
    async (row: AdminTherapistData) => {
      const nextStatus: AdminTherapistData["status"] =
        row.status === "Under review" ? "Verified" : row.status === "Verified" ? "Suspended" : "Verified";
      try {
        await toggleTherapistStatus(row.id, nextStatus);
        toast.success(t("admin_dashboard.statusUpdated") ?? "Status updated");
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [toggleTherapistStatus, t],
  );

  const handleEditSave = useCallback(
    async (data: Partial<AdminTherapistData>) => {
      if (!editRow) return;
      try {
        await updateTherapist(editRow.id, data);
        toast.success(t("admin_dashboard.saved") ?? "Saved");
        setEditRow(null);
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [editRow, updateTherapist, t],
  );

  const exportCsv = useCallback(() => {
    const header = "Name,City,Specialty,Rating,Sessions,Status\n";
    const body = items
      .map((r) => `${r.name},${r.city},${r.specialty},${r.rating},${r.sessions},${r.status}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "therapists.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("admin_dashboard.exportedCsv") ?? "Exported CSV");
  }, [items, t]);

  const columns: Column<AdminTherapistData>[] = useMemo(
    () => [
      {
        key: "name",
        label: t("admin_dashboard.name") ?? "Name",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2">
            <Avatar name={row.name} size={28} />
            <span className="font-medium">{row.name}</span>
          </div>
        ),
      },
      {
        key: "city",
        label: t("admin_dashboard.city") ?? "City",
        render: (row) => <span className="text-text-light">{row.city}</span>,
      },
      {
        key: "specialty",
        label: t("admin_dashboard.specialty") ?? "Specialty",
        render: (row) => <span className="text-text-light">{row.specialty}</span>,
      },
      {
        key: "rating",
        label: t("admin_dashboard.rating") ?? "Rating",
        sortable: true,
        render: (row) => (
          <span className="inline-flex items-center gap-1 text-primary">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={11} className={n <= Math.round(row.rating) ? "fill-primary text-primary" : "text-border"} />
            ))}
            <span className="ml-1 text-text font-mono text-xs">{row.rating}</span>
          </span>
        ),
      },
      {
        key: "sessions",
        label: t("admin_dashboard.sessions") ?? "Sessions",
        render: (row) => <span className="font-mono text-xs">{row.sessions}</span>,
      },
      {
        key: "status",
        label: t("admin_dashboard.status") ?? "Status",
        render: (row) => <StatusChip status={row.status} />,
      },
    ],
    [t],
  );

  const renderActions = useCallback(
    (row: AdminTherapistData) => {
      const actions = useRowActions({
        onEdit: () => setEditRow(row),
        onDelete: () => setDeleteTarget(row),
        onToggleActive: row.status === "Under review"
          ? () => handleToggleStatus(row)
          : row.status === "Verified"
            ? () => handleToggleStatus(row)
            : () => handleToggleStatus(row),
        isActive: row.status === "Verified",
        showDeactivate: true,
        showDelete: true,
      });
      return <ActionMenu actions={actions} />;
    },
    [handleToggleStatus],
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "search",
        type: "search",
        label: t("admin_dashboard.name") ?? "Name",
        placeholder: t("admin_dashboard.searchTherapist") ?? "Search therapist...",
      },
      { key: "dateFrom", type: "date", label: t("admin_dashboard.joined") ?? "From date" },
      { key: "dateTo", type: "date", label: "To date" },
    ],
    [t],
  );

  return (
    <div>
      <div className="card-soft p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="font-display text-xl">{t("admin_dashboard.allTherapists") ?? "All Therapists"}</h3>
          <button onClick={exportCsv} className="btn-outline !py-2 !px-3 text-xs cursor-pointer">
            <Download size={14} className="inline mr-1" /> {t("admin_dashboard.exportCsv") ?? "Export CSV"}
          </button>
        </div>

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
          emptyMessage={t("common.noResults") ?? "No results found"}
        />
      </div>

      {editRow && (
        <EditTherapistDialog
          therapist={editRow}
          onClose={() => setEditRow(null)}
          onSave={handleEditSave}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t("common.delete") ?? "Delete therapist"}
        description={`${t("common.confirm") ?? "Are you sure you want to delete"} ${deleteTarget?.name ?? ""}?`}
      />
    </div>
  );
}

function EditTherapistDialog({
  therapist,
  onClose,
  onSave,
}: {
  therapist: AdminTherapistData;
  onClose: () => void;
  onSave: (data: Partial<AdminTherapistData>) => Promise<void>;
}) {
  const { t } = useLang();
  const [name, setName] = useState(therapist.name);
  const [city, setCity] = useState(therapist.city);
  const [specialty, setSpecialty] = useState(therapist.specialty);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ name, city, specialty });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg mb-4">{t("admin_dashboard.edit") ?? "Edit Therapist"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.name") ?? "Name"}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm" />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.city") ?? "City"}</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm" />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.specialty") ?? "Specialty"}</label>
            <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm" />
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
