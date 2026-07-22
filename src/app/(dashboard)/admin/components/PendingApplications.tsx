"use client";

import { useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { EmptyTableRow } from "@/components/dashboard/EmptyTableRow";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/context/i18n";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { TherapistDetailSheet } from "@/components/modals/TherapistDetailSheet";
import type { AdminTherapistData } from "@/services/api/admin";

function PendingApplicationsSkeleton() {
  return (
    <div className="card-soft p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PendingApplications() {
  const { t } = useLang();
  const { pendingTherapists, pendingLoading, isRefetching, refetch } = useAdminDashboard();
  const [selected, setSelected] = useState<AdminTherapistData | null>(null);

  if (pendingLoading) return <PendingApplicationsSkeleton />;

  const pending = pendingTherapists.filter((p) => p.status === "Under review");

  return (
    <div className="card-soft p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg">{t("admin_dashboard.pendingApplications")}</h3>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
          <Link
            href="/admin/therapists?status=Under+review"
            className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1.5"
          >
            <Users size={13} />
            {t("admin_dashboard.viewAll" as any) ?? "View All"}
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-xs uppercase font-mono text-text-light text-left">
            <tr>
              <th className="p-2">{t("admin_dashboard.name")}</th>
              <th className="p-2">{t("admin_dashboard.specialty")}</th>
              <th className="p-2">{t("admin_dashboard.applied")}</th>
              <th className="p-2">{t("admin_dashboard.city")}</th>
              <th className="p-2">{t("admin_dashboard.joined")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pending.map((p) => (
              <tr
                key={p.id}
                onClick={() => setSelected(p)}
                className="cursor-pointer hover:bg-surface/60 transition-colors"
              >
                <td className="p-2 font-medium">{p.name}</td>
                <td className="p-2 text-text-light">{p.specialty}</td>
                <td className="p-2 text-text-light">{p.status}</td>
                <td className="p-2 text-text-light">{p.city}</td>
                <td className="p-2 text-text-light">{p.joined}</td>
              </tr>
            ))}
            {pending.length === 0 && <EmptyTableRow colSpan={5} message={t("admin_dashboard.noPending") ?? "No pending applications"} />}
          </tbody>
        </table>
      </div>

      <TherapistDetailSheet
        therapist={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
