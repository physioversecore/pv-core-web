"use client";

import { Reveal } from "@/components/Reveal";

interface Step {
  n: string;
  t: string;
  d: string;
}

interface HowItWorksStepsProps {
  steps?: Step[];
}

const DEFAULT_STEPS: Step[] = [
  { n: "01", t: "Sign up & search", d: "Create your account, filter by location, condition, and gender." },
  { n: "02", t: "Book & pay", d: "Pick date and time. Pay via eSewa, Khalti, or cash on visit." },
  { n: "03", t: "Recover at home", d: "Your therapist arrives, treats you, and uploads a session report." },
];

export function HowItWorksSteps({ steps = DEFAULT_STEPS }: HowItWorksStepsProps) {
  return (
    <div className="relative">
      <svg
        aria-hidden
        className="hidden md:block absolute left-0 right-0 top-14 pointer-events-none"
        height="2"
        width="100%"
        preserveAspectRatio="none"
      >
        <line
          x1="12%"
          x2="88%"
          y1="1"
          y2="1"
          stroke="var(--color-secondary)"
          strokeOpacity="0.35"
          strokeWidth="2"
          strokeDasharray="6 8"
        />
      </svg>
      <div className="relative grid md:grid-cols-3 gap-5">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 120}>
            <div className="card-soft p-6 hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300">
              <div className="w-10 h-10 rounded-full bg-secondary text-white grid place-items-center font-mono text-sm mb-4">
                {s.n}
              </div>
              <div className="font-display text-xl mb-2">{s.t}</div>
              <p className="text-text-light text-sm">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
