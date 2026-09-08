"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Package, Check, CreditCard, Banknote, Smartphone } from "lucide-react";
import { cn } from "@/utils/cn";
import { purchasePackage } from "@/services/api/packages";
import { useActivePackage } from "@/hooks/useActivePackage";
import type { Package as PackageType } from "@/types";

interface PurchaseConfirmDialogProps {
  pkg: PackageType;
  onClose: () => void;
  onSuccess?: () => void;
}

const PAYMENT_OPTIONS = [
  { id: "esewa", label: "eSewa", icon: Smartphone, color: "text-emerald-600" },
  { id: "khalti", label: "Khalti", icon: Smartphone, color: "text-purple-600" },
  { id: "CASH", label: "Cash", icon: Banknote, color: "text-amber-600" },
  { id: "card", label: "Card", icon: CreditCard, color: "text-blue-600" },
];

export function PurchaseConfirmDialog({ pkg, onClose, onSuccess }: PurchaseConfirmDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activePackage } = useActivePackage();
  const [paymentMethod, setPaymentMethod] = useState("");

  const hasActivePackage =
    !!activePackage && activePackage.status === "ACTIVE" && activePackage.sessionsRemaining > 0;

  const purchaseMutation = useMutation({
    mutationFn: () => purchasePackage(pkg.id, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-package"] });
      queryClient.invalidateQueries({ queryKey: ["my-packages"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success("Package purchased successfully!");
      onSuccess?.();
      router.push("/patient/packages");
    },
    onError: (error: Error) => {
      const msg = error?.message || "Purchase failed. Please try again.";
      if (msg.includes("already have an active package")) {
        toast.error("You already have an active package. Use your remaining sessions first.");
      } else {
        toast.error(msg);
      }
    },
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-text/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-secondary/5 border-b border-border px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 grid place-items-center">
                <Package size={20} className="text-secondary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-text">{pkg.name}</h3>
                <p className="text-xs text-text-light">{pkg.tag}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-surface transition-colors"
            >
              <X size={16} className="text-text-light" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Package summary */}
          <div className="bg-surface rounded-xl p-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-text">
                Rs {pkg.price.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-text-light">{pkg.cadence}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-secondary/10 text-secondary px-2.5 py-1 rounded-full">
                {pkg.sessionCount} sessions
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                Valid for {pkg.validityDays} days
              </span>
            </div>
          </div>

          {/* What's included */}
          <div>
            <p className="text-xs font-semibold text-text-light uppercase tracking-wider mb-2">
              What&apos;s included
            </p>
            <ul className="space-y-2">
              {pkg.points.map((pt) => (
                <li key={pt} className="flex gap-2 text-sm text-text-light">
                  <Check size={14} className="shrink-0 mt-0.5 text-secondary" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment method */}
          {!hasActivePackage && (
            <div>
              <p className="text-xs font-semibold text-text-light uppercase tracking-wider mb-2">
                Payment method
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setPaymentMethod(opt.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                        selected
                          ? "border-secondary bg-secondary/5 text-secondary"
                          : "border-border bg-white text-text-light hover:border-border/80",
                      )}
                    >
                      <Icon size={16} className={selected ? "text-secondary" : opt.color} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active package warning */}
          {hasActivePackage && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
              You already have an active package with {activePackage.sessionsRemaining} session
              {activePackage.sessionsRemaining !== 1 ? "s" : ""} remaining. Use your existing
              sessions first.
            </div>
          )}

          {/* Confirm button */}
          <button
            disabled={!paymentMethod || hasActivePackage || purchaseMutation.isPending}
            onClick={() => purchaseMutation.mutate()}
            className={cn(
              "w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
              paymentMethod && !hasActivePackage && !purchaseMutation.isPending
                ? "bg-secondary text-white hover:bg-secondary/90"
                : "bg-gray-200 text-gray-400 cursor-not-allowed",
            )}
          >
            {purchaseMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : hasActivePackage ? (
              "Active package in use"
            ) : (
              "Confirm Purchase"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
