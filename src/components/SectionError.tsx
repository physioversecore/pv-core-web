"use client";

import { useLang } from "@/context/i18n";

interface SectionErrorProps {
  onRetry?: () => void;
}

export function SectionError({ onRetry }: SectionErrorProps) {
  const { t } = useLang();
  return (
    <div className="rounded-2xl border border-danger/20 bg-danger/5 px-6 py-10 text-center">
      <p className="text-sm text-danger-ink mb-4">{t("common.errorLoadingSection")}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-secondary/90"
        >
          {t("common.tryAgain")}
        </button>
      )}
    </div>
  );
}
