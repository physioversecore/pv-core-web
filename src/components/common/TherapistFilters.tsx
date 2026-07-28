"use client";

import { Search, X } from "lucide-react";
import { CITIES, SPECIALTIES } from "@/constants";
import { useLang } from "@/context/i18n";

interface TherapistFiltersProps {
  q: string;
  city: string;
  spec: string;
  gender: string;
  onQChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onSpecChange: (v: string) => void;
  onGenderChange: (v: string) => void;
}

export function TherapistFilters({
  q, city, spec, gender,
  onQChange, onCityChange, onSpecChange, onGenderChange,
}: TherapistFiltersProps) {
  const { t } = useLang();
  const hasFilters = q || city || spec || gender;

  const clearAll = () => {
    onQChange("");
    onCityChange("");
    onSpecChange("");
    onGenderChange("");
  };

  return (
    <div className="mb-8">
      <div className="card-soft p-3 grid sm:grid-cols-[1.4fr_1fr_1fr_1fr] gap-2 items-center">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
          <input
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            placeholder={t("find.placeholderSearch")}
            className="w-full pl-9 pr-3 h-10 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select value={city} onChange={(e) => onCityChange(e.target.value)} className="px-3 h-10 rounded-xl border border-border bg-white text-sm">
          <option value="">{t("find.allCities")}</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={spec} onChange={(e) => onSpecChange(e.target.value)} className="px-3 h-10 rounded-xl border border-border bg-white text-sm">
          <option value="">{t("find.allSpecialties")}</option>
          {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={gender} onChange={(e) => onGenderChange(e.target.value)} className="px-3 h-10 rounded-xl border border-border bg-white text-sm">
          <option value="">{t("find.anyGender")}</option>
          <option>{t("find.male")}</option>
          <option>{t("find.female")}</option>
        </select>
      </div>
      {hasFilters && (
        <div className="flex justify-end mt-2">
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-light hover:text-secondary transition"
          >
            <X size={14} />
            {t("common.clearFilters")}
          </button>
        </div>
      )}
    </div>
  );
}
