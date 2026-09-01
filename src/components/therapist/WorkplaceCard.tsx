"use client";

import { MapPin, Phone, Clock } from "lucide-react";
import { useLang } from "@/context/i18n";
import type { Clinic } from "@/types";

/**
 * Shown in place of the booking widget for an information-only therapist.
 * They are directory entries visited at their workplace, and the API rejects
 * a booking for them outright — so the page offers directions, not a slot.
 */
export function WorkplaceCard({ clinic }: { clinic?: Clinic | null }) {
  const { t } = useLang();

  return (
    <div className="card-neo p-6 flex flex-col gap-5">
      <div className="border-b border-hairline pb-4">
        <h2 className="font-display font-extrabold uppercase tracking-tight text-xl">
          {t("therapist_profile.whereToVisit")}
        </h2>
        <p className="text-xs text-ash mt-1">{t("therapist_profile.infoOnlyNote")}</p>
      </div>

      {clinic ? (
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-bold text-carbon">{clinic.name}</p>
            {(clinic.area || clinic.city) && (
              <p className="text-sm text-ash mt-0.5">
                {[clinic.area, clinic.city].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          {clinic.address && (
            <div className="flex gap-2 items-start">
              <MapPin size={14} className="mt-0.5 shrink-0 text-ash" />
              <p className="text-sm text-carbon">{clinic.address}</p>
            </div>
          )}

          {clinic.hours && (
            <div className="flex gap-2 items-start">
              <Clock size={14} className="mt-0.5 shrink-0 text-ash" />
              <p className="text-sm text-carbon">{clinic.hours}</p>
            </div>
          )}

          {clinic.phone && (
            <div className="flex gap-2 items-start">
              <Phone size={14} className="mt-0.5 shrink-0 text-ash" />
              <a href={`tel:${clinic.phone}`} className="text-sm text-carbon hover:underline">
                {clinic.phone}
              </a>
            </div>
          )}

          {clinic.services?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {clinic.services.map((s) => (
                <span key={s} className="chip !text-[0.6rem]">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        // The therapist is listed information-only but no workplace has been
        // attached yet, so there is nowhere to send the patient.
        <p className="text-sm text-ash">{t("therapist_profile.noWorkplaceYet")}</p>
      )}
    </div>
  );
}
