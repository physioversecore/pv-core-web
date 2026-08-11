"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className="min-h-screen bg-paper text-carbon">
      <SiteHeader variant={isLanding ? "hero" : "solid"} />
      {children}
      <div className="w-full bg-carbon">
        <SiteFooter />
      </div>
    </div>
  );
}
