"use client";

import { useLang } from "@/context/i18n";

const WEEKS = [
  { w: "W1", pain: 8, sessions: 1 },
  { w: "W2", pain: 7, sessions: 2 },
  { w: "W3", pain: 5, sessions: 2 },
  { w: "W4", pain: 4, sessions: 3 },
  { w: "W5", pain: 3, sessions: 2 },
  { w: "W6", pain: 2, sessions: 2 },
];

export default function Progress() {
  const { t } = useLang();
  const max = 10;
  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="card-soft p-5">
          <p className="eyebrow mb-2">{t("patient_dashboard.overallRecovery")}</p>
          <div className="text-3xl font-display mb-2">72%</div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full" style={{ width: "72%" }} />
          </div>
          <p className="text-xs text-text-light mt-3">{t("patient_dashboard.milestones")}</p>
        </div>
        <div className="card-soft p-5">
          <p className="eyebrow mb-3">{t("patient_dashboard.milestones")}</p>
          <ul className="space-y-2 text-sm">
            <Mile done text={t("patient_dashboard.milestonePainBelow")} />
            <Mile done text={t("patient_dashboard.milestoneWalk500m")} />
            <Mile done text={t("patient_dashboard.milestoneFullROM")} />
            <Mile text={t("patient_dashboard.milestoneClimbStairs")} />
            <Mile text={t("patient_dashboard.milestoneReturnSports")} />
          </ul>
        </div>
      </div>

      <div className="card-soft p-5">
        <p className="eyebrow mb-3">{t("patient_dashboard.painLevelOverTime")}</p>
        <div className="flex items-end gap-3 h-44">
          {WEEKS.map((w) => (
            <div key={w.w} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-surface rounded-t-lg relative flex items-end" style={{ height: "100%" }}>
                <div className="w-full bg-secondary rounded-t-lg transition-all" style={{ height: `${(w.pain / max) * 100}%` }} />
              </div>
              <div className="text-xs font-mono text-text-light">{w.w}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-text-light mt-3">
          <span>{t("patient_dashboard.sessionsCompleted")} {WEEKS.reduce((s, w) => s + w.sessions, 0)}</span>
          <span>{t("patient_dashboard.currentPain")} 2 / 10</span>
        </div>
      </div>
    </div>
  );
}

function Mile({ text, done }: { text: string; done?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`w-5 h-5 rounded-full grid place-items-center text-xs ${done ? "bg-secondary text-white" : "bg-surface text-text-light"}`}>{done ? "✓" : "○"}</span>
      <span className={done ? "text-text" : "text-text-light"}>{text}</span>
    </li>
  );
}
