"use client";

import type { ReactNode } from "react";
import { useLang } from "@/context/i18n";

interface BookButtonProps {
  onClick: () => void;
  children?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export function BookButton({ onClick, children, size = "md", className = "" }: BookButtonProps) {
  const { t } = useLang();
  const sizeClass = size === "sm" ? "!py-1.5 !px-3.5 text-xs" : "!py-2.5 !px-5 text-sm";
  return (
    <button onClick={onClick} className={`btn-volt ${sizeClass} ${className}`}>
      {children ?? t("common.book")}
    </button>
  );
}
