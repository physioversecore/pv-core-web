"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, TriangleAlert } from "lucide-react";
import { cn } from "@/utils/cn";
import type { CurrencyOption } from "./types";

interface Props {
  currencies: CurrencyOption[];
  selectedCurrency: string;
  basePrice: number;
  onCurrencyChange: (code: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function StepCurrency({
  currencies,
  selectedCurrency,
  basePrice,
  onCurrencyChange,
  onBack,
  onContinue,
}: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [focusedIdx, setFocusedIdx] = useState(-1);

  const selected = currencies.find((c) => c.code === selectedCurrency) ?? currencies[0];
  const converted = basePrice * selected.rate;
  const isNPR = selectedCurrency === "NPR";

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIdx(-1);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        close();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setFocusedIdx(0);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIdx((prev) => Math.min(prev + 1, currencies.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIdx((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIdx >= 0) {
          onCurrencyChange(currencies[focusedIdx].code);
          close();
        }
        break;
      case "Escape":
        close();
        break;
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1E2A2E]">Select currency</h2>
        <p className="text-sm text-gray-500 mt-1">Choose how you want to pay</p>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-[#1F3D2B] mt-1 flex items-center gap-1">
          ← Back
        </button>
      </div>

      <div ref={dropdownRef} className="relative" onKeyDown={handleKeyDown}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]/20 focus:border-[#1F3D2B]"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">{selected.flag}</span>
            <span className="font-medium text-[#1E2A2E]">{selected.code}</span>
            <span className="text-gray-400">— {selected.name}</span>
          </span>
          <ChevronDown
            size={18}
            className={cn("text-gray-400 transition-transform", open && "rotate-180")}
          />
        </button>

        {open && (
          <div
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto"
          >
            {currencies.map((c, i) => (
              <button
                key={c.code}
                role="option"
                aria-selected={c.code === selectedCurrency}
                onClick={() => {
                  onCurrencyChange(c.code);
                  close();
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                  c.code === selectedCurrency && "bg-[#1F3D2B]/5",
                  focusedIdx === i && "bg-gray-50"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{c.flag}</span>
                  <span className="font-medium text-[#1E2A2E]">{c.code}</span>
                  <span className="text-gray-400">— {c.name}</span>
                </span>
                {c.code === selectedCurrency && (
                  <span className="text-[#1F3D2B] font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#F0F0EE] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">You will pay</p>
            <p className="text-2xl font-bold text-[#1E2A2E] mt-0.5">
              {selected.symbol}{converted.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Base price</p>
            <p className="text-sm font-semibold text-[#1E2A2E] mt-0.5">
              Rs. {basePrice.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {isNPR
            ? "Local currency — no conversion"
            : `1 ${selectedCurrency} = ${selected.rate} NPR`}
        </p>
      </div>

      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <TriangleAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Currency conversion is indicative. Final amount will be charged in your selected currency at the live rate on the day of booking.
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 rounded-xl font-semibold bg-[#1F3D2B] text-white hover:bg-[#1F3D2B]/90 flex items-center justify-center gap-2 transition-all"
      >
        Continue to payment method →
      </button>
    </div>
  );
}
