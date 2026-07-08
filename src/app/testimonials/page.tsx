"use client";

import { Star, Quote } from "lucide-react";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Avatar } from "@/components/Avatar";

export default function Testimonials() {
  const { t } = useLang();

  const REVIEWS = [
    { name: t("testimonials.reviewer1Name"), city: t("testimonials.reviewer1City"), rating: 5, q: t("testimonials.reviewer1Quote") },
    { name: t("testimonials.reviewer2Name"), city: t("testimonials.reviewer2City"), rating: 5, q: t("testimonials.reviewer2Quote") },
    { name: t("testimonials.reviewer3Name"), city: t("testimonials.reviewer3City"), rating: 4, q: t("testimonials.reviewer3Quote") },
    { name: t("testimonials.reviewer4Name"), city: t("testimonials.reviewer4City"), rating: 5, q: t("testimonials.reviewer4Quote") },
    { name: t("testimonials.reviewer5Name"), city: t("testimonials.reviewer5City"), rating: 5, q: t("testimonials.reviewer5Quote") },
    { name: t("testimonials.reviewer6Name"), city: t("testimonials.reviewer6City"), rating: 5, q: t("testimonials.reviewer6Quote") },
  ];

  return (
    <PageShell
      eyebrow={t("testimonials.eyebrow")}
      title={t("testimonials.title")}
      subtitle={t("testimonials.subtitle")}
    >
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REVIEWS.map((r, i) => (
              <Reveal key={r.name} delay={(i % 3) * 100}>
                <figure className="card-soft p-6 h-full flex flex-col">
                  <Quote size={22} className="text-primary mb-3" />
                  <blockquote className="text-text text-sm leading-relaxed flex-1">&ldquo;{r.q}&rdquo;</blockquote>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                    <Avatar name={r.name} size={40} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{r.name}</div>
                      <div className="text-xs text-text-light">{r.city}</div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: r.rating }).map((_, k) => (
                        <Star key={k} size={12} className="fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
