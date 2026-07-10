"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { StepIndicator } from "./StepIndicator";
import { TherapistSummaryCard } from "./TherapistSummaryCard";
import { StepDateTime } from "./StepDateTime";
import { StepCurrency } from "./StepCurrency";
import { StepPayment } from "./StepPayment";
import { StepConfirmation } from "./StepConfirmation";
import { MOCK_THERAPIST, MOCK_TIME_SLOTS, CURRENCIES } from "./mockData";
import type { BookingTherapist, BookingResult } from "./types";
import type { CardDetails } from "./StepPayment";

interface Props {
  onClose: () => void;
  therapist?: BookingTherapist;
}

export default function BookingModal({ onClose, therapist = MOCK_THERAPIST }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
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
  const [paying, setPaying] = useState(false);

  const currency = CURRENCIES.find((c) => c.code === selectedCurrency) ?? CURRENCIES[0];
  const displayPrice = therapist.price * currency.rate;
  const platformFee = displayPrice * 0.05;
  const totalPrice = displayPrice + platformFee;

  const formatDisplayDate = (iso: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePay = useCallback(() => {
    setPaying(true);
    setTimeout(() => {
      const ref = "BK-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const paymentLabel =
        selectedPaymentMethod === "esewa"
          ? "eSewa"
          : selectedPaymentMethod === "khalti"
            ? "Khalti"
            : selectedPaymentMethod === "connectips"
              ? "ConnectIPS"
              : selectedPaymentMethod === "imepay"
                ? "IME Pay"
                : selectedPaymentMethod === "fonepay"
                  ? "FonePay"
                  : selectedPaymentMethod === "cash"
                    ? "Cash"
                    : selectedPaymentMethod === "card"
                      ? "Card"
                      : selectedPaymentMethod === "paypal"
                        ? "PayPal"
                        : selectedPaymentMethod === "googlepay"
                          ? "Google Pay"
                          : selectedPaymentMethod === "applepay"
                            ? "Apple Pay"
                            : selectedPaymentMethod;

      setBookingResult({
        reference: ref,
        therapistName: therapist.name,
        date: formatDisplayDate(selectedDate),
        time: selectedTime,
        amount: totalPrice,
        currency: selectedCurrency,
        paymentMethod: paymentLabel,
      });
      setCurrentStep(4);
      setPaying(false);
    }, 1500);
  }, [selectedPaymentMethod, therapist.name, selectedDate, selectedTime, totalPrice, selectedCurrency]);

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
                therapist={therapist}
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
              slots={MOCK_TIME_SLOTS}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              onContinue={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <StepCurrency
              currencies={CURRENCIES}
              selectedCurrency={selectedCurrency}
              basePrice={therapist.price}
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
              basePrice={therapist.price}
              onPaymentChange={setSelectedPaymentMethod}
              onBack={() => setCurrentStep(2)}
              onContinue={handlePay}
              cardDetails={cardDetails}
              onCardDetailsChange={setCardDetails}
              esewaMobile={esewaMobile}
              onEsewaMobileChange={setEsewaMobile}
              billingCountry={billingCountry}
              onBillingCountryChange={setBillingCountry}
            />
          )}

          {currentStep === 4 && bookingResult && (
            <StepConfirmation
              result={bookingResult}
              currencies={CURRENCIES}
              onDone={onClose}
            />
          )}
        </div>

        {paying && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#1F3D2B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-[#1E2A2E]">Processing payment...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
