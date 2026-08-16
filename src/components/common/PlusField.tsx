"use client";

import { useMemo } from "react";

interface PlusFieldProps {
  count?: number;
  seed?: number;
}

export function PlusField({ count = 10, seed = 1 }: PlusFieldProps) {
  const items = useMemo(() => {
    let s = seed * 9301 + 49297;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: count }, () => ({
      top: rnd() * 100,
      left: rnd() * 100,
      size: 14 + rnd() * 30,
      rot: rnd() * 90 - 45,
    }));
  }, [count, seed]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it, i) => (
        <svg
          key={i}
          className="absolute text-white"
          style={{
            top: `${it.top}%`,
            left: `${it.left}%`,
            width: it.size,
            height: it.size,
            transform: `rotate(${it.rot}deg)`,
            opacity: 0.07,
          }}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M8 2h4v6h6v4h-6v6H8v-6H2V8h6z" />
        </svg>
      ))}
    </div>
  );
}
