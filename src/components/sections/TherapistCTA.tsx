"use client";

import { useLang } from "@/context/i18n";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useAuthModal } from "@/lib/auth-modal";
import { useRouter } from "next/navigation";

export function TherapistCTA() {
  const { t } = useLang();
  const { openAuth } = useAuthModal();
  const router = useRouter();

  return (
    <section className="py-20 md:py-28 bg-paper">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl text-carbon p-6 sm:p-10 lg:p-16 grid md:grid-cols-[1.4fr_1fr] gap-6 md:gap-8 items-center bg-volt border-4 border-carbon shadow-[10px_10px_0_var(--color-carbon)]">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 w-[440px] h-[440px] rounded-full bg-paper-bright/30 blur-3xl blob-drift"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute left-10 bottom-6 w-40 h-40 rounded-full bg-carbon/5"
            />
            <div className="relative min-w-0">
              <p className="label-ink mb-3">{t("landing.therapistCtaEyebrow")}</p>
              <h2 className="text-[clamp(1.75rem,6vw,3.75rem)] font-display font-extrabold uppercase tracking-tighter leading-[0.95] mb-4 break-words">
                {t("landing.therapistCtaTitle")}
              </h2>
              <p className="text-carbon/80 max-w-xl break-words">{t("landing.therapistCtaDesc")}</p>
            </div>
            <div className="relative md:justify-self-end">
              <button
                onClick={() => router.push("/for-physiotherapists/#enroll")}
                className="btn-carbon text-base"
              >
                {t("common.applyToJoin")} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
