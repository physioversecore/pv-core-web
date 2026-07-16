"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { StepIndicator } from "./StepIndicator";
import { TherapistSummaryCard } from "./TherapistSummaryCard";
import { StepDateTime } from "./StepDateTime";
import { StepConfirmation } from "./StepConfirmation";
import { PatientSelectStep } from "./PatientSelectStep";
import { TherapistSelectStep } from "./TherapistSelectStep";
import { StepPayment } from "./StepPayment";
import {
  MOCK_THERAPIST,
  MOCK_TIME_SLOTS,
  MOCK_PATIENTS,
  MOCK_THERAPISTS_LIST,
  NEPAL_PAYMENTS,
  INTERNATIONAL_PAYMENTS,
} from "./mockData";
import type { BookingTherapist, BookingPatient, BookingResult, AdminBookingResult, PaymentMethod } from "./types";

interface BaseProps {
  onClose: () => void;
}

interface PatientModeProps extends BaseProps {
  mode?: "patient";
  therapist?: BookingTherapist;
}

interface AdminModeProps extends BaseProps {
  mode: "admin";
  onBookingCreated?: (result: AdminBookingResult) => void;
}

type Props = PatientModeProps | AdminModeProps;

export default function BookingModal(props: Props) {
  const { onClose, mode = "patient" } = props;
  const [currentStep, setCurrentStep] = useState(mode === "admin" ? 1 : 1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [adminResult, setAdminResult] = useState<AdminBookingResult | null>(null);
  const [paying, setPaying] = useState(false);

  // Admin-only state
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedTherapistId, setSelectedTherapistId] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState("");

  const therapist = mode === "patient" && "therapist" in props && props.therapist
    ? props.therapist
    : mode === "admin"
      ? MOCK_THERAPISTS_LIST.find((t) => t.id === selectedTherapistId) ?? MOCK_THERAPIST
      : MOCK_THERAPIST;

  const patient = mode === "admin"
    ? MOCK_PATIENTS.find((p) => p.id === selectedPatientId)
    : null;

  const formatDisplayDate = (iso: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePatientPay = useCallback(() => {
    setPaying(true);
    setTimeout(() => {
      const ref = "BK-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      setBookingResult({
        reference: ref,
        therapistName: therapist.name,
        date: formatDisplayDate(selectedDate),
        time: selectedTime,
        amount: 0,
        currency: "NPR",
        paymentMethod: "Admin booked",
      });
      setCurrentStep(4);
      setPaying(false);
    }, 1500);
  }, [therapist.name, selectedDate, selectedTime]);

  const handleAdminConfirm = useCallback(() => {
    setPaying(true);
    setTimeout(() => {
      const ref = "BKG-" + (1043 + Math.floor(Math.random() * 100));
      if (patient) {
        setAdminResult({
          reference: ref,
          patientName: patient.name,
          patientId: patient.id,
          patientPhone: patient.phone,
          patientEmail: patient.email,
          therapistName: therapist.name,
          therapistId: therapist.id,
          therapistPhone: "+977-9851-000000",
          therapistEmail: `${therapist.name.toLowerCase().replace(/[^a-z]/g, "")}@sahayatriphysio.com`,
          date: selectedDate,
          time: selectedTime,
          paymentMethod: selectedPaymentId,
          paymentType: [...NEPAL_PAYMENTS, ...INTERNATIONAL_PAYMENTS].find(p => p.id === selectedPaymentId)?.type,
        });
      }
      setCurrentStep(5);
      setPaying(false);
    }, 1200);
  }, [patient, therapist, selectedDate, selectedTime, selectedPaymentId]);

  const stepsWithSummary = mode === "admin"
    ? currentStep >= 3 && currentStep <= 4
    : currentStep >= 1 && currentStep <= 3;

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
          <StepIndicator currentStep={currentStep} mode={mode} />
        </div>

        {currentStep < 4 && stepsWithSummary && (
          <div className="px-5 pb-3">
            <TherapistSummaryCard
              therapist={therapist}
              selectedCurrency="NPR"
              currencies={[{ code: "NPR", name: "Nepalese Rupee", flag: "🇳🇵", symbol: "Rs.", rate: 1 }]}
            />
          </div>
        )}

        <div className="px-5 pb-6">
          {mode === "admin" && currentStep === 1 && (
            <PatientSelectStep
              patients={MOCK_PATIENTS}
              selectedPatientId={selectedPatientId}
              onSelect={(p) => setSelectedPatientId(p.id)}
              onContinue={() => setCurrentStep(2)}
            />
          )}

          {mode === "admin" && currentStep === 2 && (
            <TherapistSelectStep
              therapists={MOCK_THERAPISTS_LIST}
              selectedTherapistId={selectedTherapistId}
              onSelect={(t) => setSelectedTherapistId(t.id)}
              onBack={() => setCurrentStep(1)}
              onContinue={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <StepDateTime
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              slots={MOCK_TIME_SLOTS}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              onContinue={mode === "admin" ? () => setCurrentStep(4) : handlePatientPay}
            />
          )}

          {mode === "admin" && currentStep === 4 && (
            <StepPayment
              selectedPaymentId={selectedPaymentId}
              onSelect={(p) => setSelectedPaymentId(p.id)}
              onBack={() => setCurrentStep(3)}
              onContinue={handleAdminConfirm}
            />
          )}

          {currentStep === 5 && mode === "admin" && adminResult && (
            <div className="space-y-5 text-center">
              <div className="w-20 h-20 rounded-full bg-[#1F3D2B]/10 flex items-center justify-center mx-auto animate-in zoom-in duration-300">
                <span className="text-4xl">✓</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1E2A2E]">Booking created!</h2>
                <p className="text-gray-500 mt-1">Session booked on behalf of patient</p>
              </div>
              <div className="bg-[#F0F0EE] rounded-xl p-4 text-left space-y-2 text-sm">
                <DetailRow label="Patient" value={adminResult.patientName} />
                <DetailRow label="Therapist" value={adminResult.therapistName} />
                <DetailRow label="Date" value={formatDisplayDate(adminResult.date)} />
                <DetailRow label="Time" value={adminResult.time} />
                {adminResult.paymentMethod && (
                  <DetailRow label="Payment" value={adminResult.paymentMethod} />
                )}
                <DetailRow label="Booking ref." value={adminResult.reference} bold />
              </div>
              <button
                onClick={() => {
                  if ("onBookingCreated" in props && props.onBookingCreated) {
                    props.onBookingCreated(adminResult);
                  }
                  onClose();
                }}
                className="w-full py-3 rounded-xl font-semibold bg-[#1F3D2B] text-white hover:bg-[#1F3D2B]/90 transition-all"
              >
                Done
              </button>
            </div>
          )}

          {currentStep === 4 && mode === "patient" && bookingResult && (
            <StepConfirmation
              result={bookingResult}
              currencies={[{ code: "NPR", name: "Nepalese Rupee", flag: "🇳🇵", symbol: "Rs.", rate: 1 }]}
              onDone={onClose}
            />
          )}
        </div>

        {paying && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#1F3D2B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-[#1E2A2E]">
                {mode === "admin" ? "Creating booking..." : "Processing payment..."}
              </p>
            </div>
          </div>
        )}
      </div>
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
