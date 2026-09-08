"use client";

import { useState, useCallback } from "react";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAdminPackages } from "@/hooks/useAdminPackages";
import { DashboardStat } from "@/components/dashboard/DashboardStat";
import { PackageFormDialog } from "@/components/admin/PackageFormDialog";
import { PurchaseDetailSheet } from "@/components/admin/PurchaseDetailSheet";
import { PackageAnalytics } from "@/components/admin/PackageAnalytics";
import { ConfirmDialog } from "@/components/tables/ConfirmDialog";
import { cn } from "@/utils/cn";
import { formatDate, npr } from "@/lib/format";
import type { AdminPackagePurchase, Package } from "@/types";

const TABS = ["packagesCatalog", "purchases", "analytics"] as const;
type Tab = (typeof TABS)[number];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-secondary/10 text-secondary",
  EXPIRED: "bg-muted text-text-light",
  DEPLETED: "bg-primary/15 text-primary",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export default function AdminPackagesPage() {
  const [tab, setTab] = useState<Tab>("packagesCatalog");
  const [addOpen, setAddOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<Package | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null);
  const [detail, setDetail] = useState<AdminPackagePurchase | null>(null);

  const { packages, purchases, stats, isLoading, refetch, deletePackage } = useAdminPackages();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePackage(deleteTarget.id);
      toast.success("Package deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete package");
    }
  };

  const renderTabLabel = useCallback(
    (key: Tab) => {
      if (key === "packagesCatalog") return `Packages (${packages.length})`;
      if (key === "purchases") return `Purchases (${purchases.length})`;
      return "Analytics";
    },
    [packages.length, purchases.length],
  );

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-xl">Package Management</h2>
            <p className="text-sm text-text-light mt-1">
              Prepaid session bundles — manage the catalog and track sales &amp; usage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="btn-outline !py-2 !px-3 text-xs cursor-pointer"
            >
              <RefreshCw size={14} className="inline mr-1" /> Refresh
            </button>
            {tab === "packagesCatalog" && (
              <button
                onClick={() => setAddOpen(true)}
                className="btn-primary !py-2 !px-3 text-xs cursor-pointer"
              >
                <Plus size={14} className="inline mr-1" /> Add Package
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="stats-grid mb-5">
          <DashboardStat
            label="Total Revenue"
            value={npr(stats.totalRevenue)}
            sub="From package purchases"
          />
          <DashboardStat
            label="Active Purchases"
            value={String(stats.activePurchases)}
            sub={`${stats.totalPurchases} total purchases`}
          />
          <DashboardStat
            label="Sessions via Packages"
            value={String(stats.sessionsDelivered)}
            sub="Sessions delivered"
          />
          <DashboardStat
            label="Most Popular"
            value={stats.mostPopularPackage ?? "—"}
            variant="amber"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface rounded-full mb-5 w-fit">
        {TABS.map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium transition",
              tab === key ? "bg-white text-secondary shadow-sm" : "text-text-light hover:text-text",
            )}
          >
            {renderTabLabel(key)}
          </button>
        ))}
      </div>

      {/* Tab: Catalog */}
      {tab === "packagesCatalog" && (
        <div className="card-soft overflow-hidden">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-surface rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface/50">
                    <th className="text-left px-4 py-3 font-medium text-xs text-text-light">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-text-light">Tag</th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-text-light">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-text-light">
                      Sessions
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-text-light">
                      Validity
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-xs text-text-light">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-xs text-text-light">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {packages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-text-light">
                        No packages yet. Click "Add Package" to create one.
                      </td>
                    </tr>
                  ) : (
                    packages.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-border last:border-0 hover:bg-surface/40 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-text">
                          <span className="mr-2">{p.featured ? "★" : ""}</span>
                          {p.name}
                        </td>
                        <td className="px-4 py-3 text-text-light">{p.tag}</td>
                        <td className="px-4 py-3 text-text-light">{npr(p.price)}</td>
                        <td className="px-4 py-3 text-text-light">{p.sessionCount}</td>
                        <td className="px-4 py-3 text-text-light">{p.validityDays} days</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                              p.isActive
                                ? "bg-secondary/10 text-secondary"
                                : "bg-destructive/10 text-destructive",
                            )}
                          >
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditPkg(p)}
                              className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition cursor-pointer"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(p)}
                              className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-destructive transition cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Purchases */}
      {tab === "purchases" && (
        <div className="card-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="text-left px-4 py-3 font-medium text-xs text-text-light">
                    Patient
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-xs text-text-light">
                    Package
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-xs text-text-light">
                    Purchased
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-xs text-text-light">Used</th>
                  <th className="text-left px-4 py-3 font-medium text-xs text-text-light">
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-xs text-text-light">
                    Expires
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-xs text-text-light">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-text-light">
                      No package purchases yet.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setDetail(p)}
                      className="border-b border-border last:border-0 hover:bg-surface/40 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium text-text">{p.patientName}</td>
                      <td className="px-4 py-3 text-text-light">{p.packageName}</td>
                      <td className="px-4 py-3 text-text-light">{formatDate(p.purchasedAt)}</td>
                      <td className="px-4 py-3 text-text-light">
                        {p.sessionsUsed} / {p.sessionsTotal}
                      </td>
                      <td className="px-4 py-3 text-text-light">{npr(p.amount)}</td>
                      <td className="px-4 py-3 text-text-light">{formatDate(p.expiresAt)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                            STATUS_STYLES[p.status] ?? "bg-surface text-text-light",
                          )}
                        >
                          {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Analytics */}
      {tab === "analytics" && <PackageAnalytics purchases={purchases} />}

      {/* Dialogs */}
      <PackageFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <PackageFormDialog
        open={!!editPkg}
        onOpenChange={(open) => !open && setEditPkg(null)}
        pkg={editPkg}
      />
      <PurchaseDetailSheet purchase={detail} onClose={() => setDetail(null)} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete package"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"? This action cannot be undone.`}
      />
    </div>
  );
}
