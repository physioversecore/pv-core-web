"use client";

import { useCallback, useRef, useState } from "react";

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  autoFocus = true,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = useCallback(
    (idx: number) => {
      inputRefs.current[idx]?.focus();
    },
    [],
  );

  const handleChange = useCallback(
    (idx: number, val: string) => {
      const digit = val.replace(/\D/g, "").slice(-1);
      const next = value.split("");
      next[idx] = digit;
      const joined = next.join("").slice(0, length);
      onChange(joined);
      if (digit && idx < length - 1) {
        focusInput(idx + 1);
      }
    },
    [value, length, onChange, focusInput],
  );

  const handleKeyDown = useCallback(
    (idx: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !digits[idx] && idx > 0) {
        const next = value.split("");
        next[idx - 1] = "";
        onChange(next.join(""));
        focusInput(idx - 1);
      }
      if (e.key === "ArrowLeft" && idx > 0) {
        focusInput(idx - 1);
      }
      if (e.key === "ArrowRight" && idx < length - 1) {
        focusInput(idx + 1);
      }
    },
    [digits, value, length, onChange, focusInput],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      if (!pasted) return;
      e.preventDefault();
      onChange(pasted);
      focusInput(Math.min(pasted.length, length - 1));
    },
    [length, onChange, focusInput],
  );

  return (
    <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-13 text-center text-xl font-mono font-bold rounded-xl border border-[#d8dadd] bg-white text-text placeholder:text-text-muted/30 transition-colors focus:border-voltage-lime focus:outline-none focus:ring-4 focus:ring-voltage-lime/15 disabled:opacity-50"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
