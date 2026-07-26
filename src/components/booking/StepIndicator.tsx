"use client";

import { cn } from "@/utils/cn";

const PATIENT_STEPS = [
  { num: 1, label: "Date & time" },
  { num: 2, label: "Currency" },
  { num: 3, label: "Payment" },
  { num: 4, label: "Confirm" },
];

const ADMIN_STEPS = [
  { num: 1, label: "Patient" },
  { num: 2, label: "Therapist" },
  { num: 3, label: "Date & time" },
  { num: 4, label: "Payment" },
  { num: 5, label: "Confirm" },
];

export function StepIndicator({
  currentStep,
  mode = "patient",
}: {
  currentStep: number;
  mode?: "patient" | "admin";
}) {
  const steps = mode === "admin" ? ADMIN_STEPS : PATIENT_STEPS;

  return (
    <div className="flex items-center justify-between px-1">
      {steps.map((step, i) => {
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
            {i < steps.length - 1 && (
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
