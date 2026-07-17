"use client";

import { useState, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { generateSessionBlocks } from "@/lib/availability-utils";
import { to12h } from "@/lib/format";
import type { ScheduleConfig, BlockConfig, BuilderMode } from "@/hooks/useManageAvailability";
import type { DayPart } from "@/lib/availability-utils";
import { ConfirmModal } from "./ConfirmModal";

const ALL_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DAY_PARTS: { key: DayPart; label: string; time: string }[] = [
  { key: "morning", label: "Morning", time: "6:00–12:00" },
  { key: "afternoon", label: "Afternoon", time: "12:00–17:00" },
  { key: "evening", label: "Evening", time: "17:00–22:00" },
];
const PRESETS = [
  { key: "today" as const, label: "Today" },
  { key: "4weeks" as const, label: "Next 4 weeks" },
  { key: "month" as const, label: "This month" },
  { key: "ongoing" as const, label: "Ongoing (no end date)" },
];

const TIME_OPTIONS = Array.from({ length: 65 }, (_, i) => {
  const totalMin = 6 * 60 + i * 15;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

interface ScheduleBuilderProps {
  builderMode: BuilderMode;
  setBuilderMode: (m: BuilderMode) => void;
  scheduleConfig: ScheduleConfig;
  setScheduleConfig: React.Dispatch<React.SetStateAction<ScheduleConfig>>;
  blockConfig: BlockConfig;
  setBlockConfig: React.Dispatch<React.SetStateAction<BlockConfig>>;
  applyPreset: (p: "today" | "4weeks" | "month" | "ongoing") => void;
  workingDays: string[];
  generateAvailability: (data: {
    dateFrom: string;
    dateTo?: string;
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
    sessionDuration: number;
    breakDuration: number;
  }) => Promise<{ updated: number }>;
  isGenerating: boolean;
  blockRange: (data: {
    dateFrom: string;
    dateTo?: string;
    daysOfWeek: string[];
    partsOfDay: string[];
    reason: string;
    notify: boolean;
  }) => Promise<{
    blocked: number;
    cancelledCount: number;
    affectedPatients: { name: string; date: string; time: string }[];
  }>;
  isBlocking: boolean;
}

export function ScheduleBuilder({
  builderMode,
  setBuilderMode,
  scheduleConfig,
  setScheduleConfig,
  blockConfig,
  setBlockConfig,
  applyPreset,
  workingDays,
  generateAvailability,
  isGenerating,
  blockRange,
  isBlocking,
}: ScheduleBuilderProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingBlockResult, setPendingBlockResult] = useState<{
    affectedPatients: { name: string; date: string; time: string }[];
    cancelledCount: number;
  } | null>(null);

  const sessionBlocks = useMemo(() => {
    return generateSessionBlocks({
      startTime: scheduleConfig.startTime,
      endTime: scheduleConfig.endTime,
      sessionDuration: scheduleConfig.sessionDuration,
      breakDuration: scheduleConfig.breakDuration,
    });
  }, [
    scheduleConfig.startTime,
    scheduleConfig.endTime,
    scheduleConfig.sessionDuration,
    scheduleConfig.breakDuration,
  ]);

  const sessions = sessionBlocks.filter((b) => b.type === "session");
  const breaks = sessionBlocks.filter((b) => b.type === "break");

  const toggleDay = (day: string, mode: "avail" | "block") => {
    if (mode === "avail") {
      setScheduleConfig((prev) => ({
        ...prev,
        daysOfWeek: prev.daysOfWeek.includes(day)
          ? prev.daysOfWeek.filter((d) => d !== day)
          : [...prev.daysOfWeek, day],
      }));
    } else {
      setBlockConfig((prev) => ({
        ...prev,
        daysOfWeek: prev.daysOfWeek.includes(day)
          ? prev.daysOfWeek.filter((d) => d !== day)
          : [...prev.daysOfWeek, day],
      }));
    }
  };

  const togglePart = (part: DayPart) => {
    setBlockConfig((prev) => ({
      ...prev,
      partsOfDay: prev.partsOfDay.includes(part)
        ? prev.partsOfDay.filter((p) => p !== part)
        : [...prev.partsOfDay, part],
    }));
  };

  const handleGenerate = async () => {
    await generateAvailability({
      dateFrom: scheduleConfig.dateFrom,
      dateTo: scheduleConfig.dateTo ?? undefined,
      daysOfWeek: scheduleConfig.daysOfWeek,
      startTime: scheduleConfig.startTime,
      endTime: scheduleConfig.endTime,
      sessionDuration: scheduleConfig.sessionDuration,
      breakDuration: scheduleConfig.breakDuration,
    });
  };

  const handleBlock = async () => {
    const result = await blockRange({
      dateFrom: scheduleConfig.dateFrom,
      dateTo: scheduleConfig.dateTo ?? undefined,
      daysOfWeek: blockConfig.daysOfWeek,
      partsOfDay: blockConfig.partsOfDay,
      reason: blockConfig.reason,
      notify: blockConfig.notify,
    });
    if (result.affectedPatients.length > 0) {
      setPendingBlockResult({
        affectedPatients: result.affectedPatients,
        cancelledCount: result.cancelledCount,
      });
      setConfirmOpen(true);
    }
  };

  const isAvail = builderMode === "avail";

  return (
    <div className="card-proto">
      <h2>Schedule builder</h2>

      {/* Mode switch — pill on cream bg */}
      <div className="proto-modeswitch">
        <button
          onClick={() => setBuilderMode("avail")}
          className={isAvail ? "active" : ""}
        >
          Set availability
        </button>
        <button
          onClick={() => setBuilderMode("block")}
          className={!isAvail ? "active danger" : ""}
        >
          Block time off
        </button>
      </div>

      {isAvail ? (
        <AvailMode
          config={scheduleConfig}
          setConfig={setScheduleConfig}
          sessions={sessions}
          breaks={breaks}
          toggleDay={toggleDay}
          applyPreset={applyPreset}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      ) : (
        <BlockMode
          scheduleConfig={scheduleConfig}
          blockConfig={blockConfig}
          setBlockConfig={setBlockConfig}
          workingDays={workingDays}
          toggleDay={toggleDay}
          togglePart={togglePart}
          onBlock={handleBlock}
          isBlocking={isBlocking}
        />
      )}

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Affected bookings"
        description={`${pendingBlockResult?.cancelledCount ?? 0} booking(s) will be cancelled.`}
        confirmLabel="Confirm block"
        onConfirm={() => {
          setConfirmOpen(false);
          setPendingBlockResult(null);
        }}
        affectedPatients={pendingBlockResult?.affectedPatients}
      />
    </div>
  );
}

function AvailMode({
  config,
  setConfig,
  sessions,
  breaks,
  toggleDay,
  applyPreset,
  onGenerate,
  isGenerating,
}: {
  config: ScheduleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ScheduleConfig>>;
  sessions: { startTime: string; endTime: string }[];
  breaks: { startTime: string; endTime: string }[];
  toggleDay: (day: string, mode: "avail") => void;
  applyPreset: (p: "today" | "4weeks" | "month" | "ongoing") => void;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  return (
    <>
      <div className="proto-field-row">
        <div className="proto-field">
          <label>Start time</label>
          <Select
            value={config.startTime}
            onValueChange={(v) =>
              setConfig((prev) => ({ ...prev, startTime: v }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {to12h(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="proto-field">
          <label>End time</label>
          <Select
            value={config.endTime}
            onValueChange={(v) =>
              setConfig((prev) => ({ ...prev, endTime: v }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {to12h(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="proto-field">
          <label>Session duration</label>
          <Select
            value={String(config.sessionDuration)}
            onValueChange={(v) =>
              setConfig((prev) => ({
                ...prev,
                sessionDuration: Number(v),
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[30, 45, 60, 90, 120, 150, 180].map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m} min
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="proto-field">
          <label>Break between sessions</label>
          <Select
            value={String(config.breakDuration)}
            onValueChange={(v) =>
              setConfig((prev) => ({
                ...prev,
                breakDuration: Number(v),
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 5, 10, 15, 20, 30, 45, 60].map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m} min
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date range */}
      <div className="proto-field">
        <label>Applies to</label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="proto-input"
            value={config.dateFrom}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, dateFrom: e.target.value }))
            }
          />
          <span className="text-text-light">to</span>
          <input
            type="date"
            className="proto-input"
            value={config.dateTo ?? ""}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                dateTo: e.target.value || null,
              }))
            }
          />
        </div>
        <div className="proto-presets">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => applyPreset(p.key)}
              className="proto-chip-btn"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Days of week */}
      <div className="proto-subhead">Days of week</div>
      <div className="proto-pillrow">
        {ALL_DAYS.map((day) => (
          <button
            key={day}
            onClick={() => toggleDay(day, "avail")}
            className={`proto-pill ${config.daysOfWeek.includes(day) ? "on" : ""}`}
          >
            {day}
          </button>
        ))}
      </div>
      <p className="proto-preview-note" style={{ marginTop: "6px" }}>
        These are your working days — any day left unselected is automatically your day off.
      </p>

      {/* Session preview */}
      <div style={{ marginTop: "18px" }}>
        <div className="proto-subhead">Session preview</div>
        {sessions.length === 0 ? (
          <p className="proto-preview-note">Adjust times to see session preview</p>
        ) : (
          <>
            <div className="proto-preview-row">
              {sessions.map((s, i) => (
                <div key={i} className="proto-preview-chip">
                  {to12h(s.startTime)} – {to12h(s.endTime)}
                </div>
              ))}
            </div>
            <p className="proto-preview-note">
              {sessions.length} session(s) · {config.breakDuration} min break between
            </p>
          </>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || config.daysOfWeek.length === 0}
        className="proto-cta build"
        style={{ marginTop: "8px" }}
      >
        {isGenerating ? "Generating..." : "Generate & Apply"}
      </button>
    </>
  );
}

function BlockMode({
  scheduleConfig,
  blockConfig,
  setBlockConfig,
  workingDays,
  toggleDay,
  togglePart,
  onBlock,
  isBlocking,
}: {
  scheduleConfig: ScheduleConfig;
  blockConfig: BlockConfig;
  setBlockConfig: React.Dispatch<React.SetStateAction<BlockConfig>>;
  workingDays: string[];
  toggleDay: (day: string, mode: "block") => void;
  togglePart: (part: DayPart) => void;
  onBlock: () => void;
  isBlocking: boolean;
}) {
  return (
    <>
      {/* Date range (reuses schedule config) */}
      <div className="proto-field">
        <label>Applies to</label>
        <div className="flex items-center gap-2">
          <input type="date" className="proto-input" value={scheduleConfig.dateFrom} disabled />
          <span className="text-text-light">to</span>
          <input type="date" className="proto-input" value={scheduleConfig.dateTo ?? ""} disabled />
        </div>
      </div>

      {/* Days of week to block */}
      <div className="proto-subhead">Days of week to block</div>
      <div className="proto-pillrow">
        {ALL_DAYS.map((day) => {
          const isWorking = workingDays.includes(day);
          return (
            <button
              key={day}
              onClick={() => isWorking && toggleDay(day, "block")}
              disabled={!isWorking}
              className={`proto-pill danger ${
                blockConfig.daysOfWeek.includes(day) ? "on" : ""
              } ${!isWorking ? "disabled" : ""}`}
              title={
                !isWorking ? "Not a working day — nothing to block" : undefined
              }
            >
              {day}
            </button>
          );
        })}
      </div>
      <p className="proto-preview-note" style={{ marginTop: "6px" }}>
        Pick which of your working days to block for this range. Days you don&apos;t work are already off.
      </p>

      {/* Parts of day */}
      <div style={{ marginTop: "16px" }}>
        <div className="proto-subhead">Part of day</div>
        <div className="proto-pillrow">
          {DAY_PARTS.map((part) => (
            <button
              key={part.key}
              onClick={() => togglePart(part.key)}
              className={`proto-pill danger ${
                blockConfig.partsOfDay.includes(part.key) ? "on" : ""
              }`}
            >
              {part.label} · {part.time}
            </button>
          ))}
        </div>
      </div>

      {/* Reason */}
      <div style={{ marginTop: "16px" }}>
        <label className="proto-label">
          Reason (shown to affected patients)
        </label>
        <input
          type="text"
          className="proto-input"
          style={{ maxWidth: "480px" }}
          placeholder="e.g. Personal emergency, clinic closed"
          value={blockConfig.reason}
          onChange={(e) =>
            setBlockConfig((prev) => ({ ...prev, reason: e.target.value }))
          }
        />
      </div>

      {/* Notify */}
      <label className="flex items-center gap-2 cursor-pointer" style={{ marginTop: "16px" }}>
        <Checkbox
          checked={blockConfig.notify}
          onCheckedChange={(v) =>
            setBlockConfig((prev) => ({ ...prev, notify: v === true }))
          }
        />
        <span className="text-sm text-text">Notify affected patients</span>
      </label>

      {/* Warning */}
      <div className="proto-warn-banner" style={{ marginTop: "16px" }}>
        <span>
          Blocking time may cancel existing bookings. Patients will be notified
          if the checkbox above is selected.
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={onBlock}
        disabled={
          isBlocking ||
          blockConfig.partsOfDay.length === 0 ||
          blockConfig.daysOfWeek.length === 0
        }
        className="proto-cta block"
        style={{ marginTop: "8px" }}
      >
        {isBlocking ? "Blocking..." : "Block selected time"}
      </button>
    </>
  );
}
