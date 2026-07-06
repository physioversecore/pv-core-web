"use client";

import { Reveal } from "@/components/Reveal";
import { HowItWorksSteps } from "@/components/HowItWorksSteps";

export function HowItWorksSection() {
  return (
    <section id="how" className="bg-surface py-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal>
          <p className="eyebrow mb-3">How it works</p>
          <h2 className="text-4xl font-display mb-12 max-w-2xl">Care in three simple steps.</h2>
        </Reveal>
        <HowItWorksSteps />
      </div>
    </section>
  );
}
