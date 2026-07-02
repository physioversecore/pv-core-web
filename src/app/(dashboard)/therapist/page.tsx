"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { FileText, Image as ImageIcon, Video, Paperclip, Star } from "lucide-react";
import { toast } from "sonner";

const PATIENTS = ["Sita Gurung", "Hari Bahadur Rai", "Nabin Khadka", "Puja Maharjan"];
const REPORT_TYPES = ["Session note", "Progress report", "X-ray / Image", "Exercise video"];

interface Upload { id: string; patient: string; kind: "x-ray" | "note" | "video"; title: string; file: string; date: string; }
const RECENT: Upload[] = [
  { id: "u1", patient: "Sita Gurung", kind: "x-ray", title: "X-ray report", file: "knee-xray-02jun.pdf", date: "2 Jun" },
  { id: "u2", patient: "Sita Gurung", kind: "note", title: "Session note", file: "Range of motion improving", date: "5 Jun" },
  { id: "u3", patient: "Sita Gurung", kind: "video", title: "Exercise video", file: "quad-exercise-demo.mp4", date: "10 Jun" },
];

const RATINGS = [
  { id: "g1", name: "Sita Gurung", stars: 5, text: "Very professional and patient. Exercises helped a lot." },
  { id: "g2", name: "Hari Bahadur Rai", stars: 5, text: "Always on time and explains everything clearly. Recommended!" },
];

export default function TherapistOverview() {
  return (
    <>
      <p className="eyebrow mb-2">Today</p>
      <h2 className="text-3xl font-display mb-6">Good morning. Here's your day.</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Sessions this week" value="12" />
        <Stat label="Total patients" value="38" />
        <Stat label="Earnings this month" value="Rs 42,500" />
        <Stat label="Average rating" value="4.9 ★" />
      </div>

      <TodaySessions />
      <UploadReport />
      <RecentlyUploaded items={RECENT} />
      <PublicProfile />
      <ReferColleague />
    </>
  );
}

const TODAY: { time: string; patient: string; area: string; type: string; status: "Confirmed" | "Pending" }[] = [
  { time: "10:00 AM", patient: "Sita Gurung", area: "Baluwatar", type: "Home visit", status: "Confirmed" },
  { time: "1:30 PM", patient: "Hari Bahadur Rai", area: "Patan", type: "Home visit", status: "Confirmed" },
  { time: "4:00 PM", patient: "Nabin Khadka", area: "Maharajgunj", type: "Home visit", status: "Pending" },
];

function TodaySessions() {
  return (
    <section className="card-soft p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="eyebrow mb-1">Today</p>
          <h3 className="font-display text-lg">Upcoming sessions today</h3>
        </div>
        <span className="chip">{TODAY.length} visits</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase font-mono text-slate text-left border-b border-border">
              <th className="py-2 pr-3">Time</th>
              <th className="py-2 pr-3">Patient</th>
              <th className="py-2 pr-3">Area</th>
              <th className="py-2 pr-3">Type</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TODAY.map((t) => (
              <tr key={t.time}>
                <td className="py-3 pr-3 font-mono text-pine">{t.time}</td>
                <td className="py-3 pr-3 font-medium">{t.patient}</td>
                <td className="py-3 pr-3 text-slate">{t.area}</td>
                <td className="py-3 pr-3 text-slate">{t.type}</td>
                <td className="py-3 pr-3">
                  <span className={`chip ${t.status === "Confirmed" ? "!bg-pine/10 !text-pine" : "!bg-amber/15 !text-amber"}`}>{t.status}</span>
                </td>
                <td className="py-3 text-right">
                  <button onClick={() => toast.success(`Started session with ${t.patient}`)} className="btn-outline !py-1 !px-3 text-xs">Start</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReferColleague() {
  const code = "SAHA-DR-1029";
  const link = `https://sahayatri.np/join/${code}`;
  const copy = () => { navigator.clipboard?.writeText(link); toast.success("Referral link copied"); };
  const share = () => {
    const text = `Join me on Sahayatri Physio — Nepal's home-visit physiotherapy platform. Use code ${code} when you sign up: ${link}`;
    if (navigator.share) navigator.share({ title: "Sahayatri Physio for therapists", text }).catch(() => {});
    else { navigator.clipboard?.writeText(text); toast.success("Invite copied to clipboard"); }
  };
  return (
    <section className="mt-6 card-soft p-5 bg-sage/40 border-pine/20">
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-4 items-center">
        <div>
          <p className="eyebrow mb-1">Refer a colleague</p>
          <h3 className="font-display text-xl">Earn Rs 1,000 per verified physiotherapist</h3>
          <p className="text-sm text-slate mt-1">When a colleague signs up with your code and completes 5 sessions, you both earn Rs 1,000.</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-pine font-medium px-3 py-2 rounded-xl bg-white border border-border flex-1 text-sm truncate">{code}</span>
            <button onClick={copy} className="btn-outline !py-2 !px-3 text-xs">Copy</button>
          </div>
          <button onClick={share} className="btn-pine w-full !py-2 text-sm">Share invite</button>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-soft p-4">
      <div className="text-xs text-slate uppercase tracking-wider font-mono">{label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
    </div>
  );
}

function UploadReport() {
  const [patient, setPatient] = useState("");
  const [kind, setKind] = useState(REPORT_TYPES[0]);
  const [note, setNote] = useState("");
  const [file, setFile] = useState("");

  const submit = () => {
    if (!patient) return toast.error("Pick a patient");
    toast.success("Report uploaded & patient notified");
    setNote(""); setFile(""); setPatient("");
  };

  return (
    <section className="card-soft p-6 mb-6">
      <div className="flex items-start justify-between mb-1 gap-3">
        <h3 className="font-display text-xl">Upload session report</h3>
        <span className="chip">After every visit</span>
      </div>
      <p className="text-sm text-slate mb-4">Once uploaded, the patient and their family members are notified and can view the report immediately.</p>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="eyebrow !text-[0.65rem]">Patient</label>
          <select value={patient} onChange={(e) => setPatient(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm">
            <option value="">Select patient…</option>
            {PATIENTS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="eyebrow !text-[0.65rem]">Report type</label>
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm">
            {REPORT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <label className="eyebrow !text-[0.65rem]">Progress note</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Describe the patient's progress, exercises given, and any concerns…" className="w-full mt-1 mb-4 px-3 py-2.5 rounded-xl border border-border bg-white text-sm" />
      <button type="button" onClick={() => setFile("report.pdf")} className={`w-full p-6 rounded-xl border-2 border-dashed text-center text-sm transition ${file ? "border-pine bg-sage/40 text-pine" : "border-border text-slate hover:border-pine"}`}>
        <Paperclip size={20} className="mx-auto mb-1" />
        <div className="font-medium">{file ? `Attached: ${file}` : "Attach file"}</div>
        <div className="text-xs mt-0.5 text-slate">PDF report, X-ray image, video, or document</div>
      </button>
      <div className="text-center mt-4">
        <button onClick={submit} className="btn-pine !px-6">Upload & notify patient</button>
      </div>
    </section>
  );
}

function RecentlyUploaded({ items }: { items: Upload[] }) {
  const iconFor = (k: Upload["kind"]) => k === "x-ray" ? <ImageIcon size={14} /> : k === "video" ? <Video size={14} /> : <FileText size={14} />;
  const tintFor = (k: Upload["kind"]) => k === "x-ray" ? "bg-sage text-pine" : k === "video" ? "bg-amber/20 text-amber" : "bg-pine/10 text-pine";
  return (
    <section className="card-soft p-5 mb-6">
      <div className="eyebrow mb-3">Recently uploaded</div>
      <div className="divide-y divide-border">
        {items.map((u) => (
          <div key={u.id} className="flex items-center gap-3 py-3">
            <span className={`w-8 h-8 rounded-lg grid place-items-center font-mono text-[10px] uppercase ${tintFor(u.kind)}`}>{iconFor(u.kind)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{u.patient}</div>
              <div className="text-xs text-slate truncate">{u.title} · <span className="font-mono">{u.file}</span></div>
            </div>
            <div className="text-xs text-slate font-mono">{u.date}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PublicProfile() {
  return (
    <section className="grid lg:grid-cols-2 gap-5">
      <div className="card-soft p-5">
        <h3 className="font-display text-lg mb-3">My public profile</h3>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-sage/40">
          <Avatar name="Rajesh Shrestha" size={44} />
          <div className="flex-1 min-w-0">
            <div className="font-medium">Rajesh Shrestha</div>
            <div className="text-xs text-slate">Sports injury & post-surgery · 6 yrs experience</div>
            <div className="flex items-center gap-1 mt-1 text-amber text-sm">
              {"★★★★★"} <span className="font-mono text-xs text-pine ml-1">4.9</span>
              <span className="text-xs text-slate ml-1">(38 patient reviews)</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate mt-3 leading-relaxed">
          Your star rating is calculated live from patient feedback submitted after sessions.
          Maintaining above 4.5 ensures continued visibility on the platform.
        </p>
        <Link href="/therapist/profile" className="inline-block mt-3 text-xs text-pine hover:underline">Edit profile →</Link>
      </div>

      <div className="card-soft p-5">
        <h3 className="font-display text-lg mb-3">Recent patient ratings</h3>
        <div className="space-y-3">
          {RATINGS.map((r) => (
            <div key={r.id} className="p-3 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{r.name}</span>
                <span className="text-amber text-sm flex items-center gap-0.5">
                  {Array.from({ length: r.stars }).map((_, i) => <Star key={i} size={12} className="fill-amber text-amber" />)}
                </span>
              </div>
              <p className="text-xs text-slate italic">"{r.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
