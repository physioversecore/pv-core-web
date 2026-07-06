"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { BookingModal } from "@/components/BookingModal";
import { AuthModal } from "@/components/AuthModal";
import { TherapistCard } from "@/components/TherapistCard";
import { useAuth } from "@/lib/auth";
import { npr } from "@/lib/cart";
import type { Therapist } from "@/lib/types";
import { getTherapists } from "@/lib/actions/therapists";

const gradients = [
  "linear-gradient(135deg, var(--color-secondary) 0%, #3F7965 100%)",
  "linear-gradient(135deg, var(--color-primary) 0%, #F4C778 100%)",
  "linear-gradient(135deg, #7A3535 0%, #C97070 100%)",
];

export default function Therapists() {
  const { user } = useAuth();
  const [auth, setAuth] = useState<null | "login" | "signup">(null);
  const [booking, setBooking] = useState<Therapist | null>(null);

  const { data } = useQuery({
    queryKey: ["therapists"],
    queryFn: () => getTherapists(),
  });

  const allTherapists: Therapist[] = (data?.therapists ?? []).map((t) => ({
    ...t,
    gender: t.gender as "Male" | "Female",
  }));

  const featured = allTherapists.slice(0, 3);
  const rest = allTherapists.slice(3);

  const handleBook = (t: Therapist) => {
    if (!user) return setAuth("signup");
    setBooking(t);
  };

  return (
    <PageShell
      eyebrow="Our therapists"
      title="Meet the physiotherapists coming to your home."
      subtitle="Every therapist is NMC-verified, rated by real patients, and specialized in the areas they treat."
    >
      <section className="relative py-16 overflow-hidden text-background bg-background-dark">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-8 left-8 w-[380px] h-[380px] rounded-full bg-primary/25 blur-3xl blob-drift" />
          <div className="absolute bottom-0 right-8 w-[420px] h-[420px] rounded-full bg-secondary/45 blur-3xl blob-float-b" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow !text-primary mb-3">Featured</p>
            <h2 className="text-3xl font-display mb-10 max-w-2xl">Top-rated pros this month.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((t, i) => {
              const initials = t.name.replace("Dr. ", "").split(" ").map((s) => s[0]).slice(0, 2).join("");
              return (
                <Reveal key={t.id} delay={i * 120}>
                  <div
                    className="group relative rounded-3xl overflow-hidden p-6 h-72 flex flex-col justify-between border border-white/10 transition duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_20px_50px_-15px_rgba(226,150,47,0.55)]"
                    style={{ background: gradients[i % gradients.length] }}
                  >
                    <span className="absolute right-4 top-4 chip !bg-white/95 !text-secondary">NMC verified</span>
                    <span className="absolute -right-4 -bottom-6 font-display text-[10rem] leading-none text-white/10 select-none">{initials}</span>
                    <div className="flex items-center gap-1 text-xs relative z-10">
                      <Star size={14} className="fill-primary text-primary" />
                      <span className="font-semibold">{t.rating}</span>
                      <span className="text-white/70">({t.reviews} reviews)</span>
                    </div>
                    <div className="relative z-10">
                      <div className="font-display text-2xl">{t.name}</div>
                      <div className="text-sm text-white/80 mb-4">{t.specialty} · {t.city}</div>
                      <button onClick={() => handleBook(t)} className="btn-primary !py-1.5 !px-4 text-sm">Book · {npr(t.price)}</button>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
              <div>
                <p className="eyebrow mb-3">More therapists</p>
                <h2 className="text-3xl font-display max-w-2xl">Browse our full roster.</h2>
              </div>
              <Link href="/find" className="btn-pine">Advanced search</Link>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((t, i) => (
              <Reveal key={t.id} delay={(i % 6) * 60}>
                <TherapistCard t={t} onBook={handleBook} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <AuthModal open={auth !== null} mode={auth ?? "login"} onClose={() => setAuth(null)} />
      {booking && <BookingModal therapist={booking} onClose={() => setBooking(null)} />}
    </PageShell>
  );
}
