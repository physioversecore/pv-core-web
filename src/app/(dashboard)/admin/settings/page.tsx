"use client";

import { useState } from "react";
import { CITIES, SPECIALTIES } from "@/lib/constants";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useLang } from "@/context/i18n";

export default function AdminSettings() {
  const { t } = useLang();
  const [fee, setFee] = useState(15);
  const [cities, setCities] = useState<string[]>([...CITIES]);
  const [specs, setSpecs] = useState<string[]>([...SPECIALTIES]);
  const [newCity, setNewCity] = useState("");
  const [newSpec, setNewSpec] = useState("");
  const [maintenance, setMaintenance] = useState(false);
  const [welcome, setWelcome] = useState("Welcome to Sahayatri Physio! Your account is ready.");

  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card-soft p-5">
          <p className="eyebrow mb-2">{t("admin_dashboard.platformFee")}</p>
          <div className="flex items-center gap-2">
            <input type="number" value={fee} onChange={(e) => setFee(+e.target.value)} className="w-24 px-3 py-2 rounded-xl border border-border bg-white" />
            <span className="text-text-light">%</span>
            <button onClick={() => toast.success(t("admin_dashboard.feeUpdated"))} className="btn-secondary !py-1.5 !px-3 text-xs ml-auto">{t("common.save")}</button>
          </div>
        </div>

        <div className="card-soft p-5">
          <p className="eyebrow mb-2">{t("admin_dashboard.maintenanceMode")}</p>
          <label className="flex items-center justify-between">
            <span className="text-sm">{maintenance ? t("admin_dashboard.siteIsMaintenance") : t("admin_dashboard.siteIsLive")}</span>
            <button onClick={() => { setMaintenance((m) => !m); toast(maintenance ? t("admin_dashboard.siteLive") : t("admin_dashboard.maintenanceEnabled")); }} className={`w-12 h-6 rounded-full p-0.5 transition ${maintenance ? "bg-primary" : "bg-surface"}`}>
              <span className={`block w-5 h-5 rounded-full bg-white shadow transition ${maintenance ? "translate-x-6" : ""}`} />
            </button>
          </label>
        </div>

        <Listed title={t("admin_dashboard.supportedCities")} items={cities} setItems={setCities} input={newCity} setInput={setNewCity} />
        <Listed title={t("admin_dashboard.supportedSpecialties")} items={specs} setItems={setSpecs} input={newSpec} setInput={setNewSpec} />

        <div className="card-soft p-5 lg:col-span-2">
          <p className="eyebrow mb-2">{t("admin_dashboard.welcomeEmailTemplate")}</p>
          <textarea value={welcome} onChange={(e) => setWelcome(e.target.value)} rows={4} className="w-full px-3 py-2.5 rounded-xl border border-border bg-white" />
          <button onClick={() => toast.success(t("admin_dashboard.templateSaved"))} className="btn-secondary mt-3 !py-1.5 !px-3 text-xs">{t("common.saveTemplate")}</button>
        </div>
      </div>
    </div>
  );
}

function Listed({ title, items, setItems, input, setInput }: { title: string; items: string[]; setItems: (v: string[]) => void; input: string; setInput: (v: string) => void }) {
  const { t } = useLang();
  const add = () => { if (input.trim()) { setItems([...items, input.trim()]); setInput(""); toast.success(t("admin_dashboard.added")); } };
  return (
    <div className="card-soft p-5">
      <p className="eyebrow mb-3">{title}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((c) => (
          <span key={c} className="chip flex items-center gap-1">
            {c}
            <button onClick={() => setItems(items.filter((x) => x !== c))} className="hover:text-destructive"><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("admin_dashboard.addNew")} className="flex-1 px-3 py-2 rounded-xl border border-border bg-white text-sm" />
        <button onClick={add} className="btn-secondary !py-1.5 !px-3 text-xs">{t("admin_dashboard.add")}</button>
      </div>
    </div>
  );
}
