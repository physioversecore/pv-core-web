"use client";

import Link from "next/link";
import { HeartPulse } from "lucide-react";
import type { ReactNode } from "react";
import { useLang } from "@/context/i18n";

export function AuthShell({
  children,
  maxWidth = 360,
  centered = false,
}: {
  children: ReactNode;
  maxWidth?: number;
  centered?: boolean;
}) {
  const { t } = useLang();
  return (
    <div className="auth-bg flex min-h-[100svh] w-full flex-col items-center px-5">
      <div className="w-full pt-[9vh]" style={{ maxWidth }}>
        <Link
          href="/"
          aria-label={t("header.brand")}
          className={`block w-fit${centered ? " mx-auto" : ""}`}
        >
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-voltage-lime text-carbon-ink transition-transform duration-150 hover:-translate-y-0.5">
            <HeartPulse size={22} strokeWidth={2.25} />
          </span>
        </Link>
        {children}
      </div>
    </div>
  );
}
