"use client";

import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Activity, HeartPulse, Brain, Baby, Stethoscope, ShoppingBag, Pill, Apple, Bone, Dumbbell } from "lucide-react";

const CLINICAL = [
  { icon: <Activity />, title: "Sports Injury Rehab", desc: "ACL, rotator cuff, sprain recovery with progressive strength work." },
  { icon: <HeartPulse />, title: "Post-Surgery Rehab", desc: "Knee, hip, and joint replacement recovery under supervision." },
  { icon: <Brain />, title: "Neuro Rehab", desc: "Stroke, Parkinson's, and spinal cord injury care at home." },
  { icon: <Baby />, title: "Pediatric & Elderly", desc: "Developmental delays, mobility support, and geriatric care." },
  { icon: <Bone />, title: "Orthopedic Care", desc: "Fracture recovery, back and neck pain, posture correction." },
  { icon: <Dumbbell />, title: "Strength & Conditioning", desc: "Post-recovery fitness plans to prevent re-injury." },
];

const SHOP = [
  { icon: <Stethoscope />, title: "Home-visit Booking", desc: "Therapists who come to you.", live: true },
  { icon: <ShoppingBag />, title: "Equipment Rental", desc: "Wheelchairs, crutches, TENS machines." },
  { icon: <Pill />, title: "Medicines", desc: "Recovery medications delivered to your door." },
  { icon: <Apple />, title: "Recovery Nutrition", desc: "Supplements & meal plans tailored to recovery." },
];

export default function Services() {
  return (
    <PageShell
      eyebrow="Our services"
      title="Everything for your recovery."
      subtitle="Clinical rehab, home visits, and a curated shop for equipment, medicine, and recovery nutrition."
    >
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">Clinical care</p>
            <h2 className="text-3xl font-display mb-10 max-w-2xl">Rehabilitation, tailored to your condition.</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CLINICAL.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <div className="card-soft p-6 group hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300">
                  <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 text-pine group-hover:scale-110 group-hover:rotate-6 transition duration-300" style={{ background: "#D1E8DF" }}>{s.icon}</div>
                  <div className="font-display text-lg mb-1">{s.title}</div>
                  <p className="text-slate text-sm">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-sage/60">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">The Sahayatri shop</p>
            <h2 className="text-3xl font-display mb-10 max-w-2xl">Beyond appointments.</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SHOP.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <div className="card-soft p-6 relative group hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300">
                  {s.live ? <span className="chip !bg-pine !text-white absolute top-4 right-4">Live</span> : <span className="chip absolute top-4 right-4">Soon</span>}
                  <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 text-pine" style={{ background: "#D1E8DF" }}>{s.icon}</div>
                  <div className="font-display text-lg mb-1">{s.title}</div>
                  <p className="text-slate text-sm">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <h2 className="font-display text-3xl mb-4">Not sure what you need?</h2>
          <p className="text-slate mb-6">Talk to our care team — we&apos;ll match you to the right specialist.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/find" className="btn-primary">Find a therapist</Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold border border-pine text-pine hover:bg-pine hover:text-white transition">Contact us</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
