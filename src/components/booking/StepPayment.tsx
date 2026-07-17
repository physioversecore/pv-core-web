"use client";

import { useState } from "react";
import { CreditCard, Globe, ArrowLeft } from "lucide-react";
import { cn } from "@/utils/cn";
import { NEPAL_PAYMENTS, INTERNATIONAL_PAYMENTS } from "./mockData";
import type { PaymentMethod } from "./types";

interface Props {
  selectedPaymentId: string;
  onSelect: (payment: PaymentMethod) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function StepPayment({ selectedPaymentId, onSelect, onBack, onContinue }: Props) {
  const [paymentType, setPaymentType] = useState<"nepal" | "international">("nepal");

  const payments = paymentType === "nepal" ? NEPAL_PAYMENTS : INTERNATIONAL_PAYMENTS;
  const selectedPayment = [...NEPAL_PAYMENTS, ...INTERNATIONAL_PAYMENTS].find(
    (p) => p.id === selectedPaymentId,
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1E2A2E]">Payment method</h2>
        <p className="text-sm text-gray-500 mt-1">Select how the patient will pay</p>
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-[#1F3D2B] mt-1 flex items-center gap-1"
        >
          ← Back
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        <button
          onClick={() => setPaymentType("nepal")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
            paymentType === "nepal"
              ? "bg-white text-[#1F3D2B] shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          <CreditCard size={16} />
          Nepal Payment
        </button>
        <button
          onClick={() => setPaymentType("international")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
            paymentType === "international"
              ? "bg-white text-[#1F3D2B] shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          <Globe size={16} />
          International Payment
        </button>
      </div>

      <div className="space-y-2">
        {payments.map((payment) => (
          <button
            key={payment.id}
            onClick={() => onSelect(payment)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all",
              selectedPaymentId === payment.id
                ? "border-[#1F3D2B] bg-[#1F3D2B]/5 ring-1 ring-[#1F3D2B]/20"
                : "border-gray-200 bg-white hover:border-gray-300",
            )}
          >
            <span className="text-xl w-8 text-center">{payment.icon}</span>
            <div className="flex-1">
              <div className="font-medium text-[#1E2A2E]">{payment.label}</div>
              {payment.subtype && (
                <div className="text-xs text-gray-400">{payment.subtype}</div>
              )}
            </div>
            {selectedPaymentId === payment.id && (
              <span className="text-[#1F3D2B] font-bold">✓</span>
            )}
          </button>
        ))}
      </div>

      {selectedPayment && (
        <div className="bg-[#F0F0EE] rounded-xl p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Payment method</span>
            <span className="font-medium text-[#1E2A2E]">
              {selectedPayment.icon} {selectedPayment.label}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-500">Type</span>
            <span className="font-medium text-[#1E2A2E]">
              {paymentType === "nepal" ? "Nepal Payment" : "International Payment"}
            </span>
          </div>
        </div>
      )}

      <button
        disabled={!selectedPaymentId}
        onClick={onContinue}
        className={cn(
          "w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
          selectedPaymentId
            ? "bg-[#1F3D2B] text-white hover:bg-[#1F3D2B]/90"
            : "bg-gray-200 text-gray-400 cursor-not-allowed",
        )}
      >
        Confirm booking
        <span className="text-lg">→</span>
      </button>
    </div>
  );
}
