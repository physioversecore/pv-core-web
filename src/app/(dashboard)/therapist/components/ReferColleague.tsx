import { ReferralCard } from "@/components/dashboard/ReferralCard";
import { useLang } from "@/context/i18n";

const REFERRAL_CODE = "SAHA-DR-1029";
const REFERRAL_LINK = `https://sahayatri.np/join/${REFERRAL_CODE}`;

export function ReferColleague() {
  const { t } = useLang();
  return (
    <ReferralCard
      eyebrow={t("therapist_dashboard.referColleague")}
      title={t("therapist_dashboard.referTitle")}
      description={t("therapist_dashboard.referDesc")}
      code={REFERRAL_CODE}
      link={REFERRAL_LINK}
      copyLabel={t("therapist_dashboard.copy")}
      shareLabel={t("therapist_dashboard.shareInvite")}
      copiedMessage={t("therapist_dashboard.referralCopied")}
    />
  );
}
