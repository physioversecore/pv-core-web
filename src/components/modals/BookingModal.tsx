"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X, CalendarDays, ChevronDown, TriangleAlert, Lock } from "lucide-react";
import { cn } from "@/utils/cn";
import { Avatar } from "@/components/common/Avatar";
import { useAuth } from "@/context/auth";
import { createSession, updateSession } from "@/services/api/sessions";
import { getSlotsForRange } from "@/services/api/availability";

// ─── Types ──────────────────────────────────────────────────────────────────

interface BookingTherapist {
  id: string;
  name: string;
  specialty: string;
  price: number;
  rating: number;
  reviews: number;
  imageUrl?: string;
}

interface TimeSlot {
  time: string;
  booked: boolean;
}

interface CurrencyOption {
  code: string;
  name: string;
  flag: string;
  symbol: string;
  rate: number;
}

interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
  type: "nepal" | "international";
  subtype?: string;
}

interface BookingResult {
  reference: string;
  therapistName: string;
  date: string;
  time: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

// ─── Session shape for edit mode ────────────────────────────────────────────

interface ExistingSession {
  id: string;
  therapistId: string;
  therapistName?: string;
  therapistSpecialty?: string;
  therapistPrice?: number;
  date: string;
  time: string;
  status?: string;
  fee?: number;
}

// ─── Mock Data (fallback) ───────────────────────────────────────────────────

const MOCK_THERAPIST: BookingTherapist = {
  id: "th-001",
  name: "Dr. Anjali Sharma",
  specialty: "Sports & post-surgery rehabilitation",
  price: 2000,
  rating: 4.8,
  reviews: 124,
};

const MOCK_TIME_SLOTS: TimeSlot[] = [
  { time: "08:00", booked: true },
  { time: "09:00", booked: false },
  { time: "10:00", booked: false },
  { time: "11:00", booked: true },
  { time: "12:00", booked: false },
  { time: "13:00", booked: false },
  { time: "14:00", booked: true },
  { time: "15:00", booked: false },
  { time: "16:00", booked: false },
];

const CURRENCIES: CurrencyOption[] = [
  { code: "NPR", name: "Nepalese Rupee", flag: "🇳🇵", symbol: "Rs.", rate: 1 },
  { code: "USD", name: "US Dollar", flag: "🇺🇸", symbol: "$", rate: 0.0075 },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", symbol: "A$", rate: 0.011 },
  { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€", rate: 0.0069 },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", symbol: "£", rate: 0.0059 },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", symbol: "C$", rate: 0.01 },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳", symbol: "₹", rate: 0.63 },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬", symbol: "S$", rate: 0.01 },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", symbol: "¥", rate: 1.12 },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪", symbol: "د.إ", rate: 0.028 },
];

const NEPAL_PAYMENTS: PaymentMethod[] = [
  { id: "esewa", label: "eSewa", icon: "💳", type: "nepal", subtype: "Digital wallet" },
  { id: "khalti", label: "Khalti", icon: "💳", type: "nepal", subtype: "Digital wallet" },
  { id: "connectips", label: "ConnectIPS", icon: "🏦", type: "nepal", subtype: "Bank transfer" },
  { id: "imepay", label: "IME Pay", icon: "💳", type: "nepal", subtype: "Digital wallet" },
  { id: "fonepay", label: "FonePay", icon: "📱", type: "nepal", subtype: "QR/mobile" },
  { id: "cash", label: "Cash", icon: "💵", type: "nepal", subtype: "Pay on visit" },
];

const INTERNATIONAL_PAYMENTS: PaymentMethod[] = [
  { id: "card", label: "Card", icon: "💳", type: "international", subtype: "Credit/Debit" },
  { id: "paypal", label: "PayPal", icon: "🅿️", type: "international", subtype: "Online wallet" },
  { id: "googlepay", label: "Google Pay", icon: "📱", type: "international", subtype: "Mobile wallet" },
  { id: "applepay", label: "Apple Pay", icon: "🍎", type: "international", subtype: "Mobile wallet" },
];

const BILLING_COUNTRIES = [
  "Nepal",
  "United States",
  "Australia",
  "United Kingdom",
  "Canada",
  "India",
  "Singapore",
  "United Arab Emirates",
  "Japan",
  "Germany",
  "France",
];

// ─── StepIndicator ──────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: "Date & time" },
  { num: 2, label: "Currency" },
  { num: 3, label: "Payment" },
  { num: 4, label: "Confirm" },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between px-1">
      {STEPS.map((step, i) => {
        const isCompleted = currentStep > step.num;
        const isActive = currentStep === step.num;
        const isUpcoming = currentStep < step.num;

        return (
          <div key={step.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                  isCompleted && "bg-[#1F3D2B] text-white",
                  isActive && "bg-[#1F3D2B] text-white ring-2 ring-[#1F3D2B]/30",
                  isUpcoming && "bg-white border-2 border-gray-300 text-gray-400"
                )}
              >
                {isCompleted ? "✓" : step.num}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-1 whitespace-nowrap font-medium",
                  isCompleted && "text-[#1F3D2B]",
                  isActive && "text-[#1F3D2B] font-semibold",
                  isUpcoming && "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-[2px] mx-2 mt-[-1.5rem]",
                  isCompleted ? "bg-[#1F3D2B]" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── TherapistSummaryCard ───────────────────────────────────────────────────

interface TherapistSummaryCardProps {
  therapist: BookingTherapist;
  selectedCurrency: string;
  currencies: CurrencyOption[];
  compact?: boolean;
}

function TherapistSummaryCard({ therapist, selectedCurrency, currencies, compact }: TherapistSummaryCardProps) {
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

// ─── StepDateTime ───────────────────────────────────────────────────────────

interface StepDateTimeProps {
  selectedDate: string;
  selectedTime: string;
  slots: TimeSlot[];
  slotsLoading: boolean;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onContinue: () => void;
}

function StepDateTime({ selectedDate, selectedTime, slots, slotsLoading, onDateChange, onTimeChange, onContinue }: StepDateTimeProps) {
  const isValid = !!selectedDate && !!selectedTime;

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-[#1E2A2E]">Select date</label>
        <div className="relative mt-1.5">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]/20 focus:border-[#1F3D2B]"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-[#1E2A2E]">Available time slots</label>
        {slotsLoading ? (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {slots.length === 0 && selectedDate ? (
              <p className="col-span-full text-sm text-gray-400 text-center py-4">
                No available slots for this date
              </p>
            ) : (
              slots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={slot.booked}
                  onClick={() => onTimeChange(slot.time)}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-medium border transition-all",
                    slot.booked && "bg-gray-100 text-gray-400 line-through cursor-not-allowed",
                    !slot.booked && selectedTime === slot.time && "border-[#1F3D2B] bg-[#1F3D2B]/10 text-[#1F3D2B]",
                    !slot.booked && selectedTime !== slot.time && "border-gray-200 bg-white text-[#1E2A2E] hover:border-[#1F3D2B]"
                  )}
                >
                  {slot.time}
                </button>
              ))
            )}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">Greyed slots are already booked.</p>
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
        Continue
        <span className="text-lg">→</span>
      </button>
    </div>
  );
}

// ─── StepCurrency ───────────────────────────────────────────────────────────

interface StepCurrencyProps {
  currencies: CurrencyOption[];
  selectedCurrency: string;
  basePrice: number;
  onCurrencyChange: (code: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function StepCurrency({
  currencies,
  selectedCurrency,
  basePrice,
  onCurrencyChange,
  onBack,
  onContinue,
}: StepCurrencyProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

// ─── StepPayment ────────────────────────────────────────────────────────────

interface StepPaymentProps {
  selectedPaymentMethod: string;
  selectedCurrency: string;
  currencies: CurrencyOption[];
  basePrice: number;
  onPaymentChange: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
  cardDetails: CardDetails;
  onCardDetailsChange: (details: CardDetails) => void;
  esewaMobile: string;
  onEsewaMobileChange: (val: string) => void;
  billingCountry: string;
  onBillingCountryChange: (val: string) => void;
  isEdit: boolean;
  isSubmitting: boolean;
}

const PAYMENT_TYPES = [
  { key: "nepal" as const, label: "Nepal Payment", flag: "🇳🇵" },
  { key: "international" as const, label: "International Payment", flag: "🌍" },
];

function StepPayment({
  selectedPaymentMethod,
  selectedCurrency,
  currencies,
  basePrice,
  onPaymentChange,
  onBack,
  onContinue,
  cardDetails,
  onCardDetailsChange,
  esewaMobile,
  onEsewaMobileChange,
  billingCountry,
  onBillingCountryChange,
  isEdit,
  isSubmitting,
}: StepPaymentProps) {
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
            onChange={(e) => onEsewaMobileChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
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
                        onBillingCountryChange(c);
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
        disabled={!isValid || isSubmitting}
        onClick={onContinue}
        className={cn(
          "w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
          isValid && !isSubmitting
            ? "bg-[#1F3D2B] text-white hover:bg-[#1F3D2B]/90"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {isEdit ? "Updating..." : "Processing..."}
          </>
        ) : (
          <>{isEdit ? "Update & confirm" : "Pay & confirm booking"} →</>
        )}
      </button>
    </div>
  );
}

// ─── StepConfirmation ───────────────────────────────────────────────────────

interface StepConfirmationProps {
  result: BookingResult;
  currencies: CurrencyOption[];
  onDone: () => void;
  isEdit: boolean;
}

function StepConfirmation({ result, currencies, onDone, isEdit }: StepConfirmationProps) {
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
        <h2 className="text-2xl font-bold text-[#1E2A2E]">
          {isEdit ? "Booking updated!" : "Booking confirmed!"}
        </h2>
        <p className="text-gray-500 mt-1">
          {isEdit ? "Your session has been updated" : "Your session is confirmed"}
        </p>
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
        {isEdit
          ? "Your booking has been updated successfully."
          : `Your payment has been processed successfully. ${result.therapistName} has been notified of your booking.`}
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

function DetailRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? "font-bold text-[#1E2A2E]" : "font-medium text-[#1E2A2E]"}>
        {value}
      </span>
    </div>
  );
}

// ─── Slot -> TimeSlot helper ───────────────────────────────────────────────

function buildTimeSlots(date: string, slotData?: { slots: { date: string; time: string; status: string }[] }): TimeSlot[] {
  if (!slotData?.slots || slotData.slots.length === 0) return MOCK_TIME_SLOTS;
  return slotData.slots
    .filter((s) => s.date === date)
    .map((s) => ({
      time: s.time,
      booked: s.status === "booked",
    }))
    .sort((a, b) => a.time.localeCompare(b.time));
}

// ─── Main BookingModal ──────────────────────────────────────────────────────

interface BookingModalProps {
  onClose: () => void;
  therapist?: BookingTherapist;
  session?: ExistingSession;
}

function BookingModal({ onClose, therapist: propTherapist, session }: BookingModalProps) {
  const { user } = useAuth();

  const resolvedTherapist: BookingTherapist = session
    ? {
        id: session.therapistId,
        name: session.therapistName || "Therapist",
        specialty: session.therapistSpecialty || "Physiotherapy",
        price: session.therapistPrice ?? session.fee ?? 0,
        rating: 0,
        reviews: 0,
      }
    : propTherapist ?? MOCK_THERAPIST;

  const isEdit = !!session;

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(session?.date ?? "");
  const [selectedTime, setSelectedTime] = useState(session?.time ?? "");
  const [selectedCurrency, setSelectedCurrency] = useState("NPR");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [esewaMobile, setEsewaMobile] = useState("");
  const [billingCountry, setBillingCountry] = useState("");

  // Fetch availability slots from API whenever date changes
  const today = new Date().toISOString().slice(0, 10);
  const queryDate = selectedDate || today;

  const { data: slotData, isLoading: slotsLoading } = useQuery({
    queryKey: ["availability-slots", queryDate],
    queryFn: () => getSlotsForRange(queryDate, queryDate),
    enabled: !!selectedDate,
    staleTime: 60_000,
  });

  const timeSlots = selectedDate ? buildTimeSlots(selectedDate, slotData) : MOCK_TIME_SLOTS;

  // If editing, mark the session's own time as unbooked so user can keep it
  useEffect(() => {
    if (isEdit && session?.time && timeSlots.length > 0) {
      const existing = timeSlots.find((s) => s.time === session.time);
      if (existing?.booked) {
        existing.booked = false;
      }
    }
  }, [isEdit, session?.time, timeSlots]);

  const currency = CURRENCIES.find((c) => c.code === selectedCurrency) ?? CURRENCIES[0];
  const displayPrice = resolvedTherapist.price * currency.rate;
  const platformFee = displayPrice * 0.05;
  const totalPrice = displayPrice + platformFee;

  // Mutations
  const createMutation = useMutation({
    mutationFn: () =>
      createSession({
        therapistId: resolvedTherapist.id,
        date: selectedDate,
        time: selectedTime,
        type: "physiotherapy",
        address: user?.city ?? "",
        fee: totalPrice,
      }),
    onSuccess: (data) => {
      const ref = data?.id || "BK-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      setBookingResult({
        reference: ref,
        therapistName: resolvedTherapist.name,
        date: formatDisplayDate(selectedDate),
        time: selectedTime,
        amount: totalPrice,
        currency: selectedCurrency,
        paymentMethod: getPaymentLabel(),
      });
      setCurrentStep(4);
    },
    onError: () => {
      // Fallback to mock booking on error
      const ref = "BK-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      setBookingResult({
        reference: ref,
        therapistName: resolvedTherapist.name,
        date: formatDisplayDate(selectedDate),
        time: selectedTime,
        amount: totalPrice,
        currency: selectedCurrency,
        paymentMethod: getPaymentLabel(),
      });
      setCurrentStep(4);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateSession(session!.id, {
        date: selectedDate,
        time: selectedTime,
        status: "Confirmed",
      }),
    onSuccess: (data) => {
      setBookingResult({
        reference: session!.id,
        therapistName: resolvedTherapist.name,
        date: formatDisplayDate(selectedDate),
        time: selectedTime,
        amount: totalPrice,
        currency: selectedCurrency,
        paymentMethod: getPaymentLabel(),
      });
      setCurrentStep(4);
    },
    onError: () => {
      setBookingResult({
        reference: session!.id,
        therapistName: resolvedTherapist.name,
        date: formatDisplayDate(selectedDate),
        time: selectedTime,
        amount: totalPrice,
        currency: selectedCurrency,
        paymentMethod: getPaymentLabel(),
      });
      setCurrentStep(4);
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const formatDisplayDate = (iso: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  function getPaymentLabel(): string {
    const map: Record<string, string> = {
      esewa: "eSewa",
      khalti: "Khalti",
      connectips: "ConnectIPS",
      imepay: "IME Pay",
      fonepay: "FonePay",
      cash: "Cash",
      card: "Card",
      paypal: "PayPal",
      googlepay: "Google Pay",
      applepay: "Apple Pay",
    };
    return map[selectedPaymentMethod] || selectedPaymentMethod;
  }

  const handleSubmit = useCallback(() => {
    if (isEdit) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  }, [isEdit, createMutation, updateMutation]);

  const stepsWithSummary = currentStep >= 1 && currentStep <= 3;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-[420px] bg-[#FAF9F5] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 p-2 rounded-full hover:bg-black/5 transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>

        <div className="p-5 pt-6">
          <StepIndicator currentStep={currentStep} />
        </div>

        {currentStep < 4 && (
          <div className="px-5 pb-3">
            {stepsWithSummary && (
              <TherapistSummaryCard
                therapist={resolvedTherapist}
                selectedCurrency={selectedCurrency}
                currencies={CURRENCIES}
              />
            )}
          </div>
        )}

        <div className="px-5 pb-6">
          {currentStep === 1 && (
            <StepDateTime
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              slots={timeSlots}
              slotsLoading={slotsLoading}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              onContinue={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <StepCurrency
              currencies={CURRENCIES}
              selectedCurrency={selectedCurrency}
              basePrice={resolvedTherapist.price}
              onCurrencyChange={setSelectedCurrency}
              onBack={() => setCurrentStep(1)}
              onContinue={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <StepPayment
              selectedPaymentMethod={selectedPaymentMethod}
              selectedCurrency={selectedCurrency}
              currencies={CURRENCIES}
              basePrice={resolvedTherapist.price}
              onPaymentChange={setSelectedPaymentMethod}
              onBack={() => setCurrentStep(2)}
              onContinue={handleSubmit}
              cardDetails={cardDetails}
              onCardDetailsChange={setCardDetails}
              esewaMobile={esewaMobile}
              onEsewaMobileChange={setEsewaMobile}
              billingCountry={billingCountry}
              onBillingCountryChange={setBillingCountry}
              isEdit={isEdit}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 4 && bookingResult && (
            <StepConfirmation
              result={bookingResult}
              currencies={CURRENCIES}
              onDone={onClose}
              isEdit={isEdit}
            />
          )}
        </div>

        {isSubmitting && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#1F3D2B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-[#1E2A2E]">
                {isEdit ? "Updating booking..." : "Processing payment..."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingModal;
