"use client";

import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Clock } from "lucide-react";

const POSTS = [
  { tag: "Recovery", t: "5 gentle exercises to do after a knee replacement", d: "Simple daily movements to rebuild range of motion in the first two weeks.", read: "6 min read", accent: "linear-gradient(135deg,var(--color-secondary) 0%,#3F7965 100%)" },
  { tag: "Sports", t: "Preventing ACL re-injury: what returning athletes miss", d: "The three neuromuscular checkpoints most rehab programs skip.", read: "8 min read", accent: "linear-gradient(135deg,var(--color-primary) 0%,#F4C778 100%)" },
  { tag: "Stroke", t: "Home-based stroke rehab in Nepal: what to expect", d: "A parent's guide to setting up a home rehab routine for a loved one.", read: "10 min read", accent: "linear-gradient(135deg,#7A3535 0%,#C97070 100%)" },
  { tag: "Pediatric", t: "Detecting developmental delays early", d: "The signs to watch for from birth to age 3, and when to book an assessment.", read: "5 min read", accent: "linear-gradient(135deg,var(--color-secondary) 0%,#3F7965 100%)" },
  { tag: "Elderly", t: "Fall prevention at home for seniors", d: "Small changes around the house that dramatically reduce fall risk.", read: "7 min read", accent: "linear-gradient(135deg,var(--color-primary) 0%,#F4C778 100%)" },
  { tag: "Nutrition", t: "Foods that speed up soft-tissue healing", d: "What to eat during the first two weeks after a sprain or strain.", read: "4 min read", accent: "linear-gradient(135deg,#7A3535 0%,#C97070 100%)" },
];

export default function Blog() {
  return (
    <PageShell
      eyebrow="Blog"
      title="Recovery stories, tips, and expert guides."
      subtitle="Written by our physiotherapists — practical advice you can start applying today."
    >
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {POSTS.map((p, i) => (
            <Reveal key={p.t} delay={(i % 3) * 100}>
              <article className="card-soft overflow-hidden group hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300">
                <div className="h-40 relative" style={{ background: p.accent }}>
                  <span className="absolute top-3 left-3 chip !bg-white/90 !text-secondary">{p.tag}</span>
                </div>
                <div className="p-5">
                  <div className="font-display text-lg mb-2 leading-snug">{p.t}</div>
                  <p className="text-text-light text-sm mb-3">{p.d}</p>
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
