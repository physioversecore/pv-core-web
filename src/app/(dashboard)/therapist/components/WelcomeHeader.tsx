import { useLang } from "@/context/i18n";

export function WelcomeHeader({ name }: { name?: string }) {
  const { t } = useLang();
  const firstName = name?.split(" ").filter(Boolean).pop() ?? "";
  return (
    <div>
      <p className="eyebrow mb-2">{t("therapist_dashboard.today")}{firstName ? `, ${firstName}` : ""}</p>
      <h2 className="text-3xl font-display mb-6">{t("therapist_dashboard.greeting")}</h2>
    </div>
  );
}
