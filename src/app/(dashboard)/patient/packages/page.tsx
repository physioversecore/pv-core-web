"use client";

import { useRouter } from "next/navigation";
import { Package, ShoppingBag, CalendarDays, ArrowRight } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { PackageCard } from "@/components/dashboard/PackageCard";
import { PurchaseHistoryTable } from "@/components/dashboard/PurchaseHistoryTable";
import { useActivePackage } from "@/hooks/useActivePackage";
import { useMyPackages } from "@/hooks/useMyPackages";
import { useLang } from "@/context/i18n";

function PackagesContent() {
  const { t } = useLang();
  const router = useRouter();
  const { activePackage, isLoading } = useActivePackage();
  const { purchases, isLoading: historyLoading, refetch, isRefetching } = useMyPackages();

  const activeLoad = isLoading;
  const hasActive =
    !!activePackage && activePackage.status === "ACTIVE" && activePackage.sessionsRemaining > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">
            {t("packages.myPackages")}
          </h1>
          <p className="text-sm text-text-light mt-1">{t("packages.subtitle")}</p>
        </div>
        <RefreshButton onRefresh={refetch} isRefreshing={isRefetching} />
      </div>

      {/* Active package */}
      <div className="mb-8">
        {activeLoad ? (
          <div className="h-48 rounded-2xl bg-surface animate-pulse" />
        ) : hasActive ? (
          <PackageCard activePackage={activePackage} />
        ) : (
          !historyLoading &&
          purchases.length === 0 && (
            <div className="card-soft p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 grid place-items-center mx-auto mb-4">
                <Package size={28} className="text-secondary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-text mb-2">
                {t("packages.noPackages")}
              </h3>
              <p className="text-sm text-text-light mb-6 max-w-md mx-auto">
                {t("packages.noPackagesDesc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push("/packages")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-white font-semibold text-sm hover:bg-secondary/90 transition-all"
                >
                  <ShoppingBag size={16} />
                  {t("packages.browsePackages")}
                </button>
                <button
                  onClick={() => router.push("/find-a-therapist")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-text-light hover:bg-surface transition-all"
                >
                  <CalendarDays size={16} />
                  {t("packages.bookSingleSession")}
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Past / history packages */}
      {!activeLoad && purchases.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-text">
              {t("packages.purchaseHistory")}
            </h2>
          </div>
          <PurchaseHistoryTable purchases={purchases} />
        </div>
      )}

      {/* Browse more CTA */}
      {hasActive && (
        <div className="mt-8">
          <button
            onClick={() => router.push("/packages")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
          >
            {t("packages.viewAllPackages")}
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function PatientPackagesPage() {
  return (
    <ErrorBoundary>
      <PackagesContent />
    </ErrorBoundary>
  );
}
