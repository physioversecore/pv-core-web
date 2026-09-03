"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck, ShieldOff, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EmptyTableRow } from "@/components/dashboard/EmptyTableRow";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { TherapistDetailSheet } from "@/components/modals/TherapistDetailSheet";
import { approveAdminTherapist, rejectAdminTherapist } from "@/services/api/admin";
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
  const queryClient = useQueryClient();
  const { pendingTherapists, pendingLoading, isRefetching, refetch } = useAdminDashboard();
  const [selected, setSelected] = useState<AdminTherapistData | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminTherapistData | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const refreshPending = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-dashboard-pending"] });
  };

  const verifyMutation = useMutation({
    mutationFn: (id: string) => approveAdminTherapist(id),
    onSuccess: () => {
      toast.success(t("admin_dashboard.therapistVerified"));
      refreshPending();
    },
    onError: () => toast.error("Verification failed. Please try again."),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => rejectAdminTherapist(id, note),
    onSuccess: () => {
      toast.success(t("admin_dashboard.applicationRejected"));
      setRejectTarget(null);
      setRejectNote("");
      refreshPending();
    },
    onError: () => toast.error("Failed to reject application. Please try again."),
  });

  if (pendingLoading) return <PendingApplicationsSkeleton />;

  const pending = pendingTherapists.filter((p) => p.status === "Under review");

  const confirmReject = () => {
    if (!rejectTarget) return;
    if (!rejectNote.trim()) {
      toast.error(t("admin_dashboard.reasonRequired"));
      return;
    }
    rejectMutation.mutate({ id: rejectTarget.id, note: rejectNote.trim() });
  };

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
              <th className="p-2">{t("admin_dashboard.actions")}</th>
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
                <td className="p-2">
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => verifyMutation.mutate(p.id)}
                      disabled={verifyMutation.isPending || rejectMutation.isPending}
                      className="btn-secondary !py-1 !px-2.5 text-[11px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title={t("admin_dashboard.verify")}
                    >
                      {verifyMutation.isPending && verifyMutation.variables === p.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <ShieldCheck size={12} />
                      )}
                      {t("admin_dashboard.verify")}
                    </button>
                    <button
                      onClick={() => {
                        setRejectTarget(p);
                        setRejectNote("");
                      }}
                      disabled={verifyMutation.isPending || rejectMutation.isPending}
                      className="btn-outline !py-1 !px-2.5 text-[11px] inline-flex items-center gap-1 !text-red-500 !border-red-500 hover:!bg-red-500 hover:!text-white cursor-pointer disabled:opacity-50"
                      title={t("admin_dashboard.reject")}
                    >
                      <ShieldOff size={12} />
                      {t("admin_dashboard.reject")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pending.length === 0 && <EmptyTableRow colSpan={6} message={t("admin_dashboard.noPending") ?? "No pending applications"} />}
          </tbody>
        </table>
      </div>

      <TherapistDetailSheet
        therapist={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {t("admin_dashboard.rejectApplication")}
            </DialogTitle>
            <DialogDescription>
              {t("admin_dashboard.rejectReasonHint")}
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={4}
            autoFocus
            placeholder={t("admin_dashboard.rejectReasonPlaceholder")}
            className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm resize-none"
          />
          {rejectNote.trim() && (
            <p className="text-[10px] text-text-light -mt-2">
              {t("admin_dashboard.reasonShared")}
            </p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setRejectTarget(null)}
              className="btn-outline !py-1.5 !px-3 text-xs cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={confirmReject}
              disabled={rejectMutation.isPending || !rejectNote.trim()}
              className="btn-outline !py-1.5 !px-3 text-xs !text-red-500 !border-red-500 hover:!bg-red-500 hover:!text-white cursor-pointer disabled:opacity-50"
            >
              {rejectMutation.isPending
                ? t("admin_dashboard.rejecting")
                : t("admin_dashboard.confirmReject")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
