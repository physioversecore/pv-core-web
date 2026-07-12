"use client";

import { cn } from "@/lib/utils";
import { useLang } from "@/context/i18n";

type StatusType = "Paid" | "Pending" | "Refunded" | "Processing" | "Verified" | "Under review" | "Suspended" | "Active" | "Inactive";

const STATUS_STYLES: Record<string, string> = {
  "Paid": "!bg-secondary/10 !text-secondary",
  "Pending": "!bg-primary/15 !text-primary",
  "Refunded": "!bg-destructive/10 !text-destructive",
  "Processing": "!bg-primary/15 !text-primary",
  "Verified": "!bg-secondary/10 !text-secondary",
  "Under review": "!bg-primary/15 !text-primary",
  "Suspended": "!bg-destructive/10 !text-destructive",
  "Active": "!bg-secondary/10 !text-secondary",
  "Inactive": "!bg-destructive/10 !text-destructive",
};

export function StatusChip({ status }: { status: StatusType }) {
  const { t } = useLang();
  const labelMap: Record<string, string> = {
    Paid: t("admin_dashboard.paid"),
    Pending: t("admin_dashboard.pending"),
    Refunded: t("admin_dashboard.refunded"),
    Processing: t("admin_dashboard.processing") ?? "Processing",
    Verified: t("admin_dashboard.verified"),
    "Under review": t("admin_dashboard.underReview"),
    Suspended: t("admin_dashboard.suspended"),
    Active: t("admin_dashboard.active") ?? "Active",
    Inactive: t("admin_dashboard.inactive") ?? "Inactive",
  };

  return (
    <span className={cn("chip", STATUS_STYLES[status] ?? "!bg-muted !text-muted-foreground")}>
      {labelMap[status] ?? status}
    </span>
  );
}
