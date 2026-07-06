"use client";

import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { CalendarClock, CreditCard, Home, ShieldCheck, Star, ClipboardList } from "lucide-react";

const STEPS = [
  { n: "01", t: "Sign up & search", d: "Create your account, filter by location, condition, and gender. Read verified reviews before you book." },
  { n: "02", t: "Book & pay", d: "Pick a date and time that fits. Pay via eSewa, Khalti, or cash on visit — with a full refund window." },
  { n: "03", t: "Recover at home", d: "Your therapist arrives on time, treats you at home, uploads a session report and next-visit plan." },
];

const GUARANTEES = [
  { icon: <ShieldCheck />, t: "NMC-verified therapists", d: "Every therapist's Nepal Medical Council license is manually reviewed." },
  { icon: <CalendarClock />, t: "Flexible scheduling", d: "Book same-day or up to 30 days in advance, 7 days a week." },
  { icon: <CreditCard />, t: "Secure payments", d: "eSewa, Khalti, or cash. Full refund up to 6 hours before your visit." },
  { icon: <ClipboardList />, t: "Session reports", d: "Every visit ends with an uploaded report and progress notes." },
  { icon: <Home />, t: "Care at home", d: "Skip the traffic. Recover in the comfort of your own home." },
  { icon: <Star />, t: "Rated by real patients", d: "Only verified patients can leave a review after their session." },
];

export default function HowItWorks() {
  return (
    <PageShell
      eyebrow="How it works"
      title="Care in three simple steps."
      subtitle="From your first search to a fully uploaded session report — everything runs through one calm, verified flow."
    >
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="relative">
            <svg aria-hidden className="hidden md:block absolute left-0 right-0 top-14 pointer-events-none" height="2" width="100%" preserveAspectRatio="none">
              <line x1="12%" x2="88%" y1="1" y2="1" stroke="var(--color-secondary)" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="6 8" />
            </svg>
            <div className="relative grid md:grid-cols-3 gap-5">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 120}>
                  <div className="card-soft p-6 hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300">
                    <div className="w-10 h-10 rounded-full bg-secondary text-white grid place-items-center font-mono text-sm mb-4">{s.n}</div>
                    <div className="font-display text-xl mb-2">{s.t}</div>
                    <p className="text-text-light text-sm">{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface/60">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">Our promise</p>
            <h2 className="text-3xl font-display mb-10 max-w-2xl">Everything you&apos;d want from home physio.</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GUARANTEES.map((g, i) => (
              <Reveal key={g.t} delay={i * 80}>
                <div className="card-soft p-6">
                  <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 text-secondary" style={{ background: "#D1E8DF" }}>{g.icon}</div>
                  <div className="font-display text-lg mb-1">{g.t}</div>
                  <p className="text-text-light text-sm">{g.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <h2 className="font-display text-3xl mb-4">Ready to book your first session?</h2>
          <p className="text-text-light mb-6">Browse verified physiotherapists near you and get started in minutes.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/find" className="btn-primary">Find a therapist</Link>
            <Link href="/services" className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold border border-secondary text-secondary hover:bg-secondary hover:text-white transition">Explore services</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
