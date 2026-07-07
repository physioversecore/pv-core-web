"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";

const PATIENTS = ["Sita Gurung", "Hari Bahadur Rai", "Nabin Khadka", "Puja Maharjan"];
const REPORT_TYPES = ["Session note", "Progress report", "X-ray / Image", "Exercise video"];

export function UploadReport() {
  const { t } = useLang();
  const [patient, setPatient] = useState("");
  const [kind, setKind] = useState(REPORT_TYPES[0]);
  const [note, setNote] = useState("");
  const [file, setFile] = useState("");

  const submit = () => {
    if (!patient) return toast.error(t("therapist_dashboard.errorPickPatient"));
    toast.success(t("therapist_dashboard.reportUploaded"));
    setNote("");
    setFile("");
    setPatient("");
  };

  return (
    <section className="card-soft p-6 mb-6">
      <div className="flex items-start justify-between mb-1 gap-3">
        <h3 className="font-display text-xl">{t("therapist_dashboard.uploadSessionReport")}</h3>
        <span className="chip">{t("therapist_dashboard.afterEveryVisit")}</span>
      </div>
      <p className="text-sm text-text-light mb-4">{t("therapist_dashboard.uploadDesc")}</p>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="eyebrow !text-[0.65rem]">{t("therapist_dashboard.patientLabel")}</label>
          <select
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
          >
            <option value="">{t("therapist_dashboard.selectPatient")}</option>
            {PATIENTS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="eyebrow !text-[0.65rem]">{t("therapist_dashboard.reportType")}</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
          >
            {REPORT_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      <label className="eyebrow !text-[0.65rem]">{t("therapist_dashboard.progressNote")}</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder={t("therapist_dashboard.notePlaceholder")}
        className="w-full mt-1 mb-4 px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
      />
      <button
        type="button"
        onClick={() => setFile("report.pdf")}
        className={`w-full p-6 rounded-xl border-2 border-dashed text-center text-sm transition ${
          file ? "border-secondary bg-surface/40 text-secondary" : "border-border text-text-light hover:border-secondary"
        }`}
      >
        <Paperclip size={20} className="mx-auto mb-1" />
        <div className="font-medium">
          {file ? `${t("therapist_dashboard.fileAttached")} ${file}` : t("therapist_dashboard.attachFile")}
        </div>
        <div className="text-xs mt-0.5 text-text-light">{t("therapist_dashboard.fileDesc")}</div>
      </button>
      <div className="text-center mt-4">
        <button onClick={submit} className="btn-secondary !px-6">{t("therapist_dashboard.uploadNotify")}</button>
      </div>
    </section>
  );
}
