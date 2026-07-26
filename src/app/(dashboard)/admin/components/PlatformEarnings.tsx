"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/context/i18n";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

function PlatformEarningsSkeleton() {
  return (
    <div className="card-soft p-5">
      <Skeleton className="h-5 w-36 mb-3" />
      <Skeleton className="h-9 w-40 mb-1" />
      <Skeleton className="h-3 w-56" />
    </div>
  );
}

export function PlatformEarnings() {
  const { t } = useLang();
  const { earnings, earningsLoading } = useAdminDashboard();

  if (earningsLoading || !earnings) return <PlatformEarningsSkeleton />;

  const formatted = `Rs ${earnings.platformEarnings.toLocaleString()}`;

  return (
    <div className="card-soft p-5">
      <h3 className="font-display text-lg mb-3">{t("admin_dashboard.platformEarnings")}</h3>
      <div className="text-3xl font-display text-secondary">{formatted}</div>
      <p className="text-xs text-text-light mt-1">{earnings.description || t("admin_dashboard.platformFeeDesc")}</p>
    </div>
  );
}
