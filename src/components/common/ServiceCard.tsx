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
    <div className="card-glass p-6 relative group hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(0,0,0,.6)] transition duration-300">
      {live ? (
        <span className="chip !bg-voltage-lime !text-carbon-ink absolute top-4 right-4">{t("landing.live")}</span>
      ) : (
        <span className="chip !bg-white/10 !text-white/80 absolute top-4 right-4">{t("landing.soon")}</span>
      )}
      <div
        className="w-11 h-11 rounded-xl grid place-items-center mb-3 text-secondary group-hover:scale-110 group-hover:rotate-6 transition duration-300"
        style={{ background: "#D1E8DF" }}
      >
        {icon}
      </div>
      <div className="font-display text-lg mb-1">{title}</div>
      <p className="text-white/60 text-sm">{desc}</p>
    </div>
  );
}
