"use client";

import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Reveal, CountUp } from "@/components/Reveal";
import { Heart, ShieldCheck, HandHeart, Sparkles } from "lucide-react";

const VALUES = [
  { icon: <ShieldCheck />, t: "Verified always", d: "Every therapist is manually reviewed against NMC records before their first booking." },
  { icon: <Heart />, t: "Human first", d: "Recovery is personal. We match therapists to patients — not just conditions." },
  { icon: <HandHeart />, t: "Access for all", d: "We work with hospitals and NGOs to bring care to those who can't reach clinics." },
  { icon: <Sparkles />, t: "Calm technology", d: "Our platform should feel restful — never noisy, never pushy, always clear." },
];

export default function About() {
  return (
    <PageShell
      eyebrow="About us"
      title="Bringing quality physiotherapy home."
      subtitle="Sahayatri Physio started with a simple observation: recovery happens better at home, but great physiotherapy shouldn't be hard to find."
    >
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 space-y-5 text-text-light">
          <p>Nepal&apos;s clinics are excellent — but they&apos;re often crowded, far, and inaccessible for patients recovering from surgery, stroke, or major injury. Families juggle work, traffic, and unpredictable schedules just to reach an hour of physio.</p>
          <p>We built Sahayatri Physio to flip the script: verified physiotherapists come to you. You book in minutes, we handle the vetting and the logistics, and you focus on getting better.</p>
          <p>Today we work with 180+ NMC-verified physiotherapists across six cities in Nepal, partnering with leading hospitals, and delivering more than 12,000 home visits every year.</p>
        </div>
      </section>

      <section className="py-16 bg-surface/60">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">Our values</p>
            <h2 className="text-3xl font-display mb-10 max-w-2xl">What guides every decision.</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <Reveal key={v.t} delay={i * 80}>
                <div className="card-soft p-6">
                  <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 text-secondary" style={{ background: "#D1E8DF" }}>{v.icon}</div>
                  <div className="font-display text-lg mb-1">{v.t}</div>
                  <p className="text-text-light text-sm">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid grid-cols-2 md:grid-cols-4 text-center">
          {[
            { to: 12400, s: "+", l: "Home visits" },
            { to: 180, s: "+", l: "Therapists" },
            { to: 6, s: "", l: "Cities" },
            { to: 48, s: "\u2605", l: "Avg rating \u00d7 10" },
          ].map((s, i) => (
            <div key={i} className={`py-4 ${i > 0 ? "md:border-l border-border" : ""}`}>
              <div className="font-display text-4xl text-secondary">
                {i === 3 ? <>4.8<span className="text-primary">\u2605</span></> : <><CountUp to={s.to} /><span className="text-primary">{s.s}</span></>}
              </div>
              <div className="text-xs text-text-light mt-2 font-mono uppercase tracking-widest">{i === 3 ? "Average rating" : s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <h2 className="font-display text-3xl mb-4">Want to work with us?</h2>
          <p className="text-text-light mb-6">We&apos;re always looking for verified physiotherapists and hospital partners.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact" className="btn-primary">Get in touch</Link>
            <Link href="/therapists" className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold border border-secondary text-secondary hover:bg-secondary hover:text-white transition">Meet the therapists</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
