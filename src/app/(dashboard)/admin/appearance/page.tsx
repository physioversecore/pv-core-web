"use client";

import { useState } from "react";
import { RotateCcw, Eye } from "lucide-react";
import { toast } from "sonner";
import { useDesignTokens } from "@/context/design-tokens";
import {
  COLOR_LABELS,
  type TokenColorKey,
} from "@/types/design-tokens";

const COLOR_GROUPS: { label: string; keys: TokenColorKey[] }[] = [
  {
    label: "Brand",
    keys: ["primary", "primaryHover", "primaryLight", "primaryDark", "secondary", "secondaryHover"],
  },
  {
    label: "Text",
    keys: ["text", "textLight", "textMuted", "textInverse"],
  },
  {
    label: "Surfaces",
    keys: ["background", "surface", "card"],
  },
  {
    label: "Borders",
    keys: ["border", "borderLight", "divider"],
  },
  {
    label: "Semantic",
    keys: ["danger", "success", "warning", "info"],
  },
  {
    label: "Brand Accents",
    keys: ["voltageLime", "cyanSpark", "ash", "pureWhite"],
  },
  {
    label: "Editorial Canvas",
    keys: ["midAbyss", "carbonInk", "abyssSoft", "abyssMid", "abyssDeep", "inkSoft", "inkMuted", "inkFaint", "inkDim"],
  },
];

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-3 py-1.5 group cursor-pointer">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-border cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-text-muted font-mono uppercase">{value}</div>
      </div>
    </label>
  );
}

export default function AppearancePage() {
  const { tokens, updateColors, updateTypography, updateRadii, resetTokens, isLoaded } =
    useDesignTokens();
  const [activeGroup, setActiveGroup] = useState(0);

  const handleColorChange = (key: TokenColorKey, value: string) => {
    updateColors({ [key]: value });
  };

  const handleReset = () => {
    resetTokens();
    toast.success("Reset to defaults");
  };

  if (!isLoaded) {
    return (
      <div className="max-w-4xl animate-pulse space-y-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-3 w-24 bg-border rounded mb-2" />
            <div className="h-6 w-72 bg-border rounded" />
          </div>
          <div className="h-8 w-32 bg-border rounded-lg" />
        </div>
        <div className="flex gap-2 mb-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-border rounded-full" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card-soft p-5">
            <div className="h-3 w-20 bg-border rounded mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-border" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-24 bg-border rounded" />
                    <div className="h-2.5 w-16 bg-border rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-soft p-5">
            <div className="h-3 w-28 bg-border rounded mb-4" />
            <div className="h-48 bg-border rounded-xl" />
          </div>
        </div>
        <div className="card-soft p-5">
          <div className="h-3 w-24 bg-border rounded mb-4" />
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-1 space-y-2">
                <div className="h-3.5 w-32 bg-border rounded" />
                <div className="h-10 bg-border rounded-xl" />
              </div>
            ))}
          </div>
        </div>
        <div className="card-soft p-5">
          <div className="h-3 w-28 bg-border rounded mb-4" />
          <div className="h-4 bg-border rounded-full" />
        </div>
      </div>
    );
  }

  const preview = tokens.colors;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="eyebrow mb-1">Appearance</p>
          <h3 className="font-display text-xl">Customize your platform look & feel</h3>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-light hover:text-destructive hover:bg-destructive/10 rounded-lg transition"
        >
          <RotateCcw size={13} />
          Reset to defaults
        </button>
      </div>

      {/* Color groups tabs */}
      <div className="tabs-filter mb-5">
        {COLOR_GROUPS.map((g, i) => (
          <button
            key={g.label}
            onClick={() => setActiveGroup(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              i === activeGroup
                ? "tab-active"
                : "text-text-light hover:text-text"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Color pickers */}
        <div className="card-soft p-5">
          <p className="eyebrow mb-3">{COLOR_GROUPS[activeGroup].label} Colors</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            {COLOR_GROUPS[activeGroup].keys.map((key) => (
              <ColorInput
                key={key}
                label={COLOR_LABELS[key]}
                value={tokens.colors[key]}
                onChange={(v) => handleColorChange(key, v)}
              />
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="card-soft p-5">
          <p className="eyebrow mb-3 flex items-center gap-1.5">
            <Eye size={12} /> Live Preview
          </p>
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: preview.border }}
          >
            {/* Preview header */}
            <div
              className="px-4 py-3 flex items-center gap-3"
              style={{ backgroundColor: preview.background, borderBottom: `1px solid ${preview.border}` }}
            >
              <div className="w-7 h-7 rounded-full" style={{ backgroundColor: preview.secondary }} />
              <span className="font-display text-sm" style={{ color: preview.text }}>
                Sahayatri Physio
              </span>
            </div>

            {/* Preview body */}
            <div className="p-4 space-y-3" style={{ backgroundColor: preview.background }}>
              <div
                className="rounded-lg p-3 border"
                style={{ backgroundColor: preview.card, borderColor: preview.border }}
              >
                <div
                  className="font-mono text-[10px] uppercase tracking-widest mb-1"
                  style={{ color: preview.textLight }}
                >
                  Section Label
                </div>
                <div className="font-display text-base font-medium" style={{ color: preview.text }}>
                  Card Title
                </div>
                <p className="text-xs mt-1" style={{ color: preview.textLight }}>
                  Body text using the secondary text color for descriptions.
                </p>
              </div>

              <div className="flex gap-2">
                <span
                  className="px-3 py-1.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: preview.primary }}
                >
                  Primary
                </span>
                <span
                  className="px-3 py-1.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: preview.secondary }}
                >
                  Secondary
                </span>
                <span
                  className="px-3 py-1.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: preview.danger }}
                >
                  Danger
                </span>
              </div>

              <div className="flex gap-2 text-xs">
                <span
                  className="px-2 py-0.5 rounded-full font-mono text-[10px] uppercase"
                  style={{ backgroundColor: `${preview.success}15`, color: preview.success }}
                >
                  Confirmed
                </span>
                <span
                  className="px-2 py-0.5 rounded-full font-mono text-[10px] uppercase"
                  style={{ backgroundColor: `${preview.warning}15`, color: preview.warning }}
                >
                  Pending
                </span>
                <span
                  className="px-2 py-0.5 rounded-full font-mono text-[10px] uppercase"
                  style={{ backgroundColor: `${preview.info}15`, color: preview.info }}
                >
                  Info
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="card-soft p-5 mt-5">
        <p className="eyebrow mb-3">Typography</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Display Font (Headings)</label>
            <input
              type="text"
              value={tokens.typography.fontDisplay}
              onChange={(e) => updateTypography({ fontDisplay: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm font-mono"
            />
            <p className="text-[11px] text-text-muted mt-1">Applied to h1-h4 and .font-display</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Body Font</label>
            <input
              type="text"
              value={tokens.typography.fontSans}
              onChange={(e) => updateTypography({ fontSans: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm font-mono"
            />
            <p className="text-[11px] text-text-muted mt-1">Applied to body and default text</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Mono Font (Labels)</label>
            <input
              type="text"
              value={tokens.typography.fontMono}
              onChange={(e) => updateTypography({ fontMono: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm font-mono"
            />
            <p className="text-[11px] text-text-muted mt-1">Applied to eyebrow, chips, labels</p>
          </div>
        </div>
      </div>

      {/* Border radius */}
      <div className="card-soft p-5 mt-5">
        <p className="eyebrow mb-3">Border Radius</p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="2rem"
            step="0.125rem"
            value={tokens.radii.base}
            onChange={(e) => updateRadii({ base: e.target.value })}
            className="flex-1 accent-secondary"
          />
          <span className="text-sm font-mono text-text-light w-16 text-right">
            {tokens.radii.base}
          </span>
        </div>
        <div className="flex gap-3 mt-3">
          {["0", "0.5rem", "1rem", "1.5rem", "2rem"].map((v) => (
            <button
              key={v}
              onClick={() => updateRadii({ base: v })}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition ${
                tokens.radii.base === v
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-border hover:bg-surface text-text-light"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
