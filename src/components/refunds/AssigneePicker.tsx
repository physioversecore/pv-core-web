"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Search } from "lucide-react";
import { getAdminStaffList } from "@/services/api/admin";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";

interface AssigneePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function AssigneePicker({ value, onChange }: AssigneePickerProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data } = useQuery({
    queryKey: ["admin-staff-for-refunds"],
    queryFn: getAdminStaffList,
    placeholderData: (prev) => prev,
  });

  const staff = data?.items ?? [];

  const options = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q),
    );
  }, [staff, debouncedQuery]);

  const selected = staff.find((s) => s.id === value);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search staff name or email…"
          className="pl-8"
        />
      </div>

      {selected && (
        <div className="flex items-center gap-2 text-xs text-secondary">
          <Check size={12} />
          Selected: <span className="font-medium">{selected.name}</span>
        </div>
      )}

      {options.length > 0 && (
        <div className="border border-border rounded-lg divide-y divide-border max-h-40 overflow-y-auto">
          {options.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onChange(s.id);
                setQuery("");
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left cursor-pointer transition ${
                s.id === value ? "bg-secondary/10" : "hover:bg-surface"
              }`}
            >
              <span>
                <span className="font-medium">{s.name}</span>
                <span className="block text-xs text-text-light">{s.email}</span>
              </span>
              {s.id === value && <Check size={14} className="text-secondary" />}
            </button>
          ))}
        </div>
      )}

      {options.length === 0 && staff.length > 0 && (
        <p className="text-xs text-text-light">No staff match “{debouncedQuery}”.</p>
      )}
    </div>
  );
}
