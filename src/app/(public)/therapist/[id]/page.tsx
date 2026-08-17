"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { TherapistCardSkeleton } from "@/components/SuspenseFallback";
import { getTherapist } from "@/services/api/therapists";

export default function TherapistProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLang();
  const { user } = useAuth();
  const [auth, setAuth] = useState<null | "access">(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialDate, setInitialDate] = useState("");
  const [initialTime, setInitialTime] = useState("");

  const { data: therapist, isLoading, isError, refetch } = useQuery({
    queryKey: ["therapist", id],
    queryFn: () => getTherapist(id),
    enabled: !!id,
  });

  const handleConfirm = (date: string, time: string) => {
    if (!user) return setAuth("access");
    setInitialDate(date);
    setInitialTime(time);
    setBookingOpen(true);
  };

  const photo = therapist?.mediaUrls?.split(",")[0];

  return (
    <main className="bg-white text-carbon min-h-screen">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        <Link
          href="/find-a-therapist"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ash hover:text-carbon transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          {t("therapist_dashboard.noAppointments")}
        </Link>

        <ErrorBoundary fallback={<SectionError onRetry={() => refetch()} />}>
          {isError ? (
            <SectionError onRetry={() => refetch()} />
          ) : isLoading || !therapist ? (
            <TherapistCardSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="card-neo overflow-hidden md:flex md:items-stretch">
                  <div className="md:w-2/5 relative border-b md:border-b-0 md:border-r border-hairline bg-volt min-h-[280px] md:min-h-0 grid place-items-center">
                    <div className="w-36 h-36 md:w-44 md:h-44">
                      {photo ? (
                        <Image src={photo} alt={therapist.name} width={176} height={176} unoptimized className="w-full h-full object-cover rounded-2xl border border-carbon/10" />
                      ) : (
                        <div className="w-full h-full rounded-2xl border border-carbon/10 grid place-items-center bg-white">
                          <Avatar name={therapist.name} size={120} />
                        </div>
                      )}
                    </div>
                    <span className="absolute bottom-4 left-4 bg-white border border-hairline px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full flex items-center gap-1">
                      <BadgeCheck size={14} className="text-moss" />
                      {t("therapist_complaints.attachFile")}
                    </span>
                  </div>
                  <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-volt border border-carbon/10 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide">{therapist.specialty}</span>
                        <span className="bg-white border border-hairline rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide">{therapist.city}</span>
                      </div>
                      <h1 className="font-display font-extrabold text-3xl md:text-4xl uppercase tracking-tight mb-2 text-carbon">{therapist.name}</h1>
                      <p className="text-xs font-medium uppercase text-ash mb-6">
                        PT, DPT · {therapist.experience} {t("therapist_complaints.against")}
                      </p>
                      <div className="border-b border-hairline mb-6" />
                      <p className="text-ash text-sm leading-relaxed mb-6">{therapist.bio || t("therapist_complaints.against")}</p>
                    </div>
                    <div className="flex items-center gap-6 mt-auto">
                      <div>
                        <div className="font-display font-extrabold text-4xl text-carbon leading-none flex items-center gap-1">
                          {therapist.rating}
                          <Star size={20} className="fill-volt text-carbon stroke-carbon" />
                        </div>
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-ash mt-1">{t("therapist_complaints.against")}</div>
                      </div>
                      <div className="h-14 border-l border-hairline" />
                      <div>
                        <div className="font-display font-extrabold text-4xl text-carbon leading-none">{therapist.reviews}</div>
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-ash mt-1">{t("therapist_complaints.against")}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card-neo card-neo-hover p-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4 mb-6">
                      <GraduationCap size={32} />
                      <h2 className="font-display font-extrabold uppercase tracking-tight text-xl">{t("therapist_complaints.against")}</h2>
                    </div>
                    <ul className="space-y-5">
                      <li className="relative pl-6">
                        <span className="absolute left-0 top-2 w-3 h-3 bg-volt border border-carbon/10" />
                        <h3 className="text-xs font-bold uppercase tracking-wide text-carbon">Doctor of Physical Therapy</h3>
                        <p className="text-xs text-ash mt-0.5">PT · {therapist.experience} {t("therapist_dashboard.feePerSession")}</p>
                      </li>
                      <li className="relative pl-6">
                        <span className="absolute left-0 top-2 w-3 h-3 bg-mint border border-carbon/10" />
                        <h3 className="text-xs font-bold uppercase tracking-wide text-carbon">{therapist.specialty}</h3>
                        <p className="text-xs text-ash mt-0.5">{therapist.city}</p>
                      </li>
                    </ul>
                  </div>

                  <div className="card-neo card-neo-hover p-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4 mb-6">
                      <Award size={32} />
                      <h2 className="font-display font-extrabold uppercase tracking-tight text-xl">{t("therapist_complaints.against")}</h2>
                    </div>
                    <ul className="space-y-5">
                      <li className="relative pl-6">
                        <span className="absolute left-0 top-2 w-3 h-3 bg-volt border border-carbon/10" />
                        <h3 className="text-xs font-bold uppercase tracking-wide text-carbon">NMC</h3>
                        <p className="text-xs text-ash mt-0.5">Nepal Medical Council</p>
                      </li>
                      <li className="relative pl-6">
                        <span className="absolute left-0 top-2 w-3 h-3 bg-mint border border-carbon/10" />
                        <h3 className="text-xs font-bold uppercase tracking-wide text-carbon">{therapist.specialty}</h3>
                        <p className="text-xs text-ash mt-0.5">{t("testimonials.eyebrow")}</p>
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

      <AuthModal open={auth !== null} mode={auth ?? "access"} onClose={() => setAuth(null)} />
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
          onClose={() => setBookingOpen(false)}
        />
      )}
    </main>
  );
}
