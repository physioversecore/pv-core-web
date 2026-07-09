import { useLang } from "@/context/i18n";

export function WelcomeHeader({ name }: { name?: string }) {
  const { t } = useLang();
  const firstName = name?.split(" ")[0] ?? "";
  return (
    <div>
      <p className="eyebrow mb-2">{t("patient_dashboard.welcomeBack")}{firstName ? `, ${firstName}` : ""}</p>
      <h2 className="text-3xl font-display mb-6">{t("patient_dashboard.continueRecovery")}</h2>
    </div>
  );
}
