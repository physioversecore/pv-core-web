import { ReferralCard } from "@/components/dashboard/ReferralCard";
import { useLang } from "@/context/i18n";
import { usePatientReferral } from "@/hooks/usePatientReferral";
import { CardSkeleton } from "@/components/SuspenseFallback";

export function ReferFriend() {
  const { t } = useLang();
  const { referral, isLoading } = usePatientReferral();

  if (isLoading) return <CardSkeleton />;
  if (!referral) return null;

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
