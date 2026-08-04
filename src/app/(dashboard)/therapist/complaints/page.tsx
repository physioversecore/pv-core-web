"use client";

import { useState, useMemo, useCallback, useRef, Suspense } from "react";
import { useSearchParams as useSearchParamsNav, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Paperclip, X, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useLang } from "@/context/i18n";
import { useSessions } from "@/hooks/useSessions";
import { useTherapistComplaints } from "@/hooks/useTherapistComplaints";
import { StatusChip, type StatusType } from "@/components/tables/StatusChip";
import { PreviewDialog, isPreviewableByName } from "@/components/PreviewDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { formatDate, to12h } from "@/lib/format";

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

  const { sessions } = useSessions();
  const { items: myComplaints, submitComplaint, isSubmitting, isLoading: complaintsLoading, isRefetching } = useTherapistComplaints(MOCK_THERAPIST_ID);

  const [form, setForm] = useState({
    bookingId: prefillBookingId,
    patientId: "",
    category: "",
    description: "",
    preferredOutcome: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<{ url: string; name: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

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
        label: `${s.patientName ?? "Patient"} — ${formatDate(s.date)}, ${to12h(s.time)}`,
        patientId: s.patientId,
        patientName: s.patientName ?? "",
      }));
  }, [sessions]);

  const filteredBookings = useMemo(() => {
    if (!form.patientId) return [];
    return recentBookings.filter((b) => b.patientId === form.patientId);
  }, [recentBookings, form.patientId]);

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

      if (submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);

      try {
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

        let evidenceUrls: string[] = [];
        if (files.length > 0) {
          const session = `complaint-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const formData = new FormData();
          formData.append("session", session);
          files.forEach((f) => formData.append("files", f));

          try {
            const res = await fetch("/api/uploads/complaint-evidence", {
              method: "POST",
              body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            evidenceUrls = (data.urls ?? []).map((u: { url: string; fileName: string }) =>
              `${u.url}?name=${encodeURIComponent(u.fileName)}`
            );
          } catch {
            toast.error(t("therapist_complaints.evidenceUploadError"));
            return;
          }
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
          evidenceUrls,
          preferredOutcome: form.preferredOutcome || undefined,
        });

        if (success) {
          toast.success(t("therapist_complaints.submitted"));
          setForm({ bookingId: "", patientId: "", category: "", description: "", preferredOutcome: "" });
          setFiles([]);
        }
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [form, selectedPatientId, selectedPatientName, autoPriority, files, submitComplaint, t]
  );

  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <form onSubmit={handleSubmit} className="card-soft p-5">
        <p className="eyebrow mb-1">{t("therapist_complaints.fileComplaint")}</p>
        <h3 className="font-display text-lg mb-1">{t("therapist_complaints.reportIssue")}</h3>
        <p className="text-sm text-text-light mb-4">{t("therapist_complaints.reportDesc")}</p>

        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-text-light">{t("therapist_complaints.patient")} *</label>
            {prefillPatient ? (
              <div className="mt-1 px-3 py-2.5 rounded-xl border border-border bg-surface/40 text-sm font-medium">
                {prefillPatient.name}
              </div>
            ) : (
              <select
                value={form.patientId}
                onChange={(e) => {
                  const newPatientId = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    patientId: newPatientId,
                    bookingId: prev.bookingId && newPatientId ? prev.bookingId : "",
                  }));
                }}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
              >
                <option value="">{t("therapist_complaints.selectPatient")}</option>
                {patientsSeen.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-text-light">{t("therapist_complaints.relatedBooking")}</label>
            <select
              value={form.bookingId}
              onChange={(e) => handleBookingChange(e.target.value)}
              disabled={!form.patientId}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{form.patientId ? t("therapist_complaints.generalBooking") : "Select patient first"}</option>
              {filteredBookings.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
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
              {/*<p className="text-xs text-text-light mb-2">{t("therapist_complaints.safetyRedirectDesc")}</p>*/}
              {/*<button
                type="button"
                onClick={() => router.push("/admin/safety-incidents")}
                className="text-xs font-medium text-secondary underline"
              >
                {t("therapist_complaints.goToSafetyIncident")}
              </button>*/}
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
                  {isPreviewableByName(f.name) ? (
                    <button type="button" onClick={() => setPreviewFile(f)} className="hover:underline text-secondary">
                      {f.name}
                    </button>
                  ) : (
                    f.name
                  )}
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
            disabled={isSubmitting || submitting}
            className="btn-secondary !px-5 disabled:opacity-50"
          >
            {isSubmitting || submitting ? t("therapist_complaints.submitting") : t("therapist_complaints.submitReport")}
          </button>
        </div>
      </form>

      <div className="card-soft p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="eyebrow mb-1">{t("therapist_complaints.myComplaints")}</p>
            <h3 className="font-display text-lg">{t("therapist_complaints.myComplaintsTitle")}</h3>
          </div>
          {isRefetching && (
            <span className="text-xs text-text-light">Refreshing...</span>
          )}
        </div>
        {complaintsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="border border-border rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-surface rounded w-1/3 mb-3" />
                <div className="h-3 bg-surface rounded w-1/2 mb-2" />
                <div className="h-3 bg-surface rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : myComplaints.length === 0 ? (
          <p className="text-sm text-text-light py-6 text-center">{t("therapist_complaints.noComplaints")}</p>
        ) : (
          <div className="space-y-2">
            {myComplaints.map((c) => {
              const isExpanded = expandedId === c.id;
              return (
                <div key={c.id} className="border border-border rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface/30 transition"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusChip status={c.status} />
                      <StatusChip status={c.priority} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">
                        <span className="font-medium">{t("therapist_complaints.against")}</span>: {c.against}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted font-mono whitespace-nowrap shrink-0">
                      {new Date(c.filed).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-text-light shrink-0">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-2 border-t border-border/50 animate-in slide-in-from-top-1 fade-in duration-150">
                      <p className="text-xs text-text-light">{c.category}</p>
                      <p className="text-sm text-text-light">{c.description}</p>
                      {c.evidenceUrls && c.evidenceUrls.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {c.evidenceUrls.map((entry, i) => {
                            const [url, nameParam] = entry.split("?");
                            const params = new URLSearchParams(nameParam ?? "");
                            const storedName = params.get("name");
                            const name = storedName ?? url.split("/").pop() ?? entry;
                            const ext = name.split(".").pop()?.toLowerCase() ?? "";
                            const previewable = isPreviewableByName(name);
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => previewable && setPreviewAttachment({ url, name })}
                                disabled={!previewable}
                                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition
                                  ${previewable
                                    ? "border-border bg-surface/40 hover:bg-surface/70 cursor-pointer"
                                    : "border-border bg-surface/20 opacity-60 cursor-default"
                                  }`}
                              >
                                <FileText size={11} className="text-text-light" />
                                <span className="truncate max-w-[140px]">{name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {c.notes && c.notes.length > 0 && (
                        <div className="mt-2 border-t border-border pt-2">
                          <p className="text-[11px] font-medium text-text-light mb-1">{t("therapist_complaints.resolutionNote")}</p>
                          {c.notes.map((note, i) => (
                            <p key={i} className="text-[11px] text-text-light bg-surface rounded-lg px-3 py-2 mt-1">{note}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PreviewDialog
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        title={previewFile?.name ?? ""}
        src={previewFile ? URL.createObjectURL(previewFile) : ""}
        fileName={previewFile?.name}
        fileSize={previewFile?.size}
      />

      <PreviewDialog
        open={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        title={previewAttachment?.name ?? ""}
        src={previewAttachment?.url ?? ""}
        fileName={previewAttachment?.name}
      />
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
