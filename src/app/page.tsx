"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Star, Stethoscope, Pill, Apple, ShoppingBag, ArrowRight,
  Activity, Brain, HeartPulse, Baby, MessageCircle, Bell,
  FileText, Smartphone,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AuthModal } from "@/components/AuthModal";
import { BookingModal } from "@/components/BookingModal";
import { TherapistCard } from "@/components/TherapistCard";
import { Avatar } from "@/components/Avatar";
import { Reveal, CountUp } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { npr } from "@/lib/cart";
import { CITIES, SPECIALTIES } from "@/lib/constants";
import type { Therapist } from "@/lib/types";
import { getTherapists } from "@/lib/actions/therapists";

export default function Landing() {
  const [auth, setAuth] = useState<null | "login" | "signup">(null);
  const [booking, setBooking] = useState<Therapist | null>(null);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState("");
  const [gender, setGender] = useState("");
  const { user } = useAuth();
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

  const handleBook = (t: Therapist) => {
    if (!user) return setAuth("signup");
    setBooking(t);
  };

  const featured = therapists.slice(0, 3);
  const gradients = [
    "linear-gradient(135deg, #2F5D50 0%, #3F7965 100%)",
    "linear-gradient(135deg, #E2962F 0%, #F4C778 100%)",
    "linear-gradient(135deg, #7A3535 0%, #C97070 100%)",
  ];

  return (
    <div className="min-h-screen bg-cream text-forest overflow-x-hidden">
      <SiteHeader variant="hero" />

      {/* HERO */}
      <section id="top" className="relative min-h-screen overflow-hidden text-white" style={{ background: "#0D1A15" }}>
        <div aria-hidden className="absolute inset-0 hero-gradient-bg" />
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-24 -left-20 w-[420px] h-[420px] rounded-full bg-pine/40 blur-3xl blob-float-a" />
          <div className="absolute top-1/3 -right-24 w-[440px] h-[440px] rounded-full bg-amber/25 blur-3xl blob-float-b" />
          <div className="absolute bottom-10 left-1/3 w-[360px] h-[360px] rounded-full bg-[#D1E8DF]/15 blur-3xl blob-float-c" />
        </div>
        <div aria-hidden className="absolute inset-0 grain-overlay" />

        <svg aria-hidden className="absolute left-0 right-0 pointer-events-none" style={{ bottom: "18%", height: "90px", width: "100%" }} viewBox="0 0 1200 90" preserveAspectRatio="none">
          <path d="M0 45 L280 45 L300 45 L310 20 L322 70 L332 15 L344 65 L356 45 L1200 45" fill="none" stroke="#E2962F" strokeWidth="1.6" strokeOpacity="0.55" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-32 pb-24 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <Reveal>
            <p className="eyebrow !text-white/70 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber dot-pulse inline-block" />
              Home-visit physiotherapy · Nepal
            </p>
            <h1 className="font-display leading-[1.02] mb-5" style={{ fontSize: "clamp(2.5rem, 5.4vw, 3.65rem)" }}>
              Recovery,{" "}
              <span className="font-display italic" style={{ background: "linear-gradient(135deg,#E2962F 0%,#F4C778 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                at your doorstep
              </span>
              .
            </h1>
            <p className="text-white/75 text-lg max-w-xl mb-7">
              Verified, licensed physiotherapists who come to your home. Book in minutes, recover with care, and track your progress — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <button onClick={() => (user ? router.push("/patient") : setAuth("signup"))} className="btn-primary">Book a session →</button>
              <button onClick={() => setAuth("signup")} className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold border border-white/40 text-white hover:bg-white/10 transition">
                Become a therapist
              </button>
            </div>
            <div className="flex flex-wrap gap-3 mb-10">
              <a href="#app" className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-sm">
                <Smartphone size={18} />
                <span className="text-left leading-tight"><span className="block text-[10px] opacity-70">GET IT ON</span><span className="block text-sm font-semibold">Google Play</span></span>
              </a>
              <a href="#app" className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-sm">
                <Smartphone size={18} />
                <span className="text-left leading-tight"><span className="block text-[10px] opacity-70">Download on the</span><span className="block text-sm font-semibold">App Store</span></span>
              </a>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <HeroStat n="180+" l="Verified therapists" />
              <HeroStat n="4.8★" l="Average rating" />
              <HeroStat n="6" l="Cities in Nepal" />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative rounded-[22px] p-6 lg:p-7 border border-white/15" style={{ background: "rgba(251,251,248,0.07)", backdropFilter: "blur(18px)" }}>
              <div className="absolute -top-3 left-6 chip !bg-amber !text-white">Live now</div>
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
                        <Star size={11} className="fill-amber text-amber" /> {t.rating}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-white">{npr(t.price)}</div>
                      <button onClick={() => handleBook(t)} className="btn-primary !py-1 !px-3 text-xs mt-1">Book</button>
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
      <section aria-label="Trusted by" style={{ background: "#102B22" }}>
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
      <section className="relative py-16 bg-cream">
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
                <div className="font-display text-4xl lg:text-5xl text-pine">
                  {i === 2
                    ? <>4.8<span className="text-amber">★</span></>
                    : <><CountUp to={s.to} /><span className="text-amber">{s.suffix}</span></>}
                </div>
                <div className="text-xs text-slate mt-2 font-mono uppercase tracking-widest">
                  {i === 2 ? "Average rating" : s.l}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-sage/60 py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">How it works</p>
            <h2 className="text-4xl font-display mb-12 max-w-2xl">Care in three simple steps.</h2>
          </Reveal>
          <div className="relative">
            <svg
              aria-hidden
              className="hidden md:block absolute left-0 right-0 top-14 pointer-events-none"
              height="2" width="100%" preserveAspectRatio="none"
            >
              <line x1="12%" x2="88%" y1="1" y2="1" stroke="#2F5D50" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="6 8" />
            </svg>
            <div className="relative grid md:grid-cols-3 gap-5">
              {[
                { n: "01", t: "Sign up & search", d: "Create your account, filter by location, condition, and gender." },
                { n: "02", t: "Book & pay", d: "Pick date and time. Pay via eSewa, Khalti, or cash on visit." },
                { n: "03", t: "Recover at home", d: "Your therapist arrives, treats you, and uploads a session report." },
              ].map((s, i) => (
                <Reveal key={s.n} delay={i * 120}>
                  <div className="card-soft p-6 hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300">
                    <div className="w-10 h-10 rounded-full bg-pine text-white grid place-items-center font-mono text-sm mb-4">{s.n}</div>
                    <div className="font-display text-xl mb-2">{s.t}</div>
                    <p className="text-slate text-sm">{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20 relative bg-sage/70">
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
                <div className="card-soft p-6 group hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300">
                  <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 text-pine group-hover:scale-110 group-hover:rotate-6 transition duration-300" style={{ background: "#D1E8DF" }}>
                    {s.icon}
                  </div>
                  <div className="font-display text-lg mb-1">{s.title}</div>
                  <p className="text-slate text-sm">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            <Service icon={<Stethoscope />} title="Home-visit Booking" desc="Therapists who come to you." live />
            <Service icon={<ShoppingBag />} title="Equipment Rental" desc="Wheelchairs, crutches, TENS." />
            <Service icon={<Pill />} title="Medicines" desc="Recovery medications delivered." />
            <Service icon={<Apple />} title="Recovery Nutrition" desc="Supplements & meal plans." />
          </div>
        </div>
      </section>

      {/* FEATURED THERAPISTS — DARK */}
      <section id="therapists" className="relative py-24 overflow-hidden text-cream" style={{ background: "#0F211B" }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-8 left-8 w-[380px] h-[380px] rounded-full bg-amber/25 blur-3xl blob-drift" />
          <div className="absolute bottom-0 right-8 w-[420px] h-[420px] rounded-full bg-pine/45 blur-3xl blob-float-b" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow !text-amber mb-3">Featured therapists</p>
            <h2 className="text-4xl font-display mb-12 max-w-2xl">Meet a few of our top-rated pros.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((t, i) => {
              const initials = t.name.replace("Dr. ", "").split(" ").map((s) => s[0]).slice(0, 2).join("");
              return (
                <Reveal key={t.id} delay={i * 120}>
                  <div
                    className="group relative rounded-3xl overflow-hidden p-6 h-72 flex flex-col justify-between border border-white/10 transition duration-300 hover:-translate-y-1 hover:border-amber hover:shadow-[0_20px_50px_-15px_rgba(226,150,47,0.55)]"
                    style={{ background: gradients[i % gradients.length] }}
                  >
                    <span className="absolute right-4 top-4 chip !bg-white/95 !text-pine">NMC verified</span>
                    <span className="absolute -right-4 -bottom-6 font-display text-[10rem] leading-none text-white/10 select-none">
                      {initials}
                    </span>
                    <div className="flex items-center gap-1 text-xs relative z-10">
                      <Star size={14} className="fill-amber text-amber" />
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

      {/* FIND A THERAPIST */}
      <section id="find" className="bg-cream py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">Find a therapist</p>
            <h2 className="text-4xl font-display mb-8 max-w-2xl">Browse verified physiotherapists.</h2>
          </Reveal>

          <Reveal>
            <div className="card-soft p-3 grid sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-2 mb-8">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Location · name · specialty" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pine" />
              </div>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm">
                <option value="">All cities</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select value={spec} onChange={(e) => setSpec(e.target.value)} className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm">
                <option value="">All specialties</option>
                {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm">
                <option value="">Any gender</option>
                <option>Male</option><option>Female</option>
              </select>
              <button className="btn-pine !px-5">Search</button>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t, i) => (
              <Reveal key={t.id} delay={(i % 6) * 60}>
                <TherapistCard t={t} onBook={handleBook} />
              </Reveal>
            ))}
            {filtered.length === 0 && <p className="text-slate text-sm col-span-full">No therapists match your filters.</p>}
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section id="app" className="py-20 text-white relative overflow-hidden" style={{ background: "#16332A" }}>
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-amber/20 blur-3xl blob-drift" />
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <Reveal>
            <p className="eyebrow !text-amber mb-3">Sahayatri app</p>
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
              <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-black text-white hover:bg-black/80 transition">
                <Smartphone size={20} />
                <span className="text-left leading-tight"><span className="block text-[10px] opacity-70">GET IT ON</span><span className="block text-sm font-semibold">Google Play</span></span>
              </a>
              <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-black text-white hover:bg-black/80 transition">
                <Smartphone size={20} />
                <span className="text-left leading-tight"><span className="block text-[10px] opacity-70">Download on the</span><span className="block text-sm font-semibold">App Store</span></span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative mx-auto w-[280px] h-[560px] rounded-[3rem] bg-forest border-[10px] border-black shadow-2xl phone-float">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl" />
              <div className="absolute inset-2 rounded-[2.4rem] bg-cream text-forest p-4 flex flex-col gap-3 overflow-hidden">
                <div className="text-[11px] font-mono text-slate flex justify-between">
                  <span>9:41</span><span>Sahayatri</span>
                </div>
                <div className="rounded-2xl bg-white border border-border p-3 chat-float" style={{ animationDelay: "0.6s" }}>
                  <div className="text-xs text-slate">Today&apos;s session</div>
                  <div className="font-display text-base leading-tight">Dr. Aarati Shrestha</div>
                  <div className="text-[11px] text-slate">Knee rehab · 10:00 AM</div>
                  <div className="mt-2 h-1.5 rounded-full bg-sage overflow-hidden">
                    <div className="h-full bg-pine progress-fill" />
                  </div>
                  <div className="text-[10px] text-slate mt-1">Session 6 of 10</div>
                </div>
                <div className="rounded-2xl bg-pine text-white p-3 chat-float" style={{ animationDelay: "1.2s" }}>
                  <div className="text-[11px] opacity-70">Next visit</div>
                  <div className="font-display text-base">Fri, Jul 5 · 4:00 PM</div>
                  <div className="text-[11px] opacity-80">Dr. Bibek Thapa</div>
                </div>
                <div className="rounded-2xl bg-white border border-border p-2 flex items-center gap-2 chat-float">
                  <div className="w-7 h-7 rounded-full bg-amber grid place-items-center text-[10px] text-white font-semibold">AS</div>
                  <div className="text-[11px] leading-tight">
                    <div className="font-medium">Dr. Aarati</div>
                    <div className="text-slate">See you at 10, keep icing</div>
                  </div>
                </div>
                <svg viewBox="0 0 240 40" className="mt-auto w-full h-8" preserveAspectRatio="none">
                  <path d="M0 30 L40 28 L60 12 L80 22 L100 6 L120 24 L150 18 L180 26 L210 10 L240 20" fill="none" stroke="#E2962F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* THERAPIST CTA */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl text-white p-10 lg:p-14 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center" style={{ background: "linear-gradient(135deg,#2F5D50 0%,#1E4035 100%)" }}>
              <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 w-[440px] h-[440px] rounded-full bg-amber/25 blur-3xl blob-drift" />
              <div aria-hidden className="pointer-events-none absolute left-10 bottom-6 w-40 h-40 rounded-full bg-white/5" />
              <div className="relative">
                <p className="eyebrow !text-amber mb-3">For physiotherapists</p>
                <h2 className="text-4xl font-display mb-4">Are you a physiotherapist? Join our platform.</h2>
                <p className="text-[#D1E8DF]/85 max-w-xl">Set your own schedule, earn per session, and build your patient base with verified bookings across Nepal.</p>
              </div>
              <div className="relative md:justify-self-end">
                <button onClick={() => setAuth("signup")} className="btn-primary text-base">Apply to join <ArrowRight size={16} /></button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />

      <AuthModal open={auth !== null} mode={auth ?? "login"} onClose={() => setAuth(null)} />
      {booking && <BookingModal therapist={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}

function PlusField({ count = 10, seed = 1 }: { count?: number; seed?: number }) {
  const items = useMemo(() => {
    let s = seed * 9301 + 49297;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    return Array.from({ length: count }, () => ({
      top: rnd() * 100,
      left: rnd() * 100,
      size: 14 + rnd() * 30,
      rot: rnd() * 90 - 45,
    }));
  }, [count, seed]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it, i) => (
        <svg key={i} className="absolute text-pine" style={{ top: `${it.top}%`, left: `${it.left}%`, width: it.size, height: it.size, transform: `rotate(${it.rot}deg)`, opacity: 0.07 }} viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 2h4v6h6v4h-6v6H8v-6H2V8h6z" />
        </svg>
      ))}
    </div>
  );
}

function HeroStat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-3xl text-white">{n}</div>
      <div className="text-[11px] text-white/60 mt-1 font-mono uppercase tracking-widest">{l}</div>
    </div>
  );
}

function Service({ icon, title, desc, live }: { icon: React.ReactNode; title: string; desc: string; live?: boolean }) {
  return (
    <div className="card-soft p-6 relative group hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300">
      {live ? <span className="chip !bg-pine !text-white absolute top-4 right-4">Live</span> : <span className="chip absolute top-4 right-4">Soon</span>}
      <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 text-pine group-hover:scale-110 group-hover:rotate-6 transition duration-300" style={{ background: "#D1E8DF" }}>{icon}</div>
      <div className="font-display text-lg mb-1">{title}</div>
      <p className="text-slate text-sm">{desc}</p>
    </div>
  );
}
