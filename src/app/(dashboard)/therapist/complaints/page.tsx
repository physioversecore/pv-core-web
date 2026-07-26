"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams as useSearchParamsNav, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Paperclip, X, CheckCircle2, FileText } from "lucide-react";
import { useLang } from "@/context/i18n";
import { useSessions } from "@/hooks/useSessions";
import { useTherapistComplaints } from "@/hooks/useTherapistComplaints";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { StatusChip, type StatusType } from "@/components/tables/StatusChip";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const CATEGORIES = [
  { value: "Patient no-show", labelKey: "therapist_complaints.catNoShow" },
  { value: "Repeated no-shows", labelKey: "therapist_complaints.catRepeatedNoShow" },
  { value: "Late cancellation", labelKey: "therapist_complaints.catLateCancellation" },
  { value: "Unsafe environment", labelKey: "therapist_complaints.catUnsafeEnvironment" },
  { value: "Harassment or abuse", labelKey: "therapist_complaints.catHarassment" },
  { value: "Billing dispute", labelKey: "therapist_complaints.catBillingDispute" },
  { value: "Other", labelKey: "therapist_complaints.catOther" },
] as const;

const OUTCOMES = [
  { value: "Refund for wasted trip", labelKey: "therapist_complaints.outcomeRefund" },
  { value: "Formal warning to patient", labelKey: "therapist_complaints.outcomeWarning" },
  { value: "Reassign future sessions", labelKey: "therapist_complaints.outcomeReassign" },
  { value: "Just wanted to report it", labelKey: "therapist_complaints.outcomeJustReport" },
] as const;

const SAFETY_CATEGORIES = ["Unsafe environment"];

const MOCK_THERAPIST_ID = "t1";
const MOCK_THERAPIST_NAME = "Rajesh Shrestha";

function ComplaintsContent() {
  const { t } = useLang();
  const router = useRouter();
  const searchParams = useSearchParamsNav();
  const prefillBookingId = searchParams.get("bookingId") ?? "";

  const { sessions, isLoading: sessionsLoading } = useSessions();
  const { items: myComplaints, submitComplaint, isSubmitting, refetch, isRefetching } = useTherapistComplaints(MOCK_THERAPIST_ID);

  const [form, setForm] = useState({
    bookingId: prefillBookingId,
    patientId: "",
    category: "",
    description: "",
    preferredOutcome: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState<{ id: string; category: string } | null>(null);

  const patientsSeen = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    sessions.forEach((s) => {
      if (s.patientId && s.patientName) {
        map.set(s.patientId, { id: s.patientId, name: s.patientName });
      }
    });
    return Array.from(map.values());
  }, [sessions]);

  const recentBookings = useMemo(() => {
    return sessions
      .slice(0, 20)
      .map((s) => ({
        id: s.id,
        label: `${s.patientName ?? "Patient"} — ${s.date}, ${s.time}`,
        patientId: s.patientId,
        patientName: s.patientName ?? "",
      }));
  }, [sessions]);

  const prefillPatient = useMemo(() => {
    if (!form.bookingId) return null;
    const match = recentBookings.find((b) => b.id === form.bookingId);
    return match ? { id: match.patientId, name: match.patientName } : null;
  }, [form.bookingId, recentBookings]);

  const selectedPatientId = form.patientId || prefillPatient?.id || "";
  const selectedPatientName = prefillPatient?.name || patientsSeen.find((p) => p.id === form.patientId)?.name || "";

  const isSafetyConcern = SAFETY_CATEGORIES.includes(form.category);
  const autoPriority = isSafetyConcern ? "Urgent" : "Normal";

  const handleBookingChange = useCallback((bookingId: string) => {
    setForm((prev) => ({ ...prev, bookingId }));
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setForm((prev) => ({ ...prev, category }));
  }, []);

  const handleFileAdd = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    setFiles((prev) => {
      const combined = [...prev, ...incoming];
      if (combined.length > 3) {
        toast.error(t("therapist_complaints.evidenceMaxError"));
        return combined.slice(0, 3);
      }
      return combined;
    });
    e.target.value = "";
  }, [t]);

  const handleFileRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!form.category) {
        toast.error(t("therapist_complaints.errorCategory"));
        return;
      }
      if (form.description.trim().length < 20) {
        toast.error(t("therapist_complaints.errorDescription"));
        return;
      }
      if (!selectedPatientId) {
        toast.error(t("therapist_complaints.errorPatient"));
        return;
      }

      const success = await submitComplaint({
        therapistId: MOCK_THERAPIST_ID,
        therapist: MOCK_THERAPIST_NAME,
        patientId: selectedPatientId,
        patient: selectedPatientName,
        bookingId: form.bookingId || undefined,
        category: form.category,
        priority: autoPriority as "Normal" | "Urgent",
        description: form.description.trim(),
        evidenceUrls: files.map((f) => `/uploads/${f.name}`),
        preferredOutcome: form.preferredOutcome || undefined,
      });

      if (success) {
        const newId = `CMT-${String(100 + myComplaints.length + 1).padStart(3, "0")}`;
        setSubmitted({ id: newId, category: form.category });
        toast.success(t("therapist_complaints.submitted"));
      }
    },
    [form, selectedPatientId, selectedPatientName, autoPriority, files, submitComplaint, myComplaints.length, t]
  );

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card-soft p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-success" />
          </div>
          <h2 className="font-display text-2xl mb-2">{t("therapist_complaints.confirmTitle")}</h2>
          <p className="text-text-light text-sm mb-6">{t("therapist_complaints.confirmDesc")}</p>
          <div className="bg-surface rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-light">{t("therapist_complaints.complaintId")}</span>
              <span className="font-mono font-medium">{submitted.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-light">{t("therapist_complaints.category")}</span>
              <span>{submitted.category}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-light">{t("therapist_complaints.expectedResponse")}</span>
              <span>{t("therapist_complaints.within48Hours")}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setSubmitted(null); setForm({ bookingId: "", patientId: "", category: "", description: "", preferredOutcome: "" }); setFiles([]); }}
              className="btn-outline !px-5"
            >
              {t("therapist_complaints.fileAnother")}
            </button>
            <button
              onClick={() => router.push("/therapist/settings")}
              className="btn-secondary !px-5"
            >
              {t("therapist_complaints.backToSettings")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
      </div>
      <form onSubmit={handleSubmit} className="card-soft p-5">
        <p className="eyebrow mb-1">{t("therapist_complaints.fileComplaint")}</p>
        <h3 className="font-display text-lg mb-1">{t("therapist_complaints.reportIssue")}</h3>
        <p className="text-sm text-text-light mb-4">{t("therapist_complaints.reportDesc")}</p>

        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-text-light">{t("therapist_complaints.relatedBooking")}</label>
            <select
              value={form.bookingId}
              onChange={(e) => handleBookingChange(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
            >
              <option value="">{t("therapist_complaints.generalBooking")}</option>
              {recentBookings.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-light">{t("therapist_complaints.patient")}</label>
            {prefillPatient ? (
              <div className="mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface/40 text-sm font-medium">
                {prefillPatient.name}
              </div>
            ) : (
              <select
                value={form.patientId}
                onChange={(e) => setForm((prev) => ({ ...prev, patientId: e.target.value }))}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
              >
                <option value="">{t("therapist_complaints.selectPatient")}</option>
                {patientsSeen.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs font-medium text-text-light">{t("therapist_complaints.category")} *</label>
          <select
            value={form.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
          >
            <option value="">{t("therapist_complaints.selectCategory")}</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
            ))}
          </select>
        </div>

        {isSafetyConcern && (
          <div className="card-highlight rounded-xl p-4 mb-3 flex items-start gap-3">
            <AlertTriangle size={18} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">{t("therapist_complaints.safetyRedirectTitle")}</p>
              <p className="text-xs text-text-light mb-2">{t("therapist_complaints.safetyRedirectDesc")}</p>
              <button
                type="button"
                onClick={() => router.push("/admin/safety-incidents")}
                className="text-xs font-medium text-secondary underline"
              >
                {t("therapist_complaints.goToSafetyIncident")}
              </button>
            </div>
          </div>
        )}

        <div className="mb-3">
          <label className="text-xs font-medium text-text-light">
            {t("therapist_complaints.priority")} — {t("therapist_complaints.autoSuggested")}
          </label>
          <div className="mt-1">
            <StatusChip status={autoPriority as StatusType} />
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs font-medium text-text-light">{t("therapist_complaints.description")} *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            maxLength={1000}
            placeholder={t("therapist_complaints.descriptionPlaceholder")}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-text-muted">
              {form.description.length < 20 && form.description.length > 0
                ? `${20 - form.description.length} ${t("therapist_complaints.charsMinRemaining")}`
                : ""}
            </span>
            <span className="text-xs text-text-muted">{form.description.length}/1000</span>
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs font-medium text-text-light">{t("therapist_complaints.evidence")}</label>
          <div className="mt-1 flex items-center gap-3">
            <label className="btn-outline !py-2 !px-4 text-xs cursor-pointer inline-flex items-center gap-1.5">
              <Paperclip size={13} />
              {t("therapist_complaints.attachFile")}
              <input type="file" multiple accept="image/*,.pdf" onChange={handleFileAdd} className="hidden" />
            </label>
            <span className="text-xs text-text-muted">{t("therapist_complaints.evidenceDesc")}</span>
          </div>
          {files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-surface rounded-lg px-2.5 py-1 text-xs">
                  <FileText size={12} className="text-text-light" />
                  {f.name}
                  <button type="button" onClick={() => handleFileRemove(i)} className="text-text-muted hover:text-danger">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-text-light">{t("therapist_complaints.preferredOutcome")}</label>
          <select
            value={form.preferredOutcome}
            onChange={(e) => setForm((prev) => ({ ...prev, preferredOutcome: e.target.value }))}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
          >
            <option value="">{t("therapist_complaints.selectOutcome")}</option>
            {OUTCOMES.map((o) => (
              <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-text-light">{t("therapist_complaints.identityNote")}</span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-secondary !px-5 disabled:opacity-50"
          >
            {isSubmitting ? t("therapist_complaints.submitting") : t("therapist_complaints.submitReport")}
          </button>
        </div>
      </form>

      <div className="card-soft p-5">
        <p className="eyebrow mb-1">{t("therapist_complaints.myComplaints")}</p>
        <h3 className="font-display text-lg mb-4">{t("therapist_complaints.myComplaintsTitle")}</h3>

        {myComplaints.length === 0 ? (
          <p className="text-sm text-text-light py-6 text-center">{t("therapist_complaints.noComplaints")}</p>
        ) : (
          <div className="space-y-3">
            {myComplaints.map((c) => (
              <div key={c.id} className="border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-text-light">{c.id}</span>
                    <StatusChip status={c.status} />
                    <StatusChip status={c.priority} />
                  </div>
                  <span className="text-xs text-text-muted font-mono whitespace-nowrap">
                    {new Date(c.filed).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <p className="text-sm font-medium mb-1">
                  {t("therapist_complaints.against")} {c.against}
                </p>
                <p className="text-xs text-text-light mb-1">{c.category}</p>
                <p className="text-sm text-text-light line-clamp-2">{c.description}</p>
                {c.notes && c.notes.length > 0 && (
                  <div className="mt-3 border-t border-border pt-2">
                    <p className="text-xs font-medium text-text-light mb-1">{t("therapist_complaints.resolutionNote")}</p>
                    {c.notes.map((note, i) => (
                      <p key={i} className="text-xs text-text-light bg-surface rounded-lg px-3 py-2 mt-1">{note}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TherapistComplaintsPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="py-16 text-center text-text-light text-sm">Loading...</div>}>
        <ComplaintsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
