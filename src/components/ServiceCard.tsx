import type { ReactNode } from "react";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  live?: boolean;
}

export function ServiceCard({ icon, title, desc, live }: ServiceCardProps) {
  return (
    <div className="card-soft p-6 relative group hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300">
      {live ? (
        <span className="chip !bg-secondary !text-white absolute top-4 right-4">Live</span>
      ) : (
        <span className="chip absolute top-4 right-4">Soon</span>
      )}
      <div
        className="w-11 h-11 rounded-xl grid place-items-center mb-3 text-secondary group-hover:scale-110 group-hover:rotate-6 transition duration-300"
        style={{ background: "#D1E8DF" }}
      >
        {icon}
      </div>
      <div className="font-display text-lg mb-1">{title}</div>
      <p className="text-text-light text-sm">{desc}</p>
    </div>
  );
}
