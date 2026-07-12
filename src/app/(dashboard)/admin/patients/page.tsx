"use client";

import { useState, useMemo, useCallback } from "react";
import { Avatar } from "@/components/Avatar";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminPatients } from "@/hooks/useAdminPatients";
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
import type { AdminPatientData } from "@/services/api/admin";

export default function AdminPatients() {
  const { t } = useLang();

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [editRow, setEditRow] = useState<AdminPatientData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPatientData | null>(null);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "name" });
  const pageSize = 10;

  const { items, total, isLoading, deletePatient, togglePatientStatus, updatePatient } = useAdminPatients({
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
      await deletePatient(deleteTarget.id);
      toast.success(t("admin_dashboard.patientDeactivated") ?? "Patient deleted");
      setDeleteTarget(null);
    } catch {
      toast.error(t("common.tryAgain") ?? "Something went wrong");
    }
  }, [deleteTarget, deletePatient, t]);

  const handleToggleActive = useCallback(
    async (row: AdminPatientData) => {
      try {
        await togglePatientStatus(row.id, !row.isActive);
        toast.success(
          row.isActive
            ? (t("admin_dashboard.patientDeactivated") ?? "Patient deactivated")
            : (t("admin_dashboard.patientDeactivated") ?? "Patient activated"),
        );
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [togglePatientStatus, t],
  );

  const handleEditSave = useCallback(
    async (data: Partial<AdminPatientData>) => {
      if (!editRow) return;
      try {
        await updatePatient(editRow.id, data);
        toast.success(t("admin_dashboard.saved") ?? "Saved");
        setEditRow(null);
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [editRow, updatePatient, t],
  );

  const columns: Column<AdminPatientData>[] = useMemo(
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
        key: "sessions",
        label: t("admin_dashboard.sessions") ?? "Sessions",
        render: (row) => <span className="font-mono text-xs">{row.sessions}</span>,
      },
      {
        key: "therapist",
        label: t("admin_dashboard.therapist") ?? "Therapist",
        render: (row) => <span className="text-text-light">{row.therapist}</span>,
      },
      {
        key: "joined",
        label: t("admin_dashboard.joined") ?? "Joined",
        sortable: true,
        render: (row) => <span className="text-text-light">{row.joined}</span>,
      },
      {
        key: "isActive",
        label: t("admin_dashboard.status") ?? "Status",
        render: (row) => <StatusChip status={row.isActive ? "Active" : "Inactive"} />,
      },
    ],
    [t],
  );

  const renderActions = useCallback(
    (row: AdminPatientData) => {
      const actions = useRowActions({
        onEdit: () => setEditRow(row),
        onDelete: () => setDeleteTarget(row),
        onToggleActive: () => handleToggleActive(row),
        isActive: row.isActive,
        showDeactivate: true,
        showDelete: true,
      });
      return <ActionMenu actions={actions} />;
    },
    [handleToggleActive],
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "search",
        type: "search",
        label: t("admin_dashboard.name") ?? "Name",
        placeholder: t("admin_dashboard.searchPatient") ?? "Search patient...",
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
          <h3 className="font-display text-xl">{t("admin_dashboard.allPatients") ?? "All Patients"}</h3>
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
        <EditPatientDialog
          patient={editRow}
          onClose={() => setEditRow(null)}
          onSave={handleEditSave}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t("common.delete") ?? "Delete patient"}
        description={`${t("common.confirm") ?? "Are you sure you want to delete"} ${deleteTarget?.name ?? ""}?`}
      />
    </div>
  );
}

function EditPatientDialog({
  patient,
  onClose,
  onSave,
}: {
  patient: AdminPatientData;
  onClose: () => void;
  onSave: (data: Partial<AdminPatientData>) => Promise<void>;
}) {
  const { t } = useLang();
  const [name, setName] = useState(patient.name);
  const [city, setCity] = useState(patient.city);
  const [phone, setPhone] = useState(patient.phone ?? "");
  const [email, setEmail] = useState(patient.email ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ name, city, phone, email });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg mb-4">{t("admin_dashboard.edit") ?? "Edit Patient"}</h3>
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
            <label className="text-xs font-mono text-text-light uppercase">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm" />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm" />
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
