"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";

export default function FAQ() {
  const { t } = useLang();

  const GROUPS = [
    {
      group: t("faq.groupBookings"),
      items: [
        { q: t("faq.qHowBook"), a: t("faq.aHowBook") },
        { q: t("faq.qCancelReschedule"), a: t("faq.aCancelReschedule") },
        { q: t("faq.qHowSoon"), a: t("faq.aHowSoon") },
      ],
    },
    {
      group: t("faq.groupTherapists"),
      items: [
        { q: t("faq.qHowVerified"), a: t("faq.aHowVerified") },
        { q: t("faq.qRequestGender"), a: t("faq.aRequestGender") },
      ],
    },
    {
      group: t("faq.groupCoverage"),
      items: [
        { q: t("faq.qWhichCities"), a: t("faq.aWhichCities") },
        { q: t("faq.qPayments"), a: t("faq.aPayments") },
        { q: t("faq.qInsurance"), a: t("faq.aInsurance") },
      ],
    },
  ];

  const [open, setOpen] = useState<string | null>(`${t("faq.groupBookings")}-0`);
  return (
    <PageShell
      eyebrow={t("faq.eyebrow")}
      title={t("faq.title")}
      subtitle={t("faq.subtitle")}
    >
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 space-y-8">
          {GROUPS.map((g) => (
            <div key={g.group}>
              <p className="eyebrow mb-3">{g.group}</p>
              <div className="card-soft divide-y divide-border">
                {g.items.map((it, i) => {
                  const key = `${g.group}-${i}`;
                  const isOpen = open === key;
                  return (
                    <div key={key} className="px-5">
                      <button onClick={() => setOpen(isOpen ? null : key)} className="w-full text-left py-4 flex justify-between items-center font-medium">
                        {it.q}<span className="text-text-light">{isOpen ? "\u2212" : "+"}</span>
                      </button>
                      {isOpen && <p className="text-sm text-text-light pb-4 -mt-1">{it.a}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="text-center pt-4">
            <p className="text-text-light mb-3">{t("faq.ctaTitle")}</p>
            <Link href="/contact" className="btn-primary">{t("faq.ctaSupport")}</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
