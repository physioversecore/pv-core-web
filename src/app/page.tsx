"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star, Stethoscope, Pill, Apple, ShoppingBag, ArrowRight,
  Activity, Brain, HeartPulse, Baby, MessageCircle, Bell,
  FileText,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BookingModal } from "@/components/BookingModal";
import { TherapistCard } from "@/components/TherapistCard";
import { Avatar } from "@/components/Avatar";
import { Reveal, CountUp } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PlusField } from "@/components/PlusField";
import { HeroStat } from "@/components/HeroStat";
import { ServiceCard } from "@/components/ServiceCard";
import { BookButton } from "@/components/BookButton";
import { AppStoreBadge } from "@/components/AppStoreBadge";
import { TherapistFilters } from "@/components/TherapistFilters";
import { useAuth } from "@/lib/auth";
import { useAuthModal } from "@/lib/auth-modal";
import { useBooking } from "@/hooks/useBooking";
import { npr } from "@/lib/cart";
import type { Therapist } from "@/lib/types";
import { getTherapists } from "@/lib/actions/therapists";

export default function Landing() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState("");
  const [gender, setGender] = useState("");
  const { user } = useAuth();
  const { openAuth } = useAuthModal();
  const { booking, book: handleBook, closeBooking } = useBooking();
  const router = useRouter();

  const { data: therapistsData } = useQuery({
    queryKey: ["therapists"],
    queryFn: () => getTherapists(),
  });

  const therapists: Therapist[] = (therapistsData?.therapists ?? []).map((t) => ({
    ...t,
    gender: t.gender as "Male" | "Female",
  }));

  const filtered = useMemo(
    () =>
      therapists.filter(
        (t) =>
          (!q || t.name.toLowerCase().includes(q.toLowerCase()) || t.specialty.toLowerCase().includes(q.toLowerCase())) &&
          (!city || t.city === city) &&
          (!spec || t.specialty === spec) &&
          (!gender || t.gender === gender),
      ),
    [q, city, spec, gender, therapists],
  );

  const featured = therapists.slice(0, 3);
  const gradients = [
    "linear-gradient(135deg, var(--color-secondary) 0%, #3F7965 100%)",
    "linear-gradient(135deg, var(--color-primary) 0%, #F4C778 100%)",
    "linear-gradient(135deg, #7A3535 0%, #C97070 100%)",
  ];

  return (
    <div className="min-h-screen bg-background text-text overflow-x-hidden">
      <SiteHeader variant="hero" />

      {/* HERO */}
      <section id="top" className="relative min-h-screen overflow-hidden text-white bg-background-dark">
        <div aria-hidden className="absolute inset-0 hero-gradient-bg" />
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-24 -left-20 w-[420px] h-[420px] rounded-full bg-secondary/40 blur-3xl blob-float-a" />
          <div className="absolute top-1/3 -right-24 w-[440px] h-[440px] rounded-full bg-primary/25 blur-3xl blob-float-b" />
          <div className="absolute bottom-10 left-1/3 w-[360px] h-[360px] rounded-full bg-primary-light/15 blur-3xl blob-float-c" />
        </div>
        <div aria-hidden className="absolute inset-0 grain-overlay" />

        <svg aria-hidden className="absolute left-0 right-0 pointer-events-none" style={{ bottom: "18%", height: "90px", width: "100%" }} viewBox="0 0 1200 90" preserveAspectRatio="none">
          <path d="M0 45 L280 45 L300 45 L310 20 L322 70 L332 15 L344 65 L356 45 L1200 45" fill="none" stroke="var(--color-primary)" strokeWidth="1.6" strokeOpacity="0.55" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-32 pb-24 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <Reveal>
            <p className="eyebrow !text-white/70 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary dot-pulse inline-block" />
              Home-visit physiotherapy · Nepal
            </p>
            <h1 className="font-display leading-[1.02] mb-5" style={{ fontSize: "clamp(2.5rem, 5.4vw, 3.65rem)" }}>
              Recovery,{" "}
              <span className="font-display italic" style={{ background: "linear-gradient(135deg,var(--color-primary) 0%,#F4C778 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                at your doorstep
              </span>
              .
            </h1>
            <p className="text-white/75 text-lg max-w-xl mb-7">
              Verified, licensed physiotherapists who come to your home. Book in minutes, recover with care, and track your progress — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <button onClick={() => (user ? router.push("/patient") : openAuth("signup"))} className="btn-primary">Book a session →</button>
              <button onClick={() => openAuth("signup")} className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold border border-white/40 text-white hover:bg-white/10 transition">
                Become a therapist
              </button>
            </div>
            <div className="flex flex-wrap gap-3 mb-10">
              <AppStoreBadge platform="google" variant="hero" />
              <AppStoreBadge platform="apple" variant="hero" />
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <HeroStat value="180+" label="Verified therapists" />
              <HeroStat value="4.8★" label="Average rating" />
              <HeroStat value="6" label="Cities in Nepal" />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative rounded-[22px] p-6 lg:p-7 border border-white/15" style={{ background: "rgba(251,251,248,0.07)", backdropFilter: "blur(18px)" }}>
              <div className="absolute -top-3 left-6 chip !bg-primary !text-white">Live now</div>
              <div className="flex items-center justify-between mb-4">
                <div className="font-display text-lg text-white">Available today</div>
                <div className="text-xs text-white/60">Kathmandu Valley</div>
              </div>
              <div className="space-y-3">
                {therapists.slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <Avatar name={t.name} size={42} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate text-white">{t.name}</div>
                      <div className="text-xs text-white/60 truncate">{t.specialty}</div>
                      <div className="flex items-center gap-1 text-xs text-white/60 mt-0.5">
                        <Star size={11} className="fill-primary text-primary" /> {t.rating}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-white">{npr(t.price)}</div>
                      <BookButton onClick={() => handleBook(t)} size="sm" className="mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div aria-hidden className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="font-mono text-[10px] uppercase tracking-widest">Scroll</span>
          <span className="w-px h-8 bg-white/50 scroll-cue origin-top" />
        </div>
      </section>

      {/* PARTNERS MARQUEE */}
      <section aria-label="Trusted by" className="bg-background-dark">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-8">
          <p className="text-center eyebrow !text-white/50">Trusted by · Partnered with</p>
        </div>
        <div className="marquee py-6">
          <div className="marquee-track font-display text-base text-white/60">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex items-center gap-12 pr-12 shrink-0">
                {[
                  { i: "🏥", n: "Grande Hospital" },
                  { i: "🏥", n: "Norvic Hospital" },
                  { i: "🏥", n: "Bir Hospital" },
                  { i: "✓", n: "Nepal Medical Council" },
                  { i: "📰", n: "Kathmandu Post" },
                  { i: "📰", n: "Himal Khabar" },
                  { i: "🎖", n: "ISO 9001" },
                  { i: "💳", n: "eSewa · Khalti" },
                ].map((s) => (
                  <span key={s.n + dup} className="flex items-center gap-2 whitespace-nowrap">
                    <span>{s.i}</span> {s.n}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT STATS BAND */}
      <section className="relative py-16 bg-background">
        <PlusField count={10} seed={3} />
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 grid grid-cols-2 md:grid-cols-4">
          {[
            { to: 12400, suffix: "+", l: "Home visits completed" },
            { to: 180, suffix: "+", l: "Verified therapists" },
            { to: 48, suffix: "★", l: "Average rating × 10" },
            { to: 6, suffix: "", l: "Cities served" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className={`text-center py-4 ${i > 0 ? "md:border-l border-border" : ""}`}>
                <div className="font-display text-4xl lg:text-5xl text-secondary">
                  {i === 2
                    ? <>4.8<span className="text-primary">★</span></>
                    : <><CountUp to={s.to} /><span className="text-primary">{s.suffix}</span></>}
                </div>
                <div className="text-xs text-text-light mt-2 font-mono uppercase tracking-widest">
                  {i === 2 ? "Average rating" : s.l}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-surface py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">How it works</p>
            <h2 className="text-4xl font-display mb-12 max-w-2xl">Care in three simple steps.</h2>
          </Reveal>
          <div className="relative">
            <svg aria-hidden className="hidden md:block absolute left-0 right-0 top-14 pointer-events-none" height="2" width="100%" preserveAspectRatio="none">
              <line x1="12%" x2="88%" y1="1" y2="1" stroke="var(--color-secondary)" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="6 8" />
            </svg>
            <div className="relative grid md:grid-cols-3 gap-5">
              {[
                { n: "01", t: "Sign up & search", d: "Create your account, filter by location, condition, and gender." },
                { n: "02", t: "Book & pay", d: "Pick date and time. Pay via eSewa, Khalti, or cash on visit." },
                { n: "03", t: "Recover at home", d: "Your therapist arrives, treats you, and uploads a session report." },
              ].map((s, i) => (
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

      {/* SERVICES */}
      <section id="services" className="py-20 relative bg-surface">
        <PlusField count={8} seed={7} />
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">Our services</p>
            <h2 className="text-4xl font-display mb-12 max-w-2xl">Everything for your recovery.</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Activity />, title: "Sports Injury Rehab", desc: "ACL, rotator cuff, sprain recovery." },
              { icon: <HeartPulse />, title: "Post-Surgery Rehab", desc: "Knee, hip, and joint replacement." },
              { icon: <Brain />, title: "Neuro Rehab", desc: "Stroke, Parkinson's, spinal cord." },
              { icon: <Baby />, title: "Pediatric & Elderly", desc: "Developmental delays, geriatric care." },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <ServiceCard icon={s.icon} title={s.title} desc={s.desc} />
              </Reveal>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            <ServiceCard icon={<Stethoscope />} title="Home-visit Booking" desc="Therapists who come to you." live />
            <ServiceCard icon={<ShoppingBag />} title="Equipment Rental" desc="Wheelchairs, crutches, TENS." />
            <ServiceCard icon={<Pill />} title="Medicines" desc="Recovery medications delivered." />
            <ServiceCard icon={<Apple />} title="Recovery Nutrition" desc="Supplements & meal plans." />
          </div>
        </div>
      </section>

      {/* FEATURED THERAPISTS — DARK */}
      <section id="therapists" className="relative py-24 overflow-hidden text-background bg-background-dark">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-8 left-8 w-[380px] h-[380px] rounded-full bg-primary/25 blur-3xl blob-drift" />
          <div className="absolute bottom-0 right-8 w-[420px] h-[420px] rounded-full bg-secondary/45 blur-3xl blob-float-b" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow !text-primary mb-3">Featured therapists</p>
            <h2 className="text-4xl font-display mb-12 max-w-2xl">Meet a few of our top-rated pros.</h2>
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
                    <span className="absolute -right-4 -bottom-6 font-display text-[10rem] leading-none text-white/10 select-none">
                      {initials}
                    </span>
                    <div className="flex items-center gap-1 text-xs relative z-10">
                      <Star size={14} className="fill-primary text-primary" />
                      <span className="font-semibold">{t.rating}</span>
                      <span className="text-white/70">({t.reviews} reviews)</span>
                    </div>
                    <div className="relative z-10">
                      <div className="font-display text-2xl">{t.name}</div>
                      <div className="text-sm text-white/80 mb-4">{t.specialty} · {t.city}</div>
                      <BookButton onClick={() => handleBook(t)} size="sm" />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* FIND A THERAPIST */}
      <section id="find" className="bg-background py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">Find a therapist</p>
            <h2 className="text-4xl font-display mb-8 max-w-2xl">Browse verified physiotherapists.</h2>
          </Reveal>

          <Reveal>
            <TherapistFilters
              q={q}
              city={city}
              spec={spec}
              gender={gender}
              onQChange={setQ}
              onCityChange={setCity}
              onSpecChange={setSpec}
              onGenderChange={setGender}
            />
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t, i) => (
              <Reveal key={t.id} delay={(i % 6) * 60}>
                <TherapistCard t={t} onBook={handleBook} />
              </Reveal>
            ))}
            {filtered.length === 0 && <p className="text-text-light text-sm col-span-full">No therapists match your filters.</p>}
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section id="app" className="py-20 text-white relative overflow-hidden bg-background-dark">
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl blob-drift" />
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <Reveal>
            <p className="eyebrow !text-primary mb-3">Sahayatri app</p>
            <h2 className="text-4xl font-display mb-5">Your recovery, in your pocket.</h2>
            <ul className="space-y-3 mb-7 text-white/85">
              {[
                { icon: <FileText size={18} />, t: "Session reports uploaded after every visit" },
                { icon: <MessageCircle size={18} />, t: "In-app chat with your therapist" },
                { icon: <Bell size={18} />, t: "Reminders for exercises and next visits" },
              ].map((b) => (
                <li key={b.t} className="flex items-center gap-3">
                  <span className="w-8 h-8 grid place-items-center rounded-lg bg-white/10">{b.icon}</span>
                  <span>{b.t}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <AppStoreBadge platform="google" variant="section" />
              <AppStoreBadge platform="apple" variant="section" />
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative mx-auto w-[280px] h-[560px] rounded-[3rem] bg-text border-[10px] border-black shadow-2xl phone-float">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl" />
              <div className="absolute inset-2 rounded-[2.4rem] bg-background text-text p-4 flex flex-col gap-3 overflow-hidden">
                <div className="text-[11px] font-mono text-text-light flex justify-between">
                  <span>9:41</span><span>Sahayatri</span>
                </div>
                <div className="rounded-2xl bg-white border border-border p-3 chat-float" style={{ animationDelay: "0.6s" }}>
                  <div className="text-xs text-text-light">Today&apos;s session</div>
                  <div className="font-display text-base leading-tight">Dr. Aarati Shrestha</div>
                  <div className="text-[11px] text-text-light">Knee rehab · 10:00 AM</div>
                  <div className="mt-2 h-1.5 rounded-full bg-surface overflow-hidden">
                    <div className="h-full bg-secondary progress-fill" />
                  </div>
                  <div className="text-[10px] text-text-light mt-1">Session 6 of 10</div>
                </div>
                <div className="rounded-2xl bg-secondary text-white p-3 chat-float" style={{ animationDelay: "1.2s" }}>
                  <div className="text-[11px] opacity-70">Next visit</div>
                  <div className="font-display text-base">Fri, Jul 5 · 4:00 PM</div>
                  <div className="text-[11px] opacity-80">Dr. Bibek Thapa</div>
                </div>
                <div className="rounded-2xl bg-white border border-border p-2 flex items-center gap-2 chat-float">
                  <div className="w-7 h-7 rounded-full bg-primary grid place-items-center text-[10px] text-white font-semibold">AS</div>
                  <div className="text-[11px] leading-tight">
                    <div className="font-medium">Dr. Aarati</div>
                    <div className="text-text-light">See you at 10, keep icing</div>
                  </div>
                </div>
                <svg viewBox="0 0 240 40" className="mt-auto w-full h-8" preserveAspectRatio="none">
                  <path d="M0 30 L40 28 L60 12 L80 22 L100 6 L120 24 L150 18 L180 26 L210 10 L240 20" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* THERAPIST CTA */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl text-white p-10 lg:p-14 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center" style={{ background: "linear-gradient(135deg,var(--color-secondary) 0%,#1E4035 100%)" }}>
              <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 w-[440px] h-[440px] rounded-full bg-primary/25 blur-3xl blob-drift" />
              <div aria-hidden className="pointer-events-none absolute left-10 bottom-6 w-40 h-40 rounded-full bg-white/5" />
              <div className="relative">
                <p className="eyebrow !text-primary mb-3">For physiotherapists</p>
                <h2 className="text-4xl font-display mb-4">Are you a physiotherapist? Join our platform.</h2>
                <p className="text-[#D1E8DF]/85 max-w-xl">Set your own schedule, earn per session, and build your patient base with verified bookings across Nepal.</p>
              </div>
              <div className="relative md:justify-self-end">
                <button onClick={() => openAuth("signup")} className="btn-primary text-base">Apply to join <ArrowRight size={16} /></button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />

      {booking && <BookingModal therapist={booking} onClose={closeBooking} />}
    </div>
  );
}
