import { FileText, Image as ImageIcon, Video } from "lucide-react";
import { useLang } from "@/context/i18n";
import type { UploadKind } from "@/types";

interface UploadItem {
  id: string;
  patient: string;
  kind: UploadKind;
  title: string;
  file: string;
  date: string;
}

const RECENT: UploadItem[] = [
  { id: "u1", patient: "Sita Gurung", kind: "x-ray", title: "X-ray report", file: "knee-xray-02jun.pdf", date: "2 Jun" },
  { id: "u2", patient: "Sita Gurung", kind: "note", title: "Session note", file: "Range of motion improving", date: "5 Jun" },
  { id: "u3", patient: "Sita Gurung", kind: "video", title: "Exercise video", file: "quad-exercise-demo.mp4", date: "10 Jun" },
];

const iconMap: Record<UploadKind, React.ReactNode> = {
  "x-ray": <ImageIcon size={14} />,
  video: <Video size={14} />,
  note: <FileText size={14} />,
};

const tintMap: Record<UploadKind, string> = {
  "x-ray": "bg-surface text-secondary",
  video: "bg-primary-light text-primary",
  note: "bg-surface text-secondary",
};

export function RecentlyUploaded() {
  const { t } = useLang();
  return (
    <section className="card-soft p-5 mb-6">
      <div className="eyebrow mb-3">{t("therapist_dashboard.recentlyUploaded")}</div>
      <div className="divide-y divide-border">
        {RECENT.map((u) => (
          <div key={u.id} className="flex items-center gap-3 py-3">
            <span className={`w-8 h-8 rounded-lg grid place-items-center font-mono text-[10px] uppercase ${tintMap[u.kind]}`}>
              {iconMap[u.kind]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{u.patient}</div>
              <div className="text-xs text-text-light truncate">
                {u.title} · <span className="font-mono">{u.file}</span>
              </div>
            </div>
            <div className="text-xs text-text-light font-mono">{u.date}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
