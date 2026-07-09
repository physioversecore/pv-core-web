"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { useLang } from "@/context/i18n";
import { useSubmitReview } from "@/hooks/useTherapistsToRate";
import { formatType } from "@/lib/format";

interface RateCardProps {
  sessionId: string;
  therapistName: string;
  sessionDate: string;
  sessionType: string;
}

export function RateCard({ sessionId, therapistName, sessionDate, sessionType }: RateCardProps) {
  const { t } = useLang();
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const submitMutation = useSubmitReview();
  const done = submitMutation.isSuccess;
  const isPending = submitMutation.isPending;

  const submit = () => {
    if (!stars) return;
    submitMutation.mutate({ sessionId, rating: stars, comment: text || undefined });
  };

  const dateStr = new Date(sessionDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="card-soft p-4">
      <div className="flex items-center gap-3 mb-2">
        <Avatar name={therapistName} size={40} />
        <div>
          <div className="font-medium text-sm">{therapistName}</div>
          <div className="text-xs text-text-light">{dateStr} · {formatType(sessionType)}</div>
        </div>
      </div>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => !done && !isPending && setStars(n)} aria-label={`${n} star`}>
            <Star size={20} className={n <= stars ? "fill-primary text-primary" : "text-border"} />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={done || isPending}
        rows={2}
        placeholder={t("patient_dashboard.whatWentWell")}
        className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm mb-3 disabled:opacity-60"
      />
      <button
        onClick={submit}
        disabled={done || isPending || !stars}
        className="btn-secondary !py-1.5 !px-4 text-xs disabled:opacity-60"
      >
        {isPending ? t("common.submitting") : done ? t("common.submitted") : t("common.submitRating")}
      </button>
    </div>
  );
}
