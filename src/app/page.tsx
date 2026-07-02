"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Star, MapPin, Stethoscope, Pill, Apple, ShoppingBag, ArrowRight,
  Activity, Brain, HeartPulse, Baby, ShieldCheck, MessageCircle, Bell,
  FileText, Smartphone,
} from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { BookingModal } from "@/components/BookingModal";
import { TherapistCard } from "@/components/TherapistCard";
import { Avatar } from "@/components/Avatar";
import { Reveal, CountUp } from "@/components/Reveal";
import { useAuth } from "@/lib/auth";
import { npr } from "@/lib/cart";
import { LangSwitcher } from "@/lib/i18n";
import { THERAPISTS, CITIES, SPECIALTIES, type Therapist } from "@/lib/mock";

const plusPattern =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='%232F5D50' fill-opacity='0.06'><path d='M20 12h4v6h6v4h-6v6h-4v-6h-6v-4h6z'/><path d='M88 40h3v5h5v3h-5v5h-3v-5h-5v-3h5z'/><path d='M52 78h4v6h6v4h-6v6h-4v-6h-6v-4h6z'/><path d='M100 92h3v5h5v3h-5v5h-3v-5h-5v-3h5z'/></g></svg>\")";

export default function Landing() {
  const [auth, setAuth] = useState<null | "login" | "signup">(null);
  const [booking, setBooking] = useState<Therapist | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState("");
  const [gender, setGender] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(
    () =>
      THERAPISTS.filter(
        (t) =>
          (!q || t.name.toLowerCase().includes(q.toLowerCase()) || t.specialty.toLowerCase().includes(q.toLowerCase())) &&
          (!city || t.city === city) &&
          (!spec || t.specialty === spec) &&
          (!gender || t.gender === gender),
      ),
    [q, city, spec, gender],
  );

  const handleBook = (t: Therapist) => {
    if (!user) return setAuth("signup");
    setBooking(t);
  };

  const goDash = () => {
    if (!user) return setAuth("login");
    router.push(user.role === "patient" ? "/patient" : user.role === "therapist" ? "/therapist" : "/admin");
  };

  const featured = THERAPISTS.slice(0, 3);
  const gradients = [
    "linear-gradient(135deg, #2F5D50 0%, #6b8f7f 100%)",
    "linear-gradient(135deg, #E2962F 0%, #b56d1f 100%)",
    "linear-gradient(135deg, #16332A 0%, #3d6b5c 100%)",
  ];

  return (
    <div className="min-h-screen bg-cream text-forest overflow-x-hidden">
      <header className={`sticky top-0 z-40 transition-all ${scrolled ? "bg-cream/85 backdrop-blur border-b border-border" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pine inline-block" />
            <span className="font-display text-lg">Sahayatri Physio</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate">
            <a href="#how" className="hover:text-pine">How it works</a>
            <a href="#services" className="hover:text-pine">Services</a>
            <a href="#therapists" className="hover:text-pine">Therapists</a>
            <a href="#find" className="hover:text-pine">Find a Therapist</a>
            <a href="#app" className="hover:text-pine">App</a>
          </nav>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            {user ? (
              <button onClick={goDash} className="btn-pine !py-2 !px-4 text-sm">Open dashboard</button>
            ) : (
              <>
                <button onClick={() => setAuth("login")} className="btn-outline !py-2 !px-4 text-sm hidden sm:inline-flex">Log in</button>
                <button onClick={() => setAuth("signup")} className="btn-primary !py-2 !px-4 text-sm">Sign up free</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-pine/25 blur-3xl" />
          <div className="absolute top-40 -right-24 w-[460px] h-[460px] rounded-full bg-amber/25 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-[380px] h-[380px] rounded-full bg-pine/15 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-12 pb-16 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <Reveal>
            <p className="eyebrow mb-4">Home-visit physiotherapy · Nepal</p>
            <h1 className="text-5xl lg:text-6xl font-display leading-[1.02] mb-5">
              Recovery, <em className="not-italic text-pine font-display italic">at your doorstep</em>.
            </h1>
            <p className="text-slate text-lg max-w-xl mb-7">
              Verified, licensed physiotherapists who come to your home. Book in minutes, recover with care, and track your progress — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <button onClick={() => (user ? router.push("/patient") : setAuth("signup"))} className="btn-primary">Book a session →</button>
              <button onClick={() => setAuth("signup")} className="btn-outline">Become a therapist</button>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <Stat n="180+" l="Verified Therapists" />
              <Stat n="4.8★" l="Average Rating" />
              <Stat n="6" l="Cities in Nepal" />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="card-soft p-6 lg:p-7 bg-white relative">
              <div className="absolute -top-3 left-6 chip !bg-amber !text-white">Live now</div>
              <div className="flex items-center justify-between mb-4">
                <div className="font-display text-lg">Available today</div>
                <div className="text-xs text-slate">Kathmandu Valley</div>
              </div>
              <div className="space-y-3">
                {THERAPISTS.slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-sage/60">
                    <Avatar name={t.name} size={42} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{t.name}</div>
                      <div className="text-xs text-slate truncate">{t.specialty}</div>
                      <div className="flex items-center gap-1 text-xs text-slate mt-0.5">
                        <Star size={11} className="fill-amber text-amber" /> {t.rating}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold">{npr(t.price)}</div>
                      <button onClick={() => handleBook(t)} className="btn-primary !py-1 !px-3 text-xs mt-1">Book</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MARQUEE — trust strip */}
      <section aria-label="Trusted by" className="border-y border-border bg-white/60">
        <div className="marquee py-4">
          <div className="marquee-track font-mono text-xs uppercase tracking-widest text-slate">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex items-center gap-10 pr-10 shrink-0">
                {[
                  "Featured in Kathmandu Post",
                  "Nepal Medical Council · Verified",
                  "Grande Hospital Partner",
                  "Norvic Hospital Partner",
                  "ISO 9001 · Care Standards",
                  "Himal Khabar",
                  "Physio Nepal Association",
                  "eSewa · Khalti Trusted",
                ].map((s) => (
                  <span key={s + dup} className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-pine" />
                    {s}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT STATS BAND */}
      <section className="relative py-16" style={{ backgroundImage: plusPattern }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { to: 12400, suffix: "+", l: "Home visits completed" },
            { to: 180, suffix: "+", l: "Verified therapists" },
            { to: 48, suffix: "", l: "Avg. rating · 4.8★", isRating: true },
            { to: 6, suffix: "", l: "Cities served" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="text-center">
                <div className="font-display text-4xl lg:text-5xl text-pine">
                  {s.isRating ? "4.8★" : <CountUp to={s.to} suffix={s.suffix} />}
                </div>
                <div className="text-xs text-slate mt-2 font-mono uppercase tracking-widest">{s.l.replace(" · 4.8★", "")}</div>
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
              className="hidden md:block absolute left-0 right-0 top-14 mx-auto pointer-events-none"
              height="2"
              width="100%"
              preserveAspectRatio="none"
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
                  <div className="card-soft p-6 hover:-translate-y-1 hover:shadow-md transition duration-300">
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
      <section id="services" className="py-20 relative" style={{ backgroundImage: plusPattern }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
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
                <div className="card-soft p-6 group hover:-translate-y-1 hover:shadow-md transition duration-300">
                  <div className="w-11 h-11 rounded-xl bg-sage text-pine grid place-items-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition duration-300">
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
      <section id="therapists" className="relative py-24 bg-forest text-cream overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-10 left-10 w-[380px] h-[380px] rounded-full bg-pine/40 blur-3xl" />
          <div className="absolute bottom-0 right-10 w-[420px] h-[420px] rounded-full bg-amber/20 blur-3xl" />
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
                    className="group relative rounded-3xl overflow-hidden p-6 h-72 flex flex-col justify-between transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(226,150,47,0.45)]"
                    style={{ background: gradients[i % gradients.length] }}
                  >
                    <span className="absolute right-4 top-4 chip !bg-white/95 !text-pine">✓ Verified</span>
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
      <section id="find" className="bg-sage/60 py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">Find a therapist</p>
            <h2 className="text-4xl font-display mb-8 max-w-2xl">Browse verified physiotherapists.</h2>
          </Reveal>

          <Reveal>
            <div className="card-soft p-3 grid sm:grid-cols-[1.4fr_1fr_1fr_1fr] gap-2 mb-8">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or specialty" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pine" />
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
      <section id="app" className="py-20 bg-pine text-white relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-amber/15 blur-3xl" />
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
                <div className="rounded-2xl bg-white border border-border p-3">
                  <div className="text-xs text-slate">Today&apos;s session</div>
                  <div className="font-display text-base leading-tight">Dr. Aarati Shrestha</div>
                  <div className="text-[11px] text-slate">Knee rehab · 10:00 AM</div>
                  <div className="mt-2 h-1.5 rounded-full bg-sage overflow-hidden">
                    <div className="h-full bg-pine progress-fill" />
                  </div>
                  <div className="text-[10px] text-slate mt-1">Session 6 of 10</div>
                </div>
                <div className="rounded-2xl bg-pine text-white p-3">
                  <div className="text-[11px] opacity-70">Next visit</div>
                  <div className="font-display text-base">Fri, Jul 5 · 4:00 PM</div>
                  <div className="text-[11px] opacity-80">Dr. Bibek Thapa</div>
                </div>
                <div className="mt-auto rounded-2xl bg-white border border-border p-2 flex items-center gap-2 chat-float">
                  <div className="w-7 h-7 rounded-full bg-amber grid place-items-center text-[10px] text-white font-semibold">AS</div>
                  <div className="text-[11px] leading-tight">
                    <div className="font-medium">Dr. Aarati</div>
                    <div className="text-slate">See you at 10, keep icing 👍</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* THERAPIST CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pine to-pine-dark text-white p-10 lg:p-14 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
              <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 w-[420px] h-[420px] rounded-full bg-amber/25 blur-3xl blob-drift" />
              <div className="relative">
                <p className="eyebrow !text-amber mb-3">For physiotherapists</p>
                <h2 className="text-4xl font-display mb-4">Are you a physiotherapist? Join our platform.</h2>
                <p className="text-white/75 max-w-xl">Set your own schedule, earn per session, and build your patient base with verified bookings across Nepal.</p>
              </div>
              <div className="relative md:justify-self-end">
                <button onClick={() => setAuth("signup")} className="btn-primary text-base">Apply as a therapist <ArrowRight size={16} /></button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-forest text-cream/80 py-10">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-amber inline-block" />
              <span className="font-display text-base text-cream">Sahayatri Physio</span>
            </div>
            <p>Recovery, at your doorstep.</p>
          </div>
          <div>
            <div className="text-cream mb-1 font-medium">Contact</div>
            <p>care@sahayatriphysio.com</p>
            <p>+977 1 555 0199</p>
          </div>
          <div className="md:text-right self-end">
            <p>© {new Date().getFullYear()} Sahayatri Physio</p>
          </div>
        </div>
      </footer>

      <AuthModal open={auth !== null} mode={auth ?? "login"} onClose={() => setAuth(null)} />
      {booking && <BookingModal therapist={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-2xl text-pine">{n}</div>
      <div className="text-xs text-slate mt-1 flex items-center gap-1"><MapPin size={10} className="text-amber" />{l}</div>
    </div>
  );
}
function Service({ icon, title, desc, live }: { icon: React.ReactNode; title: string; desc: string; live?: boolean }) {
  return (
    <div className="card-soft p-6 relative group hover:-translate-y-1 hover:shadow-md transition duration-300">
      {live ? <span className="chip !bg-pine !text-white absolute top-4 right-4">Live</span> : <span className="chip absolute top-4 right-4">Soon</span>}
      <div className="w-11 h-11 rounded-xl bg-sage text-pine grid place-items-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition duration-300">{icon}</div>
      <div className="font-display text-lg mb-1">{title}</div>
      <p className="text-slate text-sm">{desc}</p>
    </div>
  );
}
