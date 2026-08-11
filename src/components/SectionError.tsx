"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { useLang } from "@/context/i18n";

interface SectionErrorProps {
  onRetry?: () => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const COOLDOWN_MS = 60_000;

let retryBudget = 0;
let budgetUpdatedAt = 0;

function isBudgetExpired(): boolean {
  return Date.now() - budgetUpdatedAt > COOLDOWN_MS;
}

function currentBudget(): number {
  return isBudgetExpired() ? 0 : retryBudget;
}

function consumeBudget(): boolean {
  if (isBudgetExpired()) retryBudget = 0;
  if (retryBudget >= MAX_RETRIES) return false;
  retryBudget += 1;
  budgetUpdatedAt = Date.now();
  return true;
}

function resetBudget(): void {
  retryBudget = 0;
  budgetUpdatedAt = Date.now();
}

export function SectionError({ onRetry }: SectionErrorProps) {
  const { t } = useLang();
  const [attempts, setAttempts] = useState(0);
  const [failed, setFailed] = useState(false);
  const onRetryRef = useRef(onRetry);
  onRetryRef.current = onRetry;

  useEffect(() => {
    if (failed) return;
    if (!onRetryRef.current) {
      setFailed(true);
      return;
    }
    if (attempts >= MAX_RETRIES || currentBudget() >= MAX_RETRIES) {
      setFailed(true);
      return;
    }
    const timer = setTimeout(() => {
      if (!consumeBudget()) {
        setFailed(true);
        return;
      }
      setAttempts((a) => a + 1);
      onRetryRef.current?.();
    }, RETRY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [attempts, failed]);

  const handleRetry = () => {
    resetBudget();
    setFailed(false);
    setAttempts(1);
    onRetryRef.current?.();
  };

  if (!failed) {
    const progress = Math.min(Math.max(attempts + 1, currentBudget() + 1), MAX_RETRIES);
    return (
      <div className="card-neo !bg-paper-bright !text-carbon rounded-2xl p-6 lg:p-8 text-center">
        <div className="chip-volt mx-auto mb-3">
          <span className="w-2 h-2 rounded-full bg-carbon dot-pulse inline-block" />
          {t("common.retrying")}
        </div>
        <p className="font-mono font-bold uppercase text-[11px] tracking-widest text-text-light mb-4">
          {progress} / {MAX_RETRIES}
        </p>
        <div className="max-w-xs mx-auto space-y-2.5">
          <div className="h-3 bg-surface rounded animate-pulse" />
          <div className="h-3 w-2/3 mx-auto bg-surface rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="card-neo !bg-paper-bright !text-carbon rounded-2xl p-6 lg:p-8 text-center">
      <div className="chip-volt mx-auto mb-4">{t("common.errorLoadingTitle")}</div>
      <h3 className="font-display font-extrabold uppercase tracking-tight text-xl md:text-2xl text-carbon mb-2">
        {t("common.errorLoadingSection")}
      </h3>
      {onRetry && (
        <button type="button" onClick={handleRetry} className="btn-volt mt-4">
          <RotateCw size={14} />
          {t("common.tryAgain")}
        </button>
      )}
    </div>
  );
}
