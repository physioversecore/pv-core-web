"use client";

import { ShieldCheck, Star } from "lucide-react";
import { Avatar } from "./Avatar";
import { npr } from "@/utils/format";
import { useLang } from "@/context/i18n";
import type { Therapist } from "@/types";

export function TherapistJobCard({
  t: therapist,
  onBook,
}: {
  t: Therapist;
  onBook: (t: Therapist) => void;
}) {
  const { t } = useLang();
  return (
    <div className="bg-white border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-secondary/25 transition-all duration-200">
      <div className="flex items-center gap-3">
        <Avatar name={therapist.name} size={44} src={therapist.mediaUrls?.split(",")[0]} />
        <div className="min-w-0">
          <div className="font-bold text-[15px] text-text truncate">{therapist.name}</div>
          <div className="text-xs text-text-light truncate">{therapist.city}</div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-lg font-bold text-text leading-none">
            {npr(therapist.price)}
            <span className="text-xs font-normal text-text-light"> {t("therapists.perSession")}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs shrink-0">
          <Star className="w-3.5 h-3.5 fill-primary text-primary" />
          <span className="font-semibold text-text">{therapist.rating}</span>
          <span className="text-text-light">({therapist.reviews})</span>
        </div>
      </div>

      <p className="text-xs text-text-muted leading-relaxed">
        {therapist.specialty} · {therapist.gender}
      </p>

      <div className="mt-auto pt-1 flex items-center justify-between gap-2 border-t border-border">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary">
          <ShieldCheck size={14} />
          {t("find.verified")}
        </span>
        <button
          onClick={() => onBook(therapist)}
          className="px-3.5 py-1.5 rounded-full border border-border text-sm font-semibold text-text transition-colors hover:border-secondary hover:text-secondary"
        >
          {t("common.book")}
        </button>
      </div>
    </div>
  );
}
