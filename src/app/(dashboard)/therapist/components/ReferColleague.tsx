import { ReferralCard } from "@/components/dashboard/ReferralCard";
import { useLang } from "@/context/i18n";
import { useTherapistDashboard } from "@/hooks/useTherapistDashboard";
import { CardSkeleton } from "@/components/SuspenseFallback";

export function ReferColleague() {
  const { t } = useLang();
  const { dashboard, isLoading } = useTherapistDashboard();

  if (isLoading) return <CardSkeleton />;
  if (!dashboard) return null;

  return (
    <ReferralCard
      eyebrow={t("therapist_dashboard.referColleague")}
      title={t("therapist_dashboard.referTitle")}
      description={t("therapist_dashboard.referDesc")}
      code={dashboard.referralCode}
      link={dashboard.referralLink}
      copyLabel={t("therapist_dashboard.copyInviteLink")}
      copiedMessage={t("therapist_dashboard.referralCopied")}
    />
  );
}
