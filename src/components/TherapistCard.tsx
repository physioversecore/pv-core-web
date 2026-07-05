import { Star } from "lucide-react";
import { Avatar } from "./Avatar";
import { npr } from "@/lib/cart";
import type { Therapist } from "@/lib/mock";

export function TherapistCard({ t, onBook }: { t: Therapist; onBook: (t: Therapist) => void }) {
  return (
    <div className="card-soft p-4 flex flex-col gap-3 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <Avatar name={t.name} size={48} />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{t.name}</div>
          <div className="text-xs text-text-light truncate">{t.specialty} · {t.city}</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-text-light">
            <Star size={12} className="fill-primary text-primary" /> <span className="font-medium text-text">{t.rating}</span> ({t.reviews})
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="text-sm"><span className="font-semibold">{npr(t.price)}</span><span className="text-xs text-text-light"> /session</span></div>
        <button onClick={() => onBook(t)} className="btn-primary !py-1.5 !px-4 text-sm">Book</button>
      </div>
    </div>
  );
}
