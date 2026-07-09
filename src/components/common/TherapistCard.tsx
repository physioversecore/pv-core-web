import { Star } from "lucide-react";
import { Avatar } from "./Avatar";
import { BookButton } from "./BookButton";
import { npr } from "@/utils/format";
import type { Therapist } from "@/types";
import { useLang } from "@/context/i18n";

export function TherapistCard({ t: therapist, onBook }: { t: Therapist; onBook: (t: Therapist) => void }) {
  const { t } = useLang();
  return (
    <div className="card-soft p-4 flex flex-col gap-3 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <Avatar name={therapist.name} size={48} />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{therapist.name}</div>
          <div className="text-xs text-text-light truncate">{therapist.specialty} · {therapist.city}</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-text-light">
            <Star size={12} className="fill-primary text-primary" /> <span className="font-medium text-text">{therapist.rating}</span> ({therapist.reviews})
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="text-sm"><span className="font-semibold">{npr(therapist.price)}</span><span className="text-xs text-text-light"> {t("therapists.perSession")}</span></div>
        <BookButton onClick={() => onBook(therapist)} size="sm" />
      </div>
    </div>
  );
}
