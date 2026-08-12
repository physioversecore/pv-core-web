"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, GraduationCap, Award, Star } from "lucide-react";
import { useLang } from "@/context/i18n";
import { useAuth } from "@/context/auth";
import { AuthModal } from "@/components/AuthModal";
import { BookingModal } from "@/components/BookingModal";
import { BookingWidget } from "@/components/therapist/BookingWidget";
import { Avatar } from "@/components/Avatar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SectionError } from "@/components/SectionError";
import { TherapistProfileSkeleton } from "@/components/SuspenseFallback";
import { getTherapist } from "@/services/api/therapists";

export default function TherapistProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLang();
  const { user } = useAuth();
  const [auth, setAuth] = useState<null | "login" | "signup">(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialDate, setInitialDate] = useState("");
  const [initialTime, setInitialTime] = useState("");

  const { data: therapist, isLoading, isError, refetch } = useQuery({
    queryKey: ["therapist", id],
    queryFn: () => getTherapist(id),
    enabled: !!id,
  });

  const handleConfirm = (date: string, time: string) => {
    if (!user) return setAuth("signup");
    setInitialDate(date);
    setInitialTime(time);
    setBookingOpen(true);
  };

  const photo = therapist?.mediaUrls?.split(",")[0];

  return (
    <main className="bg-moss text-carbon min-h-screen grid-bg">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        <Link
          href="/find-a-therapist"
          className="inline-flex items-center gap-1.5 font-mono font-bold uppercase text-xs tracking-wide text-text-light hover:text-carbon transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          {t("therapistProfile.backToFind")}
        </Link>

        <ErrorBoundary fallback={<SectionError onRetry={() => refetch()} />}>
          {isError ? (
            <SectionError onRetry={() => refetch()} />
          ) : isLoading || !therapist ? (
            <TherapistProfileSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="card-neo overflow-hidden md:flex md:items-stretch">
                  <div className="md:w-2/5 relative border-b-2 md:border-b-0 md:border-r-2 border-carbon-soft bg-volt min-h-[280px] md:min-h-0 grid place-items-center">
                    <div className="w-36 h-36 md:w-44 md:h-44">
                      {photo ? (
                        <img src={photo} alt={therapist.name} className="w-full h-full object-cover rounded-2xl border-2 border-carbon-soft shadow-[4px_4px_0_var(--color-carbon-soft)]" />
                      ) : (
                        <div className="w-full h-full rounded-2xl border-2 border-carbon-soft shadow-[4px_4px_0_var(--color-carbon-soft)] grid place-items-center bg-mint">
                          <Avatar name={therapist.name} size={120} />
                        </div>
                      )}
                    </div>
                    <span className="absolute bottom-4 left-4 bg-volt border-2 border-carbon-soft px-3 py-1 font-mono font-bold uppercase text-[11px] tracking-wide flex items-center gap-1">
                      <BadgeCheck size={14} />
                      {t("therapistProfile.verified")}
                    </span>
                  </div>
                  <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-volt border-2 border-carbon-soft rounded-full px-4 py-1 font-mono font-bold uppercase text-[11px] tracking-wide">{therapist.specialty}</span>
                        <span className="bg-transparent border-2 border-carbon-soft rounded-full px-4 py-1 font-mono font-bold uppercase text-[11px] tracking-wide">{therapist.city}</span>
                      </div>
                      <h1 className="font-display font-extrabold text-3xl md:text-4xl uppercase tracking-tight mb-2">{therapist.name}</h1>
                      <p className="font-mono font-bold uppercase text-xs text-text-light mb-6">
                        PT, DPT · {therapist.experience} {t("therapistProfile.experienceYears")}
                      </p>
                      <div className="border-b-2 border-carbon-soft mb-6" />
                      <p className="text-text-light text-sm leading-relaxed mb-6">{therapist.bio || t("therapistProfile.noBio")}</p>
                    </div>
                    <div className="flex items-center gap-6 mt-auto">
                      <div>
                        <div className="font-display font-extrabold text-4xl text-olive leading-none flex items-center gap-1">
                          {therapist.rating}
                          <Star size={20} className="fill-volt text-carbon stroke-carbon" />
                        </div>
                        <div className="font-mono font-bold uppercase text-[10px] tracking-wide text-text-light mt-1">{t("therapistProfile.patientRating")}</div>
                      </div>
                      <div className="h-14 border-2 border-carbon-soft" />
                      <div>
                        <div className="font-display font-extrabold text-4xl text-olive leading-none">{therapist.reviews}</div>
                        <div className="font-mono font-bold uppercase text-[10px] tracking-wide text-text-light mt-1">{t("therapistProfile.patientsTreated")}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card-neo card-neo-hover p-6">
                    <div className="flex items-center gap-3 border-b-2 border-carbon-soft pb-4 mb-6">
                      <GraduationCap size={32} />
                      <h2 className="font-display font-extrabold uppercase tracking-tight text-xl">{t("therapistProfile.education")}</h2>
                    </div>
                    <ul className="space-y-5">
                      <li className="relative pl-6">
                        <span className="absolute left-0 top-2 w-3 h-3 bg-volt border-2 border-carbon-soft" />
                        <h3 className="font-mono font-bold uppercase text-xs tracking-wide">Doctor of Physical Therapy</h3>
                        <p className="text-xs text-text-light mt-0.5">PT · {therapist.experience} {t("therapistProfile.experienceYears")}</p>
                      </li>
                      <li className="relative pl-6">
                        <span className="absolute left-0 top-2 w-3 h-3 bg-mint border-2 border-carbon-soft" />
                        <h3 className="font-mono font-bold uppercase text-xs tracking-wide">{therapist.specialty}</h3>
                        <p className="text-xs text-text-light mt-0.5">{therapist.city}</p>
                      </li>
                    </ul>
                  </div>

                  <div className="card-neo card-neo-hover p-6">
                    <div className="flex items-center gap-3 border-b-2 border-carbon-soft pb-4 mb-6">
                      <Award size={32} />
                      <h2 className="font-display font-extrabold uppercase tracking-tight text-xl">{t("therapistProfile.certifications")}</h2>
                    </div>
                    <ul className="space-y-5">
                      <li className="relative pl-6">
                        <span className="absolute left-0 top-2 w-3 h-3 bg-volt border-2 border-carbon-soft" />
                        <h3 className="font-mono font-bold uppercase text-xs tracking-wide">NMC</h3>
                        <p className="text-xs text-text-light mt-0.5">Nepal Medical Council</p>
                      </li>
                      <li className="relative pl-6">
                        <span className="absolute left-0 top-2 w-3 h-3 bg-mint border-2 border-carbon-soft" />
                        <h3 className="font-mono font-bold uppercase text-xs tracking-wide">{therapist.specialty}</h3>
                        <p className="text-xs text-text-light mt-0.5">{t("therapistProfile.verified")}</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                <BookingWidget therapistId={therapist.id} price={therapist.price} onConfirm={handleConfirm} />
              </div>
            </div>
          )}
        </ErrorBoundary>
      </div>

      <AuthModal open={auth !== null} mode={auth ?? "login"} onClose={() => setAuth(null)} />
      {bookingOpen && therapist && (
        <BookingModal
          therapist={{
            id: therapist.id,
            name: therapist.name,
            specialty: therapist.specialty,
            price: therapist.price,
            rating: therapist.rating,
            reviews: therapist.reviews,
            imageUrl: photo,
          }}
          initialDate={initialDate}
          initialTime={initialTime}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </main>
  );
}
