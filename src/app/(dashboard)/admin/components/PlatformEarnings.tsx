"use client";

import { useLang } from "@/context/i18n";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

export function PlatformEarnings() {
  const { t } = useLang();
  const { earnings } = useAdminDashboard();

  const formatted = `Rs ${earnings.platformEarnings.toLocaleString()}`;

  return (
    <div className="card-soft p-5">
      <h3 className="font-display text-lg mb-3">{t("admin_dashboard.platformEarnings")}</h3>
      <div className="text-3xl font-display text-secondary">{formatted}</div>
      <p className="text-xs text-text-light mt-1">{earnings.description || t("admin_dashboard.platformFeeDesc")}</p>
    </div>
  );
}
