"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Lock, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import type { CurrencyOption } from "./types";
import { NEPAL_PAYMENTS, INTERNATIONAL_PAYMENTS, BILLING_COUNTRIES } from "./mockData";

const PAYMENT_TYPES = [
  { key: "nepal", label: "Nepal Payment", flag: "🇳🇵" },
  { key: "international", label: "International Payment", flag: "🌍" },
] as const;

interface Props {
  selectedPaymentMethod: string;
  selectedCurrency: string;
  currencies: CurrencyOption[];
  basePrice: number;
  onPaymentChange: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
  cardDetails?: CardDetails;
  onCardDetailsChange?: (details: CardDetails) => void;
  esewaMobile?: string;
  onEsewaMobileChange?: (val: string) => void;
  billingCountry?: string;
  onBillingCountryChange?: (val: string) => void;
}

export interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

export function StepPayment({
  selectedPaymentMethod,
  selectedCurrency,
  currencies,
  basePrice,
  onPaymentChange,
  onBack,
  onContinue,
  cardDetails = { number: "", expiry: "", cvv: "", name: "" },
  onCardDetailsChange,
  esewaMobile = "",
  onEsewaMobileChange,
  billingCountry = "",
  onBillingCountryChange,
}: Props) {
  const [paymentType, setPaymentType] = useState<"nepal" | "international" | null>(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const methodRef = useRef<HTMLDivElement>(null);

  const currency = currencies.find((c) => c.code === selectedCurrency) ?? currencies[0];
  const converted = basePrice * currency.rate;
  const platformFee = converted * 0.05;
  const total = converted + platformFee;

  const selectedMethod = [...NEPAL_PAYMENTS, ...INTERNATIONAL_PAYMENTS].find(
    (m) => m.id === selectedPaymentMethod
  );

  const nepalWalletMethods = NEPAL_PAYMENTS.filter((m) => m.subtype === "Digital wallet");
  const isNepalWallet = nepalWalletMethods.some((m) => m.id === selectedPaymentMethod);

  const isValid =
    selectedPaymentMethod &&
    (paymentType === "nepal"
      ? !isNepalWallet || esewaMobile.length >= 10
      : selectedPaymentMethod !== "card" ||
        (cardDetails.number.length >= 16 &&
          cardDetails.expiry.length >= 4 &&
          cardDetails.cvv.length >= 3 &&
          cardDetails.name.length > 0 &&
          billingCountry.length > 0));

  const closeMethodDropdown = useCallback(() => setMethodOpen(false), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (methodRef.current && !methodRef.current.contains(e.target as Node)) {
        closeMethodDropdown();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") closeMethodDropdown();
    }
    if (methodOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [methodOpen, closeMethodDropdown]);

  function updateCard(field: keyof CardDetails, value: string) {
    if (!onCardDetailsChange) return;
    let formatted = value;
    if (field === "number") {
      formatted = value.replace(/\D/g, "").slice(0, 16);
    } else if (field === "expiry") {
      formatted = value
        .replace(/\D/g, "")
        .slice(0, 4)
        .replace(/(\d{2})(\d)/, "$1/$2");
    } else if (field === "cvv") {
      formatted = value.replace(/\D/g, "").slice(0, 4);
    }
    onCardDetailsChange({ ...cardDetails, [field]: formatted });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1E2A2E]">Payment method</h2>
        <p className="text-sm text-gray-500 mt-1">Enter your payment details</p>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-[#1F3D2B] mt-1 flex items-center gap-1">
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PAYMENT_TYPES.map((pt) => {
          const active = paymentType === pt.key;
          return (
            <button
              key={pt.key}
              type="button"
              onClick={() => {
                setPaymentType(pt.key);
                setMethodOpen(false);
                onPaymentChange(pt.key === "nepal" ? "esewa" : "card");
              }}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border text-sm transition-all",
                active
                  ? "border-[#1F3D2B] bg-[#1F3D2B]/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <span className="text-2xl">{pt.flag}</span>
              <span className={cn("font-semibold", active ? "text-[#1F3D2B]" : "text-[#1E2A2E]")}>
                {pt.label}
              </span>
            </button>
          );
        })}
      </div>

      {paymentType && (
        <div ref={methodRef} className="relative">
          <button
            type="button"
            onClick={() => setMethodOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]/20 focus:border-[#1F3D2B]"
          >
            <span className={cn("font-medium", selectedMethod ? "text-[#1E2A2E]" : "text-gray-400")}>
              {selectedMethod ? (
                <><span className="mr-2">{selectedMethod.icon}</span>{selectedMethod.label}</>
              ) : (
                `Select ${paymentType} payment method`
              )}
            </span>
            <ChevronDown size={18} className={cn("text-gray-400 transition-transform", methodOpen && "rotate-180")} />
          </button>
          {methodOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {(paymentType === "nepal" ? NEPAL_PAYMENTS : INTERNATIONAL_PAYMENTS).map((m) => (
                <button
                  key={m.id}
                  onClick={() => { onPaymentChange(m.id); setMethodOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                    selectedPaymentMethod === m.id && "bg-[#1F3D2B]/5 font-semibold text-[#1F3D2B]"
                  )}
                >
                  <span className="text-lg">{m.icon}</span>
                  <div className="text-left">
                    <span className="block">{m.label}</span>
                    {m.subtype && <span className="block text-xs text-gray-400">{m.subtype}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {paymentType === "nepal" && isNepalWallet && (
        <div>
          <label className="text-sm font-medium text-[#1E2A2E]">
            {selectedMethod?.label} registered mobile number
          </label>
          <input
            type="tel"
            value={esewaMobile}
            onChange={(e) => onEsewaMobileChange?.(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="98XXXXXXXX"
            className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]/20 focus:border-[#1F3D2B]"
          />
          <p className="text-xs text-gray-400 mt-1">
            You will receive a prompt on your {selectedMethod?.label} app to confirm the payment.
          </p>
        </div>
      )}

      {paymentType === "international" && selectedPaymentMethod === "card" && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-[#1E2A2E]">Card number</label>
            <input
              type="text"
              inputMode="numeric"
              value={cardDetails.number}
              onChange={(e) => updateCard("number", e.target.value)}
              placeholder="1234 5678 9012 3456"
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]/20 focus:border-[#1F3D2B]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-[#1E2A2E]">Expiry date</label>
              <input
                type="text"
                value={cardDetails.expiry}
                onChange={(e) => updateCard("expiry", e.target.value)}
                placeholder="MM/YY"
                className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]/20 focus:border-[#1F3D2B]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1E2A2E]">CVV</label>
              <input
                type="text"
                inputMode="numeric"
                value={cardDetails.cvv}
                onChange={(e) => updateCard("cvv", e.target.value)}
                placeholder="123"
                className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]/20 focus:border-[#1F3D2B]"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#1E2A2E]">Name on card</label>
            <input
              type="text"
              value={cardDetails.name}
              onChange={(e) => updateCard("name", e.target.value)}
              placeholder="John Doe"
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]/20 focus:border-[#1F3D2B]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1E2A2E]">Billing country</label>
            <div className="relative mt-1.5">
              <button
                type="button"
                onClick={() => setCountryOpen((v) => !v)}
                className="w-full text-left px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]/20 focus:border-[#1F3D2B]"
              >
                {billingCountry || <span className="text-gray-400">Select country</span>}
              </button>
              {countryOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {BILLING_COUNTRIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        onBillingCountryChange?.(c);
                        setCountryOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-gray-50",
                        billingCountry === c && "bg-[#1F3D2B]/5 font-medium"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#F0F0EE] rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Session fee</span>
          <span className="font-medium text-[#1E2A2E]">{currency.symbol}{converted.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Platform fee (5%)</span>
          <span className="font-medium text-[#1E2A2E]">{currency.symbol}{platformFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-2">
          <span className="text-[#1E2A2E]">Total</span>
          <span className="text-[#1E2A2E]">{currency.symbol}{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Lock size={12} />
        <span>Secured by 256-bit SSL encryption · PCI DSS compliant</span>
      </div>

      <button
        disabled={!isValid}
        onClick={onContinue}
        className={cn(
          "w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
          isValid
            ? "bg-[#1F3D2B] text-white hover:bg-[#1F3D2B]/90"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        )}
      >
        Pay & confirm booking →
      </button>
    </div>
  );
}


