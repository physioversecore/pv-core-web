"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { TherapistCard } from "@/components/TherapistCard";
import { AuthModal } from "@/components/AuthModal";
import { BookingModal } from "@/components/BookingModal";
import { useAuth } from "@/lib/auth";
import { THERAPISTS, CITIES, SPECIALTIES, type Therapist } from "@/lib/mock";

export default function FindPage() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState("");
  const [gender, setGender] = useState("");
  const [auth, setAuth] = useState<null | "login" | "signup">(null);
  const [booking, setBooking] = useState<Therapist | null>(null);
  const { user } = useAuth();

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

  return (
    <PageShell
      eyebrow="Find a therapist"
      title="Browse verified physiotherapists."
      subtitle="Filter by city, specialty, and gender — every therapist is NMC-verified with real patient reviews."
    >
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
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
          <div className="text-sm text-slate mb-4">{filtered.length} therapist{filtered.length === 1 ? "" : "s"} found</div>
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

      <AuthModal open={auth !== null} mode={auth ?? "login"} onClose={() => setAuth(null)} />
      {booking && <BookingModal therapist={booking} onClose={() => setBooking(null)} />}
    </PageShell>
  );
}
