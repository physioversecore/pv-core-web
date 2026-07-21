"use client";

import { useState, useMemo, useCallback } from "react";
import { Avatar } from "@/components/Avatar";
import { Download, Pencil, Trash2, ShieldCheck, ShieldOff, Filter } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminPatients } from "@/hooks/useAdminPatients";
import {
  DataTable,
  ActionMenu,
  ConfirmDialog,
  FilterBar,
  StatusChip,
  type Column,
  type FilterConfig,
  type ActionItem,
} from "@/components/tables";
import type { AdminPatientData } from "@/services/api/admin";

export default function AdminPatients() {
  const { t } = useLang();

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [editRow, setEditRow] = useState<AdminPatientData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPatientData | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "name" });
  const pageSize = 10;

  const { items, total, isLoading, error, refetch, deletePatient, togglePatientStatus, updatePatient } = useAdminPatients({
    search: debouncedSearch,
    dateFrom,
    dateTo,
    status,
    city,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const resetFilters = useCallback(() => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setStatus("");
    setCity("");
    setPage(1);
  }, []);

  const filterValues = useMemo(
    () => ({ search, dateFrom, dateTo, status, city }),
    [search, dateFrom, dateTo, status, city],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setSearch(value);
      else if (key === "dateFrom") setDateFrom(value);
      else if (key === "dateTo") setDateTo(value);
      else if (key === "status") setStatus(value);
      else if (key === "city") setCity(value);
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

  const exportCsv = useCallback(() => {
    const header = "Name,City,Sessions,Therapist,Joined,Status,Phone,Email\n";
    const body = items
      .map(
        (r) =>
          `${r.name},${r.city},${r.sessions},${r.therapist},${r.joined},${r.isActive ? "Active" : "Inactive"},${r.phone ?? ""},${r.email ?? ""}`,
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patients.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("admin_dashboard.exportedCsv") ?? "Exported CSV");
  }, [items, t]);

  const columns: Column<AdminPatientData>[] = useMemo(
    () => [
      {
        key: "name",
        label: t("admin_dashboard.name") ?? "Name",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2">
            <Avatar name={row.name} size={28} />
            <div className="flex flex-col">
              <span className="font-medium">{row.name}</span>
              {row.email && <span className="text-xs text-text-light">{row.email}</span>}
            </div>
          </div>
        ),
      },
      {
        key: "city",
        label: t("admin_dashboard.city") ?? "City",
        sortable: true,
        render: (row) => <span className="text-text-light">{row.city}</span>,
      },
      {
        key: "sessions",
        label: t("admin_dashboard.sessions") ?? "Sessions",
        sortable: true,
        render: (row) => <span className="font-mono text-xs">{row.sessions}</span>,
      },
      {
        key: "therapist",
        label: t("admin_dashboard.therapist") ?? "Therapist",
        sortable: true,
        render: (row) => <span className="text-text-light">{row.therapist}</span>,
      },
      {
        key: "joined",
        label: t("admin_dashboard.joined") ?? "Joined",
        sortable: true,
        render: (row) => <span className="text-text-light text-xs">{row.joined}</span>,
      },
      {
        key: "isActive",
        label: t("admin_dashboard.status") ?? "Status",
        sortable: true,
        render: (row) => <StatusChip status={row.isActive ? "Active" : "Inactive"} />,
      },
    ],
    [t],
  );

  const renderActions = useCallback(
    (row: AdminPatientData) => {
      const actions: ActionItem[] = [
        {
          key: "edit",
          label: t("admin_dashboard.edit") ?? "Edit",
          icon: <Pencil size={14} />,
          onClick: () => setEditRow(row),
        },
        {
          key: "toggle",
          label: row.isActive
            ? (t("admin_dashboard.deactivate") ?? "Deactivate")
            : (t("admin_dashboard.activate") ?? "Activate"),
          icon: row.isActive ? <ShieldOff size={14} /> : <ShieldCheck size={14} />,
          onClick: () => handleToggleActive(row),
        },
        {
          key: "delete",
          label: t("admin_dashboard.delete") ?? "Delete",
          icon: <Trash2 size={14} />,
          variant: "destructive",
          onClick: () => setDeleteTarget(row),
        },
      ];
      return <ActionMenu actions={actions} />;
    },
    [handleToggleActive, t],
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
      {
        key: "status",
        type: "select",
        label: t("admin_dashboard.status") ?? "Status",
        placeholder: t("admin_dashboard.allStatuses") ?? "All statuses",
        options: [
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Inactive" },
        ],
      },
      {
        key: "city",
        type: "select",
        label: t("admin_dashboard.city") ?? "City",
        placeholder: t("admin_dashboard.allCities") ?? "All cities",
        options: [
          { value: "Kathmandu", label: "Kathmandu" },
          { value: "Lalitpur", label: "Lalitpur" },
          { value: "Bhaktapur", label: "Bhaktapur" },
          { value: "Pokhara", label: "Pokhara" },
        ],
      },
    ],
    [t],
  );

  return (
    <div>
      <div className="card-soft p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="font-display text-xl">{t("admin_dashboard.allPatients") ?? "All Patients"}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline !py-2 !px-3 text-xs cursor-pointer ${showFilters ? "!bg-secondary !text-white" : ""}`}
            >
              <Filter size={14} className="inline mr-1" /> Filter
            </button>
            <button onClick={exportCsv} className="btn-outline !py-2 !px-3 text-xs cursor-pointer">
              <Download size={14} className="inline mr-1" /> {t("admin_dashboard.exportCsv") ?? "Export CSV"}
            </button>
          </div>
        </div>

        {showFilters && (
          <FilterBar
            filters={filterConfig}
            values={filterValues}
            onChange={handleFilterChange}
            onClear={resetFilters}
          />
        )}

        <DataTable
          columns={columns}
          data={items}
          total={total}
          isLoading={isLoading}
          error={error}
          onRetry={() => refetch()}
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
  const [isActive, setIsActive] = useState(patient.isActive);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ name, city, phone, email, isActive });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg mb-4">{t("admin_dashboard.edit") ?? "Edit Patient"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.name") ?? "Name"}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.city") ?? "City"}</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.phone") ?? "Phone"}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.email") ?? "Email"}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.status") ?? "Status"}</label>
            <select
              value={isActive ? "Active" : "Inactive"}
              onChange={(e) => setIsActive(e.target.value === "Active")}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer">
              {t("common.cancel") ?? "Cancel"}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="chip !bg-secondary !text-white cursor-pointer disabled:opacity-50"
            >
              {saving ? t("common.loading") : (t("common.save") ?? "Save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
