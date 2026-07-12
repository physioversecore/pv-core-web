"use client";

import { cn } from "@/lib/utils";
import { useLang } from "@/context/i18n";

type StatusType = "Paid" | "Pending" | "Refunded" | "Processing" | "Verified" | "Under review" | "Suspended" | "Active" | "Inactive" | "Open" | "Resolved" | "Dismissed" | "Normal" | "Urgent";

const STATUS_STYLES: Record<string, string> = {
  "Paid": "!bg-secondary/10 !text-secondary",
  "Pending": "!bg-primary/15 !text-primary",
  "Refunded": "!bg-destructive/10 !text-destructive",
  "Processing": "!bg-primary/15 !text-primary",
  "Verified": "!bg-secondary/10 !text-secondary",
  "Under review": "!bg-info/15 !text-info",
  "Suspended": "!bg-destructive/10 !text-destructive",
  "Active": "!bg-secondary/10 !text-secondary",
  "Inactive": "!bg-destructive/10 !text-destructive",
  "Open": "!bg-primary/15 !text-primary",
  "Resolved": "!bg-success/10 !text-success",
  "Dismissed": "!bg-muted !text-muted-foreground",
  "Normal": "!bg-muted !text-muted-foreground",
  "Urgent": "!bg-destructive/10 !text-destructive",
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
    Open: t("admin_dashboard.open") ?? "Open",
    Resolved: t("admin_dashboard.resolved") ?? "Resolved",
    Dismissed: t("admin_dashboard.dismissed") ?? "Dismissed",
    Normal: t("admin_dashboard.normal") ?? "Normal",
    Urgent: t("admin_dashboard.urgent") ?? "Urgent",
  };

  return (
    <span className={cn("chip", STATUS_STYLES[status] ?? "!bg-muted !text-muted-foreground")}>
      {labelMap[status] ?? status}
    </span>
  );
}
