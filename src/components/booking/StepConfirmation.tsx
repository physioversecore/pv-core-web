"use client";

import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import type { BookingResult, CurrencyOption } from "./types";

interface Props {
  result: BookingResult;
  currencies: CurrencyOption[];
  onDone: () => void;
}

export function StepConfirmation({ result, currencies, onDone }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const currency = currencies.find((c) => c.code === result.currency) ?? currencies[0];

  return (
    <div className="space-y-5 text-center">
      <div
        className={cn(
          "transition-all duration-500 ease-out",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}
      >
        <div className="w-20 h-20 rounded-full bg-[#1F3D2B]/10 flex items-center justify-center mx-auto">
          <span className="text-4xl">✓</span>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#1E2A2E]">Booking confirmed!</h2>
        <p className="text-gray-500 mt-1">Your session is confirmed</p>
      </div>

      <div className="flex items-center gap-3 bg-[#F0F0EE] rounded-xl p-3 text-left">
        <div className="w-10 h-10 rounded-full bg-[#1F3D2B] flex items-center justify-center text-white font-semibold text-sm">
          {result.therapistName
            .replace(/Dr\.?\s*/i, "")
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-[#1E2A2E] truncate">{result.therapistName}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-bold text-sm text-[#1E2A2E]">
            {currency.symbol}{result.amount.toFixed(2)}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Your payment has been processed successfully. {result.therapistName} has been notified of your booking.
      </p>

      <div className="bg-[#F0F0EE] rounded-xl p-4 text-left space-y-2 text-sm">
        <DetailRow label="Therapist" value={result.therapistName} />
        <DetailRow label="Date" value={result.date} />
        <DetailRow label="Time" value={result.time} />
        <DetailRow label="Amount paid" value={`${currency.symbol}${result.amount.toFixed(2)}`} />
        <DetailRow label="Payment method" value={result.paymentMethod} />
        <DetailRow label="Booking ref." value={result.reference} bold />
      </div>

      <p className="text-xs text-gray-400">
        You will receive a confirmation SMS shortly. View this booking in your patient dashboard.
      </p>

      <button
        onClick={onDone}
        className="w-full py-3 rounded-xl font-semibold bg-[#1F3D2B] text-white hover:bg-[#1F3D2B]/90 transition-all"
      >
        Done
      </button>
    </div>
  );
}

function DetailRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? "font-bold text-[#1E2A2E]" : "font-medium text-[#1E2A2E]"}>
        {value}
      </span>
    </div>
  );
}
