"use client";

import { useLang } from "@/context/i18n";
import { LegalLayout, type LegalSection } from "@/components/legal/LegalLayout";

const SECTIONS: LegalSection[] = [
  {
    heading: "Acceptance of terms",
    paragraphs: [
      "By accessing or using Sahayatri Physio, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our platform.",
    ],
  },
  {
    heading: "Our services",
    paragraphs: [
      "Sahayatri Physio connects patients with verified, licensed physiotherapists for home-visit sessions in Nepal. We are a technology platform, not a medical provider. Therapists are independent professionals.",
    ],
  },
  {
    heading: "User accounts",
    paragraphs: [
      "You must provide accurate information when creating an account. Patients must be at least 18 years old or supervised by a guardian. Therapists must hold a valid NMC license and pass our verification process.",
    ],
  },
  {
    heading: "Bookings and cancellations",
    paragraphs: [
      "Bookings are confirmed once payment is received. Cancellations made at least 24 hours before the scheduled session are eligible for a full refund. Late cancellations may be charged.",
    ],
  },
  {
    heading: "Payments",
    paragraphs: [
      "Session fees are displayed before booking. We process payments through secure third-party providers. Therapists receive payouts according to the schedule agreed upon during onboarding.",
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "Sahayatri Physio is not liable for medical outcomes, treatment decisions, or actions taken by independent therapists. We do our best to verify credentials, but users should exercise their own judgment.",
    ],
  },
  {
    heading: "Governing law",
    paragraphs: [
      "These terms are governed by the laws of Nepal. Any disputes will be resolved in the courts of Kathmandu.",
    ],
  },
  {
    heading: "Changes to terms",
    paragraphs: [
      "We may update these terms from time to time. Continued use of the platform after changes means you accept the revised terms.",
    ],
  },
  {
    heading: "Contact us",
    paragraphs: [
      "For questions about these terms, email care@sahayatriphysio.com or call +977 1 555 0199.",
    ],
  },
];

export default function TermsPage() {
  const { t } = useLang();
  return (
    <LegalLayout
      eyebrow={t("legal.eyebrow")}
      title={t("legal.termsTitle")}
      subtitle={t("legal.termsSubtitle")}
      updatedLabel={t("legal.lastUpdated")}
      sections={SECTIONS}
    />
  );
}