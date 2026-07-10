"use client";

import { Avatar } from "@/components/common/Avatar";
import type { BookingTherapist, CurrencyOption } from "./types";

interface Props {
  therapist: BookingTherapist;
  selectedCurrency: string;
  currencies: CurrencyOption[];
  compact?: boolean;
}

export function TherapistSummaryCard({ therapist, selectedCurrency, currencies, compact }: Props) {
  const currency = currencies.find((c) => c.code === selectedCurrency) ?? currencies[0];
  const convertedPrice = therapist.price * currency.rate;
  const formattedPrice = `${currency.symbol}${convertedPrice.toFixed(2)}`;

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-[#F0F0EE] rounded-xl p-3">
        <Avatar name={therapist.name} size={40} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-[#1E2A2E] truncate">{therapist.name}</div>
          <div className="text-xs text-gray-500">{therapist.specialty}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-sm text-[#1E2A2E]">{formattedPrice}</div>
          <div className="text-[10px] text-gray-400">per session</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-[#F0F0EE] rounded-xl p-3">
      <Avatar name={therapist.name} size={44} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[#1E2A2E] truncate">{therapist.name}</div>
        <div className="text-sm text-gray-500 truncate">{therapist.specialty}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-bold text-[#1E2A2E]">{formattedPrice}</div>
        <div className="text-xs text-gray-400">per session</div>
      </div>
    </div>
  );
}
