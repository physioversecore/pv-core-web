"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { TherapistCard } from "@/components/TherapistCard";
import { AuthModal } from "@/components/AuthModal";
import { BookingModal } from "@/components/BookingModal";
import { useAuth } from "@/context/auth";
import { CITIES, SPECIALTIES } from "@/constants";
import type { Therapist } from "@/types";
import { getTherapists } from "@/services/api/therapists";

export default function FindPage() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState("");
  const [gender, setGender] = useState("");
  const [auth, setAuth] = useState<null | "login" | "signup">(null);
  const [booking, setBooking] = useState<Therapist | null>(null);
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["therapists"],
    queryFn: () => getTherapists(),
  });

  const allTherapists: Therapist[] = (data?.therapists ?? []).map((th) => ({
    ...th,
    gender: th.gender as "Male" | "Female",
  }));

  const filtered = useMemo(
    () =>
      allTherapists.filter(
        (th) =>
          (!q || th.name.toLowerCase().includes(q.toLowerCase()) || th.specialty.toLowerCase().includes(q.toLowerCase())) &&
          (!city || th.city === city) &&
          (!spec || th.specialty === spec) &&
          (!gender || th.gender === gender),
      ),
    [q, city, spec, gender, allTherapists],
  );

  const handleBook = (th: Therapist) => {
    if (!user) return setAuth("signup");
    setBooking(th);
  };

  return (
    <PageShell
      eyebrow={t("find.eyebrow")}
      title={t("find.title")}
      subtitle={t("find.subtitle")}
    >
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="card-soft p-3 grid sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-2 mb-8">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("find.placeholderSearch")} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm">
                <option value="">{t("find.allCities")}</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select value={spec} onChange={(e) => setSpec(e.target.value)} className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm">
                <option value="">{t("find.allSpecialties")}</option>
                {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm">
                <option value="">{t("find.anyGender")}</option>
                <option>{t("find.male")}</option><option>{t("find.female")}</option>
              </select>
              <button className="btn-secondary !px-5">{t("find.search")}</button>
            </div>
          </Reveal>
          <div className="text-sm text-text-light mb-4">{filtered.length} {t("find.therapistsFound")}</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((th, i) => (
              <Reveal key={th.id} delay={(i % 6) * 60}>
                <TherapistCard t={th} onBook={handleBook} />
              </Reveal>
            ))}
            {filtered.length === 0 && <p className="text-text-light text-sm col-span-full">{t("find.noMatch")}</p>}
          </div>
        </div>
      </section>

      <AuthModal open={auth !== null} mode={auth ?? "login"} onClose={() => setAuth(null)} />
      {booking && <BookingModal therapist={booking} onClose={() => setBooking(null)} />}
    </PageShell>
  );
}
