import Link from "next/link";
import { Star } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { useLang } from "@/context/i18n";

const RATINGS = [
  { id: "g1", name: "Sita Gurung", stars: 5, text: "Very professional and patient. Exercises helped a lot." },
  { id: "g2", name: "Hari Bahadur Rai", stars: 5, text: "Always on time and explains everything clearly. Recommended!" },
];

export function PublicProfile() {
  const { t } = useLang();
  return (
    <section className="grid lg:grid-cols-2 gap-5">
      <div className="card-soft p-5">
        <h3 className="font-display text-lg mb-3">{t("therapist_dashboard.myPublicProfile")}</h3>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/40">
          <Avatar name="Rajesh Shrestha" size={44} />
          <div className="flex-1 min-w-0">
            <div className="font-medium">Rajesh Shrestha</div>
            <div className="text-xs text-text-light">
              {`Sports injury & post-surgery · 6 ${t("therapist_dashboard.experienceYears")}`}
            </div>
            <div className="flex items-center gap-1 mt-1 text-primary text-sm">
              {"★★★★★"} <span className="font-mono text-xs text-secondary ml-1">4.9</span>
              <span className="text-xs text-text-light ml-1">(38 patient reviews)</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-text-light mt-3 leading-relaxed">{t("therapist_dashboard.starRatingDesc")}</p>
        <Link href="/therapist/profile" className="inline-block mt-3 text-xs text-secondary hover:underline">
          {t("therapist_dashboard.editProfile")}
        </Link>
      </div>

      <div className="card-soft p-5">
        <h3 className="font-display text-lg mb-3">{t("therapist_dashboard.recentPatientRatings")}</h3>
        <div className="space-y-3">
          {RATINGS.map((r) => (
            <div key={r.id} className="p-3 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{r.name}</span>
                <span className="text-primary text-sm flex items-center gap-0.5">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star key={i} size={12} className="fill-primary text-primary" />
                  ))}
                </span>
              </div>
              <p className="text-xs text-text-light italic">"{r.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
