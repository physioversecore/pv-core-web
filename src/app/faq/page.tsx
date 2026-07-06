"use client";

import { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";

const GROUPS = [
  {
    group: "Bookings",
    items: [
      { q: "How do I book a session?", a: "Sign up, choose a therapist from Find a Therapist, pick a slot, and pay. You'll get a confirmation email and SMS." },
      { q: "Can I cancel or reschedule?", a: "Yes — up to 6 hours before your visit for a full refund. Rescheduling is free from your patient dashboard." },
      { q: "How soon can a therapist arrive?", a: "Same-day bookings are available in Kathmandu Valley subject to availability. Otherwise up to 30 days in advance." },
    ],
  },
  {
    group: "Therapists & Verification",
    items: [
      { q: "How are therapists verified?", a: "Every physiotherapist must upload their Nepal Medical Council (NMC) license and certifications. Our team reviews within 24 hours." },
      { q: "Can I request a specific gender?", a: "Yes. Use the gender filter on the Find a Therapist page to book comfortably." },
    ],
  },
  {
    group: "Coverage & Payments",
    items: [
      { q: "Which cities do you cover?", a: "Kathmandu, Lalitpur, Bhaktapur, Pokhara, Chitwan, and Biratnagar. More cities coming soon." },
      { q: "How are payments handled?", a: "We accept eSewa, Khalti, and cash on visit. All transactions are secured and receipted." },
      { q: "Do you support insurance?", a: "Not yet — we're piloting insurance partnerships with select providers in 2026." },
    ],
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<string | null>("Bookings-0");
  return (
    <PageShell
      eyebrow="Frequently asked"
      title="Answers to what you're wondering."
      subtitle="If your question isn't here, our care team is a message away."
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
            <p className="text-text-light mb-3">Still have questions?</p>
            <Link href="/contact" className="btn-primary">Contact support</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
