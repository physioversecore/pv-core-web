import { ReferralCard } from "@/components/dashboard/ReferralCard";
import { useLang } from "@/context/i18n";
import { usePatientReferral } from "@/hooks/usePatientReferral";

export function ReferFriend() {
  const { t } = useLang();
  const { referral, isLoading } = usePatientReferral();

  if (isLoading || !referral) {
    return (
      <section className="mt-6 card-soft p-5 bg-surface/40 border-secondary/20 animate-pulse">
        <div className="h-20 bg-muted rounded-xl" />
      </section>
    );
  }

  return (
    <ReferralCard
      eyebrow={t("patient_dashboard.referFriend")}
      title={t("patient_dashboard.referTitle")}
      description={t("patient_dashboard.referDesc")}
      code={referral.code}
      link={referral.link}
      copyLabel={t("common.copyInviteLink")}
      copiedMessage={t("patient_dashboard.referralCopied")}
    />
  );
}
