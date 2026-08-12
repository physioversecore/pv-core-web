import { ArrowUpRight, Star } from "lucide-react";
import Link from "next/link";
import { Avatar } from "./Avatar";
import type { Therapist } from "@/types";
import { useLang } from "@/context/i18n";

export function TherapistCard({ t: therapist }: { t: Therapist }) {
  const { t } = useLang();
  const photo = therapist.mediaUrls?.split(",")[0];

  return (
    <article className="bg-paper-bright rounded-2xl border-2 border-carbon-soft shadow-[3px_3px_0_var(--color-carbon-soft)] p-5 md:p-8 grid grid-cols-[auto_1fr] lg:grid-cols-1 gap-x-5 items-center lg:justify-items-center text-left lg:text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[3px_3px_0_var(--color-carbon-soft)] h-full">
      <Link
        href={`/therapist/${therapist.id}`}
        className="w-20 h-20 lg:w-32 lg:h-32 rounded-full overflow-hidden mb-0 lg:mb-6 bg-surface border-2 border-carbon-soft block justify-self-start lg:justify-self-center hover:rotate-3 transition-transform [&_*]:!w-full [&_*]:!h-full"
        aria-label={therapist.name}
      >
        {photo ? (
          <img src={photo} alt={therapist.name} className="w-full h-full object-cover" />
        ) : (
          <Avatar name={therapist.name} size={128} />
        )}
      </Link>
      <div className="min-w-0 flex flex-col items-start lg:items-center gap-0.5">
        <h3 className="font-display font-bold text-lg md:text-2xl leading-tight">{therapist.name}</h3>
        <p className="font-mono font-bold uppercase text-xs text-text-light truncate max-w-full">
          {therapist.specialty} • {therapist.city}
        </p>
        <div className="flex items-center gap-1.5 mt-1 mb-0 lg:mb-6">
          <Star size={16} className="fill-volt text-carbon" />
          <span className="font-bold">{therapist.rating}</span>
          <span className="text-text-light ml-1">({therapist.reviews} {t("therapistProfile.reviews")})</span>
        </div>
      </div>
      <Link
        href={`/therapist/${therapist.id}`}
        className="mt-4 md:mt-auto col-span-2 lg:col-span-1 w-full bg-carbon text-paper-bright font-mono font-bold uppercase text-xs md:text-sm rounded-full py-3 md:py-4 text-center hover:bg-olive transition-colors"
      >
        {t("therapistProfile.viewProfile")} →
      </Link>
    </article>
  );
}
