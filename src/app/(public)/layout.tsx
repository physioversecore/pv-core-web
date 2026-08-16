"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const headerVariant =
    isLanding || pathname.startsWith("/find-a-therapist") ? "hero" : "solid";

  return (
    <div className={`min-h-screen ${isLanding ? "bg-mid-abyss text-white" : "bg-background text-text"}`}>
      <SiteHeader variant={headerVariant} />
      {children}
      <SiteFooter />
    </div>
  );
}
