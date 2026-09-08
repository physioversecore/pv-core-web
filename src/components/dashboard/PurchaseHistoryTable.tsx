"use client";

import { formatDate } from "@/lib/format";
import { cn } from "@/utils/cn";
import type { PackagePurchase } from "@/types";

interface PurchaseHistoryTableProps {
  purchases: PackagePurchase[];
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  EXPIRED: "bg-surface text-text-light",
  DEPLETED: "bg-primary/10 text-primary",
  CANCELLED: "bg-danger/10 text-danger",
};

export function PurchaseHistoryTable({ purchases }: PurchaseHistoryTableProps) {
  if (purchases.length === 0) {
    return null;
  }

  return (
    <div className="card-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="text-left px-4 py-3 font-medium text-xs text-text-light">Package</th>
              <th className="text-left px-4 py-3 font-medium text-xs text-text-light">Purchased</th>
              <th className="text-left px-4 py-3 font-medium text-xs text-text-light">Sessions</th>
              <th className="text-left px-4 py-3 font-medium text-xs text-text-light">Expires</th>
              <th className="text-left px-4 py-3 font-medium text-xs text-text-light">Status</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border last:border-0 hover:bg-surface/40 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-text">{p.packageName}</td>
                <td className="px-4 py-3 text-text-light">{formatDate(p.purchasedAt)}</td>
                <td className="px-4 py-3 text-text-light">
                  {p.sessionsUsed} / {p.sessionsTotal}
                </td>
                <td className="px-4 py-3 text-text-light">{formatDate(p.expiresAt)}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                      STATUS_STYLES[p.status] ?? "bg-surface text-text-light",
                    )}
                  >
                    {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
