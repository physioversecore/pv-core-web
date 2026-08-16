import { Star } from "lucide-react";
import { Avatar } from "./Avatar";
import { BookButton } from "./BookButton";
import { npr } from "@/utils/format";
import type { Therapist } from "@/types";
import { useLang } from "@/context/i18n";

export function TherapistCard({
  t: therapist,
  onBook,
  variant = "light",
}: {
  t: Therapist;
  onBook: (t: Therapist) => void;
  variant?: "light" | "dark";
}) {
  const { t } = useLang();
  const dark = variant === "dark";
  return (
    <div className={`${dark ? "card-glass" : "card-soft"} p-4 flex flex-col gap-3 hover:shadow-md transition`}>
      <div className="flex items-start gap-3">
        <Avatar name={therapist.name} size={48} src={therapist.mediaUrls?.split(",")[0]} />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{therapist.name}</div>
          <div className={`text-xs truncate ${dark ? "text-white/60" : "text-text-light"}`}>{therapist.specialty} · {therapist.city}</div>
          <div className={`flex items-center gap-1 mt-1 text-xs ${dark ? "text-white/60" : "text-text-light"}`}>
            <Star size={12} className={dark ? "fill-voltage-lime text-voltage-lime" : "fill-primary text-primary"} /> <span className={`font-medium ${dark ? "text-white" : "text-text"}`}>{therapist.rating}</span> ({therapist.reviews})
          </div>
        </div>
      </div>
      <div className={`flex items-center justify-between pt-2 border-t ${dark ? "border-white/10" : "border-border"}`}>
        <div className="text-sm"><span className="font-semibold">{npr(therapist.price)}</span><span className={`text-xs ${dark ? "text-white/60" : "text-text-light"}`}> {t("therapists.perSession")}</span></div>
        <BookButton onClick={() => onBook(therapist)} size="sm" />
      </div>
    </div>
  );
}
