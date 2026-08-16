"use client";

import { Search, X } from "lucide-react";
import { CITIES, SPECIALTIES } from "@/constants";
import { useLang } from "@/context/i18n";

interface TherapistFiltersProps {
  q: string;
  city: string;
  spec: string;
  gender: string;
  variant?: "light" | "dark";
  onQChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onSpecChange: (v: string) => void;
  onGenderChange: (v: string) => void;
}

export function TherapistFilters({
  q, city, spec, gender, variant = "light",
  onQChange, onCityChange, onSpecChange, onGenderChange,
}: TherapistFiltersProps) {
  const { t } = useLang();
  const dark = variant === "dark";
  const hasFilters = q || city || spec || gender;

  const inputCls = dark
    ? "w-full pl-9 pr-3 h-10 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-voltage-lime"
    : "w-full pl-9 pr-3 h-10 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary";
  const selectCls = dark
    ? "px-3 h-10 rounded-xl border border-white/10 bg-white/5 text-white text-sm [&>option]:text-carbon-ink"
    : "px-3 h-10 rounded-xl border border-border bg-white text-sm";

  const clearAll = () => {
    onQChange("");
    onCityChange("");
    onSpecChange("");
    onGenderChange("");
  };

  return (
    <div className="mb-8">
      <div className={`${dark ? "card-glass" : "card-soft"} p-3 grid sm:grid-cols-[1.4fr_1fr_1fr_1fr] gap-2 items-center`}>
        <div className="relative">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-white/50" : "text-text-light"}`} />
          <input
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            placeholder={t("find.placeholderSearch")}
            className={inputCls}
          />
        </div>
        <select value={city} onChange={(e) => onCityChange(e.target.value)} className={selectCls}>
          <option value="">{t("find.allCities")}</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={spec} onChange={(e) => onSpecChange(e.target.value)} className={selectCls}>
          <option value="">{t("find.allSpecialties")}</option>
          {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={gender} onChange={(e) => onGenderChange(e.target.value)} className={selectCls}>
          <option value="">{t("find.anyGender")}</option>
          <option>{t("find.male")}</option>
          <option>{t("find.female")}</option>
        </select>
      </div>
      {hasFilters && (
        <div className="flex justify-end mt-2">
          <button
            onClick={clearAll}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition ${dark ? "text-white/60 hover:text-voltage-lime" : "text-text-light hover:text-secondary"}`}
          >
            <X size={14} />
            {t("common.clearFilters")}
          </button>
        </div>
      )}
    </div>
  );
}
