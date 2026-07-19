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
import { config } from "process";

const ALL_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
// const DAY_PARTS: { key: DayPart; label: string; time: string }[] = [
//   { key: "morning", label: "Morning", time: "6:00–12:00" },
//   { key: "afternoon", label: "Afternoon", time: "12:00–17:00" },
//   { key: "evening", label: "Evening", time: "17:00–22:00" },
// ];
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
  hasConfigChanged: boolean;
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
  blockRequest: (data: {
    dateFrom: string;
    dateTo?: string;
    daysOfWeek: string[];
    partsOfDay: string[];
    reason: string;
    notify: boolean;
  }) => Promise<{ id: string; status: string }>;
  isRequestingBlock: boolean;
  hasBookedSlotsInRange: (
    dateFrom: string,
    dateTo: string,
    daysOfWeek: string[],
    partsOfDay: string[],
  ) => boolean;
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
  hasConfigChanged,
  blockRange,
  isBlocking,
  blockRequest,
  isRequestingBlock,
  hasBookedSlotsInRange,
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
    const dateFrom =
      blockConfig.blockType === "specific"
        ? blockConfig.dateSpecific
        : blockConfig.dateFrom;
    const dateTo =
      blockConfig.blockType === "specific"
        ? blockConfig.dateSpecific
        : blockConfig.dateTo ?? blockConfig.dateFrom;

    const hasBooked = hasBookedSlotsInRange(
      dateFrom,
      dateTo,
      blockConfig.daysOfWeek,
      blockConfig.partsOfDay,
    );

    const payload = {
      dateFrom,
      dateTo: blockConfig.blockType === "specific" ? undefined : dateTo,
      daysOfWeek: blockConfig.daysOfWeek,
      partsOfDay: blockConfig.partsOfDay,
      reason: blockConfig.reason,
      notify: blockConfig.notify,
    };

    if (hasBooked) {
      await blockRequest(payload);
    } else {
      const result = await blockRange(payload);
      if (result.affectedPatients.length > 0) {
        setPendingBlockResult({
          affectedPatients: result.affectedPatients,
          cancelledCount: result.cancelledCount,
        });
        setConfirmOpen(true);
      }
    }
  };

  const blockDateFrom =
    blockConfig.blockType === "specific"
      ? blockConfig.dateSpecific
      : blockConfig.dateFrom;
  const blockDateTo =
    blockConfig.blockType === "specific"
      ? blockConfig.dateSpecific
      : blockConfig.dateTo ?? blockConfig.dateFrom;

  const hasBookedInRange = hasBookedSlotsInRange(
    blockDateFrom,
    blockDateTo,
    blockConfig.daysOfWeek,
    blockConfig.partsOfDay,
  );

  const canBlock =
    !!blockConfig.reason.trim() &&
    (blockConfig.blockType === "specific"
      ? !!blockConfig.dateSpecific
      : !!blockConfig.dateFrom);

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
          hasConfigChanged={hasConfigChanged}
        />
      ) : (
        <BlockMode
          blockConfig={blockConfig}
          setBlockConfig={setBlockConfig}
          toggleDay={toggleDay}
          togglePart={togglePart}
          onBlock={handleBlock}
          isBlocking={isBlocking}
          isRequestingBlock={isRequestingBlock}
          hasBookedInRange={hasBookedInRange}
          canBlock={canBlock}
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
  hasConfigChanged,
}: {
  config: ScheduleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ScheduleConfig>>;
  sessions: { startTime: string; endTime: string }[];
  breaks: { startTime: string; endTime: string }[];
  toggleDay: (day: string, mode: "avail") => void;
  applyPreset: (p: "today" | "4weeks" | "month" | "ongoing") => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasConfigChanged: boolean;
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
                  {m >= 60 ? `${m / 60}h` : `${m} min`}
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
              {[30, 45, 60, 90, 120, 150, 180].map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m >= 60 ? `${m / 60}h` : `${m} min`}
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
              {sessions.length} session(s) · {config.breakDuration >= 60 ? `${config.breakDuration / 60}h` : `${config.breakDuration} min`} break between
            </p>
          </>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || config.daysOfWeek.length === 0 || !hasConfigChanged}
        className="proto-cta build"
        style={{ marginTop: "8px" }}
      >
        {isGenerating ? "Generating..." : "Generate & Apply"}
      </button>
    </>
  );
}

function BlockMode({
  blockConfig,
  setBlockConfig,
  toggleDay,
  togglePart,
  onBlock,
  isBlocking,
  isRequestingBlock,
  hasBookedInRange,
  canBlock,
}: {
  blockConfig: BlockConfig;
  setBlockConfig: React.Dispatch<React.SetStateAction<BlockConfig>>;
  toggleDay: (day: string, mode: "block") => void;
  togglePart: (part: DayPart) => void;
  onBlock: () => void;
  isBlocking: boolean;
  isRequestingBlock: boolean;
  hasBookedInRange: boolean;
  canBlock: boolean;
}) {
  const setBlockType = (t: BlockConfig["blockType"]) =>
    setBlockConfig((prev) => ({ ...prev, blockType: t }));

  return (
    <>
      {/* ── Block type segmented ── */}
      <div className="proto-subhead">What to block</div>
      <div className="proto-modeswitch" style={{ marginBottom: "16px" }}>
        <button
          onClick={() => setBlockType("specific")}
          className={blockConfig.blockType === "specific" ? "active" : ""}
        >
          Specific date
        </button>
        <button
          onClick={() => setBlockType("range")}
          className={blockConfig.blockType === "range" ? "active" : ""}
        >
          Date range
        </button>
        <button
          onClick={() => setBlockType("recurring")}
          className={blockConfig.blockType === "recurring" ? "active" : ""}
        >
          Recurring days
        </button>
      </div>

      {/* ── Specific date ── */}
      {blockConfig.blockType === "specific" && (
        <div className="proto-field">
          <label>Pick a date to block</label>
          <input
            type="date"
            className="proto-input"
            style={{ maxWidth: "240px" }}
            value={blockConfig.dateSpecific}
            onChange={(e) =>
              setBlockConfig((prev) => ({
                ...prev,
                dateSpecific: e.target.value,
              }))
            }
          />
        </div>
      )}

      {/* ── Date range ── */}
      {blockConfig.blockType === "range" && (
        <div className="proto-field">
          <label>Date range</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="proto-input"
              value={blockConfig.dateFrom}
              onChange={(e) =>
                setBlockConfig((prev) => ({ ...prev, dateFrom: e.target.value }))
              }
            />
            <span className="text-text-light">to</span>
            <input
              type="date"
              className="proto-input"
              value={blockConfig.dateTo ?? ""}
              onChange={(e) =>
                setBlockConfig((prev) => ({
                  ...prev,
                  dateTo: e.target.value || null,
                }))
              }
            />
          </div>
        </div>
      )}

      {/* ── Recurring days ── */}
      {blockConfig.blockType === "recurring" && (
        <>
          <div className="proto-field">
            <label>Applies to</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="proto-input"
                value={blockConfig.dateFrom}
                onChange={(e) =>
                  setBlockConfig((prev) => ({
                    ...prev,
                    dateFrom: e.target.value,
                  }))
                }
              />
              <span className="text-text-light">to</span>
              <input
                type="date"
                className="proto-input"
                value={blockConfig.dateTo ?? ""}
                onChange={(e) =>
                  setBlockConfig((prev) => ({
                    ...prev,
                    dateTo: e.target.value || null,
                  }))
                }
              />
            </div>
          </div>

          {/* Days of week */}
          <div className="proto-subhead">Days of week to block</div>
          <div className="proto-pillrow">
            {ALL_DAYS.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day, "block")}
                className={`proto-pill danger ${
                  blockConfig.daysOfWeek.includes(day) ? "on" : ""
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          <p className="proto-preview-note" style={{ marginTop: "6px" }}>
            Leave empty to block every day in the range.
          </p>
        </>
      )}

      {/* ── Parts of day (optional, all modes) ── */}
      {/* <div style={{ marginTop: "16px" }}>
        <div className="proto-subhead">
          Part of day{" "}
          <span className="text-text-muted font-normal">(optional)</span>
        </div>
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
        <p className="proto-preview-note" style={{ marginTop: "6px" }}>
          Leave empty to block the entire day.
        </p>
      </div> */}

      {/* ── Reason ── */}
      <div style={{ marginTop: "16px" }}>
        <label className="proto-label">
          Reason (shown to affected patients)
        </label>
        <input
          type="text"
          className="proto-input"
          style={{ width: "100%", maxWidth: "640px" }}
          placeholder="e.g. Personal emergency, clinic closed"
          required
          value={blockConfig.reason}
          onChange={(e) =>
            setBlockConfig((prev) => ({ ...prev, reason: e.target.value }))
          }
        />
      </div>

      {/* ── Notify ── */}
      <label
        className="flex items-center gap-2 cursor-pointer"
        style={{ marginTop: "16px" }}
      >
        <Checkbox
          checked={blockConfig.notify}
          onCheckedChange={(v) =>
            setBlockConfig((prev) => ({ ...prev, notify: v === true }))
          }
        />
        <span className="text-sm text-text">Notify affected patients</span>
      </label>

      {/* ── Warning ── */}
      {hasBookedInRange ? (
        <div
          className="proto-warn-banner"
          style={{ marginTop: "16px", background: "#FEF3C7", borderColor: "#F59E0B" }}
        >
          <span>
            This selection has existing bookings. You cannot block directly — a
            request will be sent to admin for approval.
          </span>
        </div>
      ) : (
        <div className="proto-warn-banner" style={{ marginTop: "16px" }}>
          <span>
            Blocking will mark open slots as off. No bookings will be affected.
          </span>
        </div>
      )}

      {/* ── CTA ── */}
      <button
        onClick={onBlock}
        disabled={isBlocking || isRequestingBlock || !canBlock}
        className="proto-cta block"
        style={{ marginTop: "8px" }}
      >
        {isBlocking
          ? "Blocking..."
          : isRequestingBlock
            ? "Sending request..."
            : hasBookedInRange
              ? "Request block from admin"
              : "Block selected time"}
      </button>
    </>
  );
}
