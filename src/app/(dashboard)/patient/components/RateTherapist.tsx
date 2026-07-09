"use client";

import { useLang } from "@/context/i18n";
import { useTherapistsToRate } from "@/hooks/useTherapistsToRate";
import { RateCard } from "./RateCard";
import { CardSkeleton } from "@/components/SuspenseFallback";

export function RateTherapist() {
  const { t } = useLang();
  const { therapistsToRate, isLoading } = useTherapistsToRate();

  if (isLoading) return <CardSkeleton />;
  if (therapistsToRate.length === 0) return null;

  return (
    <div>
      <h3 className="font-display text-xl mb-1">{t("patient_dashboard.rateYourTherapist")}</h3>
      <p className="text-sm text-text-light mb-4">{t("patient_dashboard.rateDesc")}</p>
      <div className="grid md:grid-cols-2 gap-4">
        {therapistsToRate.map((r) => (
          <RateCard
            key={r.sessionId}
            sessionId={r.sessionId}
            therapistName={r.therapistName}
            sessionDate={r.sessionDate}
            sessionType={r.sessionType}
          />
        ))}
      </div>
    </div>
  );
}
