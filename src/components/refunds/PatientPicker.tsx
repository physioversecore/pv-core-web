"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, Search, User } from "lucide-react";
import { getAdminPatients } from "@/services/api/admin";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";

interface PatientPickerProps {
  value: string;
  onChange: (id: string) => void;
}

export function PatientPicker({ value, onChange }: PatientPickerProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["refund-patient-search", debouncedQuery],
    queryFn: () => getAdminPatients({ search: debouncedQuery || undefined, limit: 10 }),
    placeholderData: (prev) => prev,
  });

  const patients = data?.items ?? [];

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patient name, email or phone…"
          className="pl-8"
        />
      </div>

      {value && (
        <div className="flex items-center gap-2 text-xs text-secondary">
          <Check size={12} />
          Selected patient:{" "}
          <span className="font-medium">{patients.find((p) => p.id === value)?.name ?? "—"}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-text-light py-1">
          <Loader2 size={12} className="animate-spin" />
          Searching…
        </div>
      ) : patients.length > 0 ? (
        <div className="border border-border rounded-lg divide-y divide-border max-h-44 overflow-y-auto">
          {patients.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onChange(p.id);
                setQuery("");
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left cursor-pointer transition ${
                p.id === value ? "bg-secondary/10" : "hover:bg-surface"
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <User size={14} className="shrink-0 text-text-light" />
                <span className="min-w-0">
                  <span className="block font-medium truncate">{p.name}</span>
                  <span className="block text-xs text-text-light truncate">
                    {[p.email, p.phone, p.city].filter(Boolean).join(" · ") || p.id}
                  </span>
                </span>
              </span>
              {p.id === value && <Check size={14} className="shrink-0 text-secondary" />}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-light">
          No patients found{debouncedQuery ? ` for “${debouncedQuery}”` : ""}.
        </p>
      )}
    </div>
  );
}
