"use client";

import Link from "next/link";
import { Search, Star, ArrowUpRight, X } from "lucide-react";
import { useLang } from "@/context/i18n";
import { Avatar } from "@/components/Avatar";
import { HeroLiveSkeleton } from "@/components/SuspenseFallback";
import { CITIES, SPECIALTIES } from "@/constants";
import { npr } from "@/lib/cart";
import type { Therapist } from "@/lib/types";

interface HeroFindTherapistProps {
  q: string;
  city: string;
  spec: string;
  gender: string;
  filtered: Therapist[];
  loading?: boolean;
  hasFilters?: boolean;
  onQChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onSpecChange: (v: string) => void;
  onGenderChange: (v: string) => void;
  onClear?: () => void;
}

export function HeroFindTherapist({
  q,
  city,
  spec,
  gender,
  filtered,
  loading,
  onQChange,
  onCityChange,
  onSpecChange,
  onGenderChange,
  hasFilters,
  onClear,
}: HeroFindTherapistProps) {
  const { t } = useLang();

  const selectCls =
    "px-2 h-11 min-w-0 rounded-xl border-2 border-carbon-soft bg-paper-bright text-xs font-mono font-bold uppercase tracking-wide shadow-[1px_1px_0_var(--color-carbon-soft)] focus:outline-none focus:ring-2 focus:ring-volt";

  return (
    <div className="relative rounded-2xl p-6 lg:p-7 card-neo !bg-paper-bright !text-carbon">
      <div className="chip-volt absolute -top-4 left-6">{t("find.eyebrow")}</div>
      <div className="font-display font-bold text-lg text-carbon mb-4">{t("find.title")}</div>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
        <input
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          placeholder={t("find.placeholderSearch")}
          className="input-neo pl-9 h-11 w-full"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <select value={city} onChange={(e) => onCityChange(e.target.value)} className={selectCls}>
          <option value="">{t("find.allCities")}</option>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={spec} onChange={(e) => onSpecChange(e.target.value)} className={selectCls}>
          <option value="">{t("find.allSpecialties")}</option>
          {SPECIALTIES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={gender}
          onChange={(e) => onGenderChange(e.target.value)}
          className={selectCls}
        >
          <option value="">{t("find.anyGender")}</option>
          <option>{t("find.male")}</option>
          <option>{t("find.female")}</option>
        </select>
      </div>

      <div className="space-y-3">
        {loading ? (
          <HeroLiveSkeleton />
        ) : filtered.length === 0 ? (
          <p className="font-display uppercase text-xs text-text-light text-center py-6">
            {t("find.noMatch")}
          </p>
        ) : (
          filtered.slice(0, 5).map((th) => (
            <div
              key={th.id}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-carbon-soft"
            >
              <Avatar name={th.name} size={42} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate text-carbon">{th.name}</div>
                <div className="text-xs text-text-light truncate">
                  {th.specialty} · {th.city}
                </div>
                <div className="flex items-center gap-1 text-xs text-text-light mt-0.5">
                  <Star size={11} className="fill-volt text-carbon" /> {th.rating}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-carbon">{npr(th.price)}</div>
                <Link
                  href={`/therapist/${th.id}`}
                  className="mt-1 inline-flex items-center gap-1 !py-1.5 !px-3.5 text-xs btn-volt"
                >
                  {t("common.profile")}
                  <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-5">
        {hasFilters && (
          <button
            onClick={() => onClear?.()}
            className="block w-full text-center font-mono font-bold uppercase text-xs py-3 rounded-xl border-2 border-danger text-danger hover:bg-danger hover:text-paper-bright transition-colors"
          >
            <X size={14} className="inline-block mr-1 align-[-2px]" />
            {t("common.clearFilters")}
          </button>
        )}
        <Link
          href="/find-a-therapist"
          className={`block w-full text-center font-mono font-bold uppercase text-xs py-3 rounded-xl border-2 border-carbon-soft hover:bg-volt transition-colors ${
            hasFilters ? "col-span-1" : "col-span-2"
          }`}
        >
          {t("common.viewAll")} →
        </Link>
      </div>
    </div>
  );
}
