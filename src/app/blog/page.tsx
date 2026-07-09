"use client";

import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Clock } from "lucide-react";

export default function Blog() {
  const { t } = useLang();

  const POSTS = [
    { tag: t("blog.post1Tag"), title: t("blog.post1Title"), desc: t("blog.post1Desc"), read: t("blog.post1Read"), accent: "linear-gradient(135deg,var(--color-secondary) 0%,#3F7965 100%)" },
    { tag: t("blog.post2Tag"), title: t("blog.post2Title"), desc: t("blog.post2Desc"), read: t("blog.post2Read"), accent: "linear-gradient(135deg,var(--color-primary) 0%,#F4C778 100%)" },
    { tag: t("blog.post3Tag"), title: t("blog.post3Title"), desc: t("blog.post3Desc"), read: t("blog.post3Read"), accent: "linear-gradient(135deg,#7A3535 0%,#C97070 100%)" },
    { tag: t("blog.post4Tag"), title: t("blog.post4Title"), desc: t("blog.post4Desc"), read: t("blog.post4Read"), accent: "linear-gradient(135deg,var(--color-secondary) 0%,#3F7965 100%)" },
    { tag: t("blog.post5Tag"), title: t("blog.post5Title"), desc: t("blog.post5Desc"), read: t("blog.post5Read"), accent: "linear-gradient(135deg,var(--color-primary) 0%,#F4C778 100%)" },
    { tag: t("blog.post6Tag"), title: t("blog.post6Title"), desc: t("blog.post6Desc"), read: t("blog.post6Read"), accent: "linear-gradient(135deg,#7A3535 0%,#C97070 100%)" },
  ];

  return (
    <PageShell
      eyebrow={t("blog.eyebrow")}
      title={t("blog.title")}
      subtitle={t("blog.subtitle")}
    >
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {POSTS.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 100}>
              <article className="card-soft overflow-hidden group hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300">
                <div className="h-40 relative" style={{ background: p.accent }}>
                  <span className="absolute top-3 left-3 chip !bg-white/90 !text-secondary">{p.tag}</span>
                </div>
                <div className="p-5">
                  <div className="font-display text-lg mb-2 leading-snug">{p.title}</div>
                  <p className="text-text-light text-sm mb-3">{p.desc}</p>
                  <div className="flex items-center gap-1 text-xs text-text-light"><Clock size={12} /> {p.read}</div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
