"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/Avatar";
import { useLang } from "@/context/i18n";

interface RateCardProps {
  name: string;
  session: string;
}

export function RateCard({ name, session }: RateCardProps) {
  const { t } = useLang();
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!stars) return toast.error(t("patient_dashboard.pickStarRating"));
    setDone(true);
    toast.success(`${t("patient_dashboard.thanksForRating")} ${name}`);
  };

  return (
    <div className="card-soft p-4">
      <div className="flex items-center gap-3 mb-2">
        <Avatar name={name} size={40} />
        <div>
          <div className="font-medium text-sm">{name}</div>
          <div className="text-xs text-text-light">{session}</div>
        </div>
      </div>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => !done && setStars(n)} aria-label={`${n} star`}>
            <Star size={20} className={n <= stars ? "fill-primary text-primary" : "text-border"} />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={done}
        rows={2}
        placeholder={t("patient_dashboard.whatWentWell")}
        className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm mb-3 disabled:opacity-60"
      />
      <button onClick={submit} disabled={done} className="btn-secondary !py-1.5 !px-4 text-xs disabled:opacity-60">
        {done ? t("common.submitted") : t("common.submitRating")}
      </button>
    </div>
  );
}
