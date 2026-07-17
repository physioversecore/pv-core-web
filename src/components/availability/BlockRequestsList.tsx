"use client";

import { useState } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { to12h } from "@/lib/format";
import type { BlockRequest } from "@/services/api/availability";

interface BlockRequestsListProps {
  requests: BlockRequest[];
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  isAdmin?: boolean;
}

const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800",
  },
  APPROVED: {
    icon: CheckCircle,
    label: "Approved",
    className: "bg-green-100 text-green-800",
  },
  REJECTED: {
    icon: XCircle,
    label: "Rejected",
    className: "bg-red-100 text-red-800",
  },
};

export function BlockRequestsList({
  requests,
  onApprove,
  onReject,
  isAdmin = false,
}: BlockRequestsListProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        <AlertCircle className="mx-auto mb-2" size={24} />
        <p className="text-sm">No block requests</p>
      </div>
    );
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await onApprove?.(id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await onReject?.(id);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const statusConfig =
          STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] ||
          STATUS_CONFIG.PENDING;
        const StatusIcon = statusConfig.icon;

        return (
          <div
            key={request.id}
            className="border border-border rounded-lg p-4 bg-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}
                  >
                    <StatusIcon size={12} />
                    {statusConfig.label}
                  </span>
                  {request.therapistName && (
                    <span className="text-xs text-text-muted">
                      by {request.therapistName}
                    </span>
                  )}
                </div>

                <div className="text-sm">
                  <p className="font-medium text-text">
                    {request.dateFrom}
                    {request.dateTo !== request.dateFrom &&
                      ` – ${request.dateTo}`}
                  </p>
                  {request.daysOfWeek.length > 0 && (
                    <p className="text-text-muted mt-1">
                      Days: {request.daysOfWeek.join(", ")}
                    </p>
                  )}
                  {request.reason && (
                    <p className="text-text-muted mt-1">
                      Reason: {request.reason}
                    </p>
                  )}
                </div>

                {request.adminNotes && (
                  <p className="text-xs text-text-muted mt-2 italic">
                    Admin notes: {request.adminNotes}
                  </p>
                )}
              </div>

              {isAdmin && request.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={actionLoading === request.id}
                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === request.id ? "..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={actionLoading === request.id}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading === request.id ? "..." : "Reject"}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
