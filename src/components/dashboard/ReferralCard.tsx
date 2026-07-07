"use client";

import { toast } from "sonner";
import { useLang } from "@/context/i18n";

interface ReferralCardProps {
  eyebrow: string;
  title: string;
  description: string;
  code: string;
  link: string;
  copyLabel: string;
  shareLabel: string;
  copiedMessage: string;
}

export function ReferralCard({
  eyebrow,
  title,
  description,
  code,
  link,
  copyLabel,
  shareLabel,
  copiedMessage,
}: ReferralCardProps) {
  const { t } = useLang();

  const copy = () => {
    navigator.clipboard?.writeText(link);
    toast.success(copiedMessage);
  };

  const share = () => {
    const text = `${title}: ${link}`;
    if (navigator.share) {
      navigator.share({ title, text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      toast.success(copiedMessage);
    }
  };

  return (
    <section className="mt-6 card-soft p-5 bg-surface/40 border-secondary/20">
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-4 items-center">
        <div>
          <p className="eyebrow mb-1">{eyebrow}</p>
          <h3 className="section-title text-xl">{title}</h3>
          <p className="text-sm text-text-light mt-1">{description}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-secondary font-medium px-3 py-2 rounded-xl bg-white border border-border flex-1 text-sm truncate">
              {code}
            </span>
            <button onClick={copy} className="btn-outline">
              {copyLabel}
            </button>
          </div>
          <button onClick={share} className="btn-secondary w-full">
            {shareLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
