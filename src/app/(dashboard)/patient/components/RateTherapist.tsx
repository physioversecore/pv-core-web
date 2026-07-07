import { useLang } from "@/context/i18n";
import { RateCard } from "./RateCard";

const RATE_LIST = [
  { id: "r1", name: "Rajesh Shrestha", session: "Session on Jun 10" },
  { id: "r2", name: "Anita Tamang", session: "Session on Jun 3" },
];

export function RateTherapist() {
  const { t } = useLang();
  return (
    <div>
      <h3 className="font-display text-xl mb-1">{t("patient_dashboard.rateYourTherapist")}</h3>
      <p className="text-sm text-text-light mb-4">{t("patient_dashboard.rateDesc")}</p>
      <div className="grid md:grid-cols-2 gap-4">
        {RATE_LIST.map((r) => (
          <RateCard key={r.id} name={r.name} session={r.session} />
        ))}
      </div>
    </div>
  );
}
