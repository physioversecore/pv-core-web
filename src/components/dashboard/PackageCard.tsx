"use client";

import { useRouter } from "next/navigation";
import { Package, Clock, CalendarDays, ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDate } from "@/lib/format";
import { useLang } from "@/context/i18n";
import type { PackagePurchaseDetail } from "@/types";

interface PackageCardProps {
  activePackage: PackagePurchaseDetail;
}

export function PackageCard({ activePackage }: PackageCardProps) {
  const { t } = useLang();
  const router = useRouter();

  const progress =
    activePackage.sessionsTotal > 0
      ? (activePackage.sessionsUsed / activePackage.sessionsTotal) * 100
      : 0;

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(activePackage.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;

  return (
    <div className="card-soft p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary/10 grid place-items-center">
            <Package size={22} className="text-secondary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-text">
              {activePackage.packageName}
            </h3>
            <p className="text-xs text-text-light">{activePackage.packageTag}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-success/10 text-success px-2.5 py-1 rounded-full">
          {t("packages.active")}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-text-light mb-1.5">
          <span>
            {t("packages.sessionsUsed")
              .replace("{used}", String(activePackage.sessionsUsed))
              .replace("{total}", String(activePackage.sessionsTotal))}
          </span>
          <span className="font-semibold text-text">
            {activePackage.sessionsRemaining} {t("packages.remaining")}
          </span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full transition-all duration-500"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 mb-5 text-xs text-text-light">
        <div
          className={cn(
            "flex items-center gap-1",
            isExpiringSoon && "text-amber-600 font-semibold",
          )}
        >
          <Clock size={13} className="shrink-0" />
          {daysLeft > 0
            ? t("packages.expires").replace("{days}", String(daysLeft))
            : t("packages.expired")}
        </div>
        <div className="flex items-center gap-1">
          <CalendarDays size={13} className="shrink-0" />
          {t("packages.purchasedOn").replace("{date}", formatDate(activePackage.purchasedAt))}
        </div>
      </div>

      <button
        onClick={() => router.push("/patient/sessions")}
        className="w-full py-2.5 rounded-xl bg-secondary text-white font-semibold text-sm hover:bg-secondary/90 transition-all flex items-center justify-center gap-2"
      >
        {t("packages.bookSession")}
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
