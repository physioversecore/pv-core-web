import { useLang } from "@/context/i18n";

export function PlatformEarnings() {
  const { t } = useLang();
  return (
    <div className="card-soft p-5">
      <h3 className="font-display text-lg mb-3">{t("admin_dashboard.platformEarnings")}</h3>
      <div className="text-3xl font-display text-secondary">Rs 5,42,300</div>
      <p className="text-xs text-text-light mt-1">{t("admin_dashboard.platformFeeDesc")}</p>
    </div>
  );
}
