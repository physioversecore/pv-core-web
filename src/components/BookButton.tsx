"use client";

import type { ReactNode } from "react";

interface BookButtonProps {
  onClick: () => void;
  children?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export function BookButton({ onClick, children, size = "md", className = "" }: BookButtonProps) {
  const sizeClass = size === "sm" ? "!py-1.5 !px-4 text-sm" : "!py-2 !px-5 text-sm";
  return (
    <button onClick={onClick} className={`btn-primary ${sizeClass} ${className}`}>
      {children ?? "Book"}
    </button>
  );
}
