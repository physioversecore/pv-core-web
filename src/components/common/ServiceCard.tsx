import type { ReactNode } from "react";
import { useLang } from "@/context/i18n";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  live?: boolean;
}

export function ServiceCard({ icon, title, desc, live }: ServiceCardProps) {
  const { t } = useLang();
  return (
    <div className="card-neo card-neo-hover p-6 relative group">
      {live ? (
        <span className="chip-mint absolute top-4 right-4">{t("landing.live")}</span>
      ) : (
        <span className="chip-sand absolute top-4 right-4">{t("landing.soon")}</span>
      )}
      <div
        className="w-12 h-12 rounded-xl grid place-items-center mb-3 text-carbon bg-volt border-2 border-carbon group-hover:scale-110 group-hover:rotate-6 transition duration-300"
      >
        {icon}
      </div>
      <div className="font-display font-bold text-lg mb-1">{title}</div>
      <p className="text-text-light text-sm">{desc}</p>
    </div>
  );
}
