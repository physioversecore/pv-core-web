"use client";

import { useLang } from "@/context/i18n";
import { LegalLayout, type LegalSection } from "@/components/legal/LegalLayout";

const SECTIONS: LegalSection[] = [
  {
    heading: "Introduction",
    paragraphs: [
      "Sahayatri Physio (\u201cwe,\u201d \u201cus,\u201d or \u201cour\u201d) operates a home-visit physiotherapy platform in Nepal. This Privacy Policy explains how we collect, use, store, and share your information when you use our website, mobile application, and services.",
    ],
  },
  {
    heading: "Information we collect",
    bullets: [
      "Account information: name, phone number, email address, date of birth, and gender.",
      "Health information: medical history, injury details, prescriptions, session notes, and progress records.",
      "Therapist information: NMC license number, qualifications, experience, bank details for payouts, and verification documents.",
      "Usage data: device information, IP address, browser type, and pages visited.",
      "Location data: approximate address and service area needed to match you with nearby therapists.",
    ],
  },
  {
    heading: "How we use your information",
    paragraphs: [
      "We use your information to provide and improve our services, verify therapists, process bookings and payments, communicate appointment reminders, generate session reports, and comply with legal obligations.",
    ],
  },
  {
    heading: "How we share information",
    paragraphs: [
      "We only share information with the therapist assigned to your session, payment processors, and service providers who help us operate the platform. We do not sell your personal information to third parties.",
    ],
  },
  {
    heading: "Data security",
    paragraphs: [
      "We use encryption, access controls, and regular security reviews to protect your data. However, no online service is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      "You can access, update, or delete your account information at any time from your dashboard. If you have questions about your data, contact us at care@sahayatriphysio.com.",
    ],
  },
  {
    heading: "Contact us",
    paragraphs: [
      "For privacy-related questions, email us at care@sahayatriphysio.com or call +977 1 555 0199.",
    ],
  },
];

export default function PrivacyPage() {
  const { t } = useLang();
  return (
    <LegalLayout
      eyebrow={t("legal.eyebrow")}
      title={t("legal.privacyTitle")}
      subtitle={t("legal.privacySubtitle")}
      updatedLabel={t("legal.lastUpdated")}
      sections={SECTIONS}
    />
  );
}