"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { formatDate, npr } from "@/lib/format";
import { cn } from "@/utils/cn";
import type { AdminPackagePurchase } from "@/types";
interface PurchaseDetailSheetProps {
  purchase: AdminPackagePurchase | null;
  onClose: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  EXPIRED: "bg-surface text-text-light",
  DEPLETED: "bg-primary/10 text-primary",
  CANCELLED: "bg-danger/10 text-danger",
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/60 last:border-0">
      <span className="text-sm text-text-light">{label}</span>
      <span className="text-sm font-medium text-text text-right">{value}</span>
    </div>
  );
}

export function PurchaseDetailSheet({ purchase, onClose }: PurchaseDetailSheetProps) {
  return (
    <Sheet open={!!purchase} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="overflow-y-auto">
        {purchase && (
          <>
            <SheetHeader>
              <SheetTitle>{purchase.packageName}</SheetTitle>
              <SheetDescription>Purchase details</SheetDescription>
            </SheetHeader>

            <div className="mt-4">
              <span
                className={cn(
                  "inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold",
                  STATUS_STYLES[purchase.status] ?? "bg-surface text-text-light",
                )}
              >
                {purchase.status.charAt(0) + purchase.status.slice(1).toLowerCase()}
              </span>
            </div>

            <div className="mt-4">
              <DetailRow label="Patient" value={purchase.patientName} />
              <DetailRow label="Amount" value={npr(purchase.amount)} />
              <DetailRow
                label="Sessions"
                value={`${purchase.sessionsUsed} / ${purchase.sessionsTotal} used`}
              />
              <DetailRow label="Remaining" value={`${purchase.sessionsRemaining} session(s)`} />
              <DetailRow label="Purchased" value={formatDate(purchase.purchasedAt)} />
              <DetailRow label="Expires" value={formatDate(purchase.expiresAt)} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
