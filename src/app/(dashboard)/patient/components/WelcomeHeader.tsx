import { useLang } from "@/context/i18n";

export function WelcomeHeader() {
  const { t } = useLang();
  return (
    <div>
      <p className="eyebrow mb-2">{t("patient_dashboard.welcomeBack")}</p>
      <h2 className="text-3xl font-display mb-6">{t("patient_dashboard.continueRecovery")}</h2>
    </div>
  );
}
