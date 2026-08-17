"use client";

import { PricingCards } from "@/components/ui/pricing-cards";
import { PageShell } from "@/components/PageShell";
import { useLang } from "@/context/i18n";

export default function PackagesPage() {
  const { t } = useLang();

  return (
    <PageShell
      eyebrow={t("packages.eyebrow")}
      title={t("packages.title")}
      subtitle={t("packages.subtitle")}
    >
      <PricingCards />
    </PageShell>
  );
}
