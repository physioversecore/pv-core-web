"use client";

import { toast } from "sonner";

interface ReferralCardProps {
  eyebrow: string;
  title: string;
  description: string;
  code: string;
  link: string;
  copyLabel: string;
  copiedMessage: string;
}

export function ReferralCard({
  eyebrow,
  title,
  description,
  code,
  link,
  copyLabel,
  copiedMessage,
}: ReferralCardProps) {
  const copyLink = () => {
    navigator.clipboard?.writeText(link);
    toast.success(copiedMessage);
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
          <span className="font-mono text-secondary font-medium px-3 py-2 rounded-xl bg-white border border-border block text-sm truncate text-center">
            {code}
          </span>
          <button onClick={copyLink} className="btn-secondary w-full">
            {copyLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
