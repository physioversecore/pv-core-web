"use client";

import { useState, useMemo, useCallback } from "react";
import { Avatar } from "@/components/Avatar";
import { Download, Pencil, Trash2, ShieldCheck, ShieldOff, Filter } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminPatients } from "@/hooks/useAdminPatients";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { PatientDetailSheet } from "@/components/modals/PatientDetailSheet";
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
  const [sheetRow, setSheetRow] = useState<AdminPatientData | null>(null);
  const [sheetMode, setSheetMode] = useState<"view" | "edit">("view");
  const [deleteTarget, setDeleteTarget] = useState<AdminPatientData | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "name" });
  const pageSize = 10;

  const { items, total, isLoading, isRefetching, error, refetch, deletePatient, togglePatientStatus, updatePatient } = useAdminPatients({
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
      if (!sheetRow) return;
      try {
        await updatePatient(sheetRow.id, data);
        toast.success(t("admin_dashboard.saved") ?? "Saved");
        setSheetRow(null);
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [sheetRow, updatePatient, t],
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
          onClick: () => { setSheetRow(row); setSheetMode("edit"); },
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
            <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
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
          onRowClick={(row) => { setSheetRow(row); setSheetMode("view"); }}
          emptyMessage={t("common.noResults") ?? "No results found"}
        />
      </div>

      <PatientDetailSheet
        patient={sheetRow}
        open={!!sheetRow}
        onOpenChange={(open) => !open && setSheetRow(null)}
        mode={sheetMode}
        onSave={sheetMode === "edit" ? handleEditSave : undefined}
      />

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
