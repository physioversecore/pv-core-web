"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Search, ChevronDown, Star, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/common/Avatar";
import { getAdminTherapists } from "@/services/api/admin";
import type { BookingTherapist } from "./types";

interface Props {
  therapists: BookingTherapist[];
  selectedTherapistId: string;
  onSelect: (therapist: BookingTherapist) => void;
  onBack: () => void;
  onContinue: () => void;
}

function toBookingTherapist(t: {
  id: string;
  name: string;
  specialty: string;
  price?: number;
  rating?: number;
  sessions?: number;
}): BookingTherapist {
  return {
    id: t.id,
    name: t.name,
    specialty: t.specialty,
    price: t.price ?? 0,
    rating: t.rating ?? 0,
    reviews: t.sessions ?? 0,
  };
}

export function TherapistSelectStep({
  therapists,
  selectedTherapistId,
  onSelect,
  onBack,
  onContinue,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const { data: fetched, isLoading, isFetching } = useQuery({
    queryKey: ["admin-therapists-search", debouncedQuery],
    queryFn: () => getAdminTherapists({ search: debouncedQuery, limit: 50 }),
    enabled: open,
    staleTime: 30_000,
  });

  const allTherapists: BookingTherapist[] = useMemo(() => {
    const apiList = (fetched?.items ?? []).map(toBookingTherapist);
    const merged = [...apiList];
    const seen = new Set(merged.map((p) => p.id));
    for (const t of therapists) {
      if (!seen.has(t.id)) merged.push(t);
    }
    const q = debouncedQuery.trim().toLowerCase();
    return q
      ? merged.filter(
          (t) =>
            t.name.toLowerCase().includes(q) || t.specialty.toLowerCase().includes(q),
        )
      : merged;
  }, [fetched, therapists, debouncedQuery]);

  const selected = useMemo(
    () => allTherapists.find((t) => t.id === selectedTherapistId),
    [allTherapists, selectedTherapistId],
  );

  const results = open ? allTherapists : [];

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        close();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, close]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleToggle = useCallback(() => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setOpen((v) => !v);
  }, [open]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1E2A2E]">Select therapist</h2>
        <p className="text-sm text-gray-500 mt-1">Choose which therapist to book</p>
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-[#1F3D2B] mt-1 flex items-center gap-1"
        >
          ← Back
        </button>
      </div>

      <div ref={dropdownRef}>
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-white text-sm text-left transition-all",
            open
              ? "border-[#1F3D2B] ring-2 ring-[#1F3D2B]/20"
              : "border-gray-200 hover:border-gray-300",
          )}
        >
          {selected ? (
            <span className="flex items-center gap-3">
              <Avatar name={selected.name} size={32} />
              <span className="font-medium text-[#1E2A2E]">{selected.name}</span>
              <span className="text-gray-400 text-xs hidden sm:inline">{selected.specialty}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-gray-400">
              <Search size={16} />
              Search therapists by name or specialty...
            </span>
          )}
          <ChevronDown
            size={18}
            className={cn("text-gray-400 transition-transform shrink-0", open && "rotate-180")}
          />
        </button>

        {open && (
          <div
            className="fixed z-[200] bg-white border border-gray-200 rounded-xl shadow-lg"
            style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
          >
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]/20 focus:border-[#1F3D2B]"
                />
                {isFetching && (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                )}
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Loader2 size={16} className="animate-spin" /> Loading therapists...
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  No therapists found
                </div>
              ) : (
                results.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelect(t);
                      close();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-left",
                      t.id === selectedTherapistId && "bg-[#1F3D2B]/5",
                    )}
                  >
                    <Avatar name={t.name} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#1E2A2E] truncate">{t.name}</div>
                      <div className="text-xs text-gray-400 truncate">{t.specialty}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        <Star size={12} fill="currentColor" />
                        <span>{t.rating}</span>
                      </div>
                      <div className="text-xs font-semibold text-[#1E2A2E]">
                        Rs. {t.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                    {t.id === selectedTherapistId && (
                      <span className="text-[#1F3D2B] font-bold shrink-0">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="bg-[#F0F0EE] rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Therapist</span>
            <span className="font-medium text-[#1E2A2E]">{selected.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Specialty</span>
            <span className="font-medium text-[#1E2A2E]">{selected.specialty}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Rate</span>
            <span className="font-medium text-[#1E2A2E]">Rs. {selected.price.toLocaleString("en-IN")} / session</span>
          </div>
        </div>
      )}

      <button
        disabled={!selectedTherapistId}
        onClick={onContinue}
        className={cn(
          "w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
          selectedTherapistId
            ? "bg-[#1F3D2B] text-white hover:bg-[#1F3D2B]/90"
            : "bg-gray-200 text-gray-400 cursor-not-allowed",
        )}
      >
        Continue
        <span className="text-lg">→</span>
      </button>
    </div>
  );
}
