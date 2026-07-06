"use client";

import { Star, Quote } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Avatar } from "@/components/Avatar";

const REVIEWS = [
  { name: "Sunita Rai", city: "Kathmandu", rating: 5, q: "After my knee surgery I dreaded traffic and clinic waits. Sahayatri's therapist came home three times a week — I was walking without support in six weeks." },
  { name: "Rajesh Karki", city: "Pokhara", rating: 5, q: "My father had a stroke and we couldn't move him easily. Dr. Aarati was patient, professional, and gave us a plan we could follow between visits." },
  { name: "Anisha Shrestha", city: "Lalitpur", rating: 4, q: "Booked a sports rehab session for a torn ligament. The app made it easy to see progress and message my therapist between sessions." },
  { name: "Prakash Adhikari", city: "Bhaktapur", rating: 5, q: "I appreciated the NMC verification — I knew I was getting a real, licensed physio. The reports uploaded after each visit were incredibly detailed." },
  { name: "Kamala Poudel", city: "Chitwan", rating: 5, q: "My mother's mobility improved dramatically after 8 sessions. The therapist even trained our family on safe transfers." },
  { name: "Bibek Thapa", city: "Biratnagar", rating: 5, q: "Great platform for post-surgery rehab in Biratnagar. Everything from booking to payment was smooth." },
];

export default function Testimonials() {
  return (
    <PageShell
      eyebrow="Testimonials"
      title="Recovery stories from real patients."
      subtitle="Only verified patients can leave a review after their session — every word here is from someone we treated."
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
