import { ReferralCard } from "@/components/dashboard/ReferralCard";
import { useLang } from "@/context/i18n";

const REFERRAL_CODE = "SAHA-PT-2841";
const REFERRAL_LINK = `https://sahayatri.np/r/${REFERRAL_CODE}`;

export function ReferFriend() {
  const { t } = useLang();
  return (
    <ReferralCard
      eyebrow={t("patient_dashboard.referFriend")}
      title={t("patient_dashboard.referTitle")}
      description={t("patient_dashboard.referDesc")}
      code={REFERRAL_CODE}
      link={REFERRAL_LINK}
      copyLabel={t("common.copyLink")}
      shareLabel={t("common.shareInvite")}
      copiedMessage={t("patient_dashboard.referralCopied")}
    />
  );
}
