"use client";

import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  label?: string;
}

export function RefreshButton({ onRefresh, isRefreshing, label }: RefreshButtonProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className="btn-outline !py-2 !px-3 text-xs cursor-pointer disabled:opacity-50"
      title={label ?? "Refresh"}
    >
      <RefreshCw size={14} className={`inline mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
      {label ?? "Refresh"}
    </button>
  );
}
