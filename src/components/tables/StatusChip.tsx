"use client";

import { cn } from "@/lib/utils";
import { useLang } from "@/context/i18n";

export type StatusType =
  | "Paid" | "Pending" | "Refunded" | "Processing" | "Verified" | "Under review" | "Suspended"
  | "Active" | "Inactive" | "Open" | "Resolved" | "Dismissed" | "Normal" | "Urgent"
  | "Rescheduled" | "Confirmed" | "Cancelled" | "Super Admin" | "Support Admin" | "Finance Admin"
  | "Low coverage" | "Approved" | "Declined"
  | "Expiring soon" | "Expired" | "Rejected" | "Pending review" | "Denied" | "Escalated"
  | "Good standing" | "Needs review" | "Under probation" | "Removed"
  | "Investigating" | "Critical" | "High" | "Medium" | "Low"
  | "System";

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
  "Rescheduled": "!bg-primary/15 !text-primary",
  "Confirmed": "!bg-secondary/10 !text-secondary",
  "Cancelled": "!bg-destructive/10 !text-destructive",
  "Super Admin": "!bg-secondary text-white",
  "Support Admin": "!bg-secondary/10 !text-secondary",
  "Finance Admin": "!bg-primary/15 !text-primary",
  "Low coverage": "!bg-destructive/10 !text-destructive",
  "Approved": "!bg-secondary/10 !text-secondary",
  "Declined": "!bg-muted !text-muted-foreground",
  "Expiring soon": "!bg-primary/15 !text-primary",
  "Expired": "!bg-destructive/10 !text-destructive",
  "Rejected": "!bg-destructive/10 !text-destructive",
  "Pending review": "!bg-primary/15 !text-primary",
  "Denied": "!bg-muted !text-text-light",
  "Good standing": "!bg-secondary/10 !text-secondary",
  "Needs review": "!bg-primary/15 !text-primary",
  "Under probation": "!bg-info/15 !text-info",
  "Removed": "!bg-muted !text-muted-foreground",
  "Investigating": "!bg-info/15 !text-info",
  "Critical": "!bg-destructive text-white",
  "High": "!bg-destructive/10 !text-destructive",
  "Medium": "!bg-primary/15 !text-primary",
  "Low": "!bg-muted !text-muted-foreground",
  "Escalated": "!bg-destructive/10 !text-destructive",
  "System": "!bg-muted !text-muted-foreground",
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
    Rescheduled: "Rescheduled",
    Confirmed: t("admin_dashboard.confirmed") ?? "Confirmed",
    Cancelled: t("admin_dashboard.cancelled") ?? "Cancelled",
    "Super Admin": "Super Admin",
    "Support Admin": "Support Admin",
    "Finance Admin": "Finance Admin",
    "Low coverage": "Low coverage",
    Approved: "Approved",
    Declined: "Declined",
    "Expiring soon": "Expiring soon",
    Expired: "Expired",
    Rejected: "Rejected",
    "Pending review": "Pending review",
    Denied: "Denied",
    "Good standing": "Good standing",
    "Needs review": "Needs review",
    "Under probation": "Under probation",
    Removed: "Removed",
    Investigating: "Investigating",
    Critical: "Critical",
    High: "High",
    Medium: "Medium",
    Low: "Low",
    Escalated: "Escalated",
    System: "System",
  };

  return (
    <span className={cn("chip", STATUS_STYLES[status] ?? "!bg-muted !text-muted-foreground")}>
      {labelMap[status] ?? status}
    </span>
  );
}
