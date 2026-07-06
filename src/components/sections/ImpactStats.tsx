"use client";

import { Reveal, CountUp } from "@/components/Reveal";
import { PlusField } from "@/components/PlusField";
import { impactStats } from "@/lib/landing-data";

export function ImpactStats() {
  return (
    <section className="relative py-16 bg-background">
      <PlusField count={10} seed={3} />
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 grid grid-cols-2 md:grid-cols-4">
        {impactStats.map((s, i) => (
          <Reveal key={i} delay={i * 80}>
            <div className={`text-center py-4 ${i > 0 ? "md:border-l border-border" : ""}`}>
              <div className="font-display text-4xl lg:text-5xl text-secondary">
                {s.isRating
                  ? <>4.8<span className="text-primary">★</span></>
                  : <><CountUp to={s.value} /><span className="text-primary">{s.suffix}</span></>}
              </div>
              <div className="text-xs text-text-light mt-2 font-mono uppercase tracking-widest">
                {s.isRating ? "Average rating" : s.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
