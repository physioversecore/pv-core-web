"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { Avatar } from "@/components/common/Avatar";
import type { BookingPatient } from "./types";

interface Props {
  patients: BookingPatient[];
  selectedPatientId: string;
  onSelect: (patient: BookingPatient) => void;
  onContinue: () => void;
}

export function PatientSelectStep({ patients, selectedPatientId, onSelect, onContinue }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const selected = patients.find((p) => p.id === selectedPatientId);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.email.toLowerCase().includes(query.toLowerCase()),
  );

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
        <h2 className="text-xl font-bold text-[#1E2A2E]">Select patient</h2>
        <p className="text-sm text-gray-500 mt-1">Choose which patient you are booking for</p>
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
              <span className="text-gray-400 text-xs hidden sm:inline">{selected.email}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-gray-400">
              <Search size={16} />
              Search patients by name or email...
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
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3D2B]/20 focus:border-[#1F3D2B]"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  No patients found
                </div>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelect(p);
                      close();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left",
                      p.id === selectedPatientId && "bg-[#1F3D2B]/5",
                    )}
                  >
                    <Avatar name={p.name} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#1E2A2E] truncate">{p.name}</div>
                      <div className="text-xs text-gray-400 truncate">{p.email} · {p.phone}</div>
                    </div>
                    {p.id === selectedPatientId && (
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
            <span className="text-gray-500">Patient</span>
            <span className="font-medium text-[#1E2A2E]">{selected.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone</span>
            <span className="font-medium text-[#1E2A2E]">{selected.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-[#1E2A2E]">{selected.email}</span>
          </div>
        </div>
      )}

      <button
        disabled={!selectedPatientId}
        onClick={onContinue}
        className={cn(
          "w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
          selectedPatientId
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
