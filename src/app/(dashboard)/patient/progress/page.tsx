"use client";

const WEEKS = [
  { w: "W1", pain: 8, sessions: 1 },
  { w: "W2", pain: 7, sessions: 2 },
  { w: "W3", pain: 5, sessions: 2 },
  { w: "W4", pain: 4, sessions: 3 },
  { w: "W5", pain: 3, sessions: 2 },
  { w: "W6", pain: 2, sessions: 2 },
];

export default function Progress() {
  const max = 10;
  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="card-soft p-5">
          <p className="eyebrow mb-2">Overall recovery</p>
          <div className="text-3xl font-display mb-2">72%</div>
          <div className="h-2 bg-sage rounded-full overflow-hidden">
            <div className="h-full bg-pine rounded-full" style={{ width: "72%" }} />
          </div>
          <p className="text-xs text-slate mt-3">Based on therapist-set milestones for ACL post-op rehab.</p>
        </div>
        <div className="card-soft p-5">
          <p className="eyebrow mb-3">Milestones</p>
          <ul className="space-y-2 text-sm">
            <Mile done text="Pain below 5/10" />
            <Mile done text="Walk 500m without aid" />
            <Mile done text="Full passive ROM" />
            <Mile text="Climb stairs unassisted" />
            <Mile text="Return to light sports" />
          </ul>
        </div>
      </div>

      <div className="card-soft p-5">
        <p className="eyebrow mb-3">Pain level over time</p>
        <div className="flex items-end gap-3 h-44">
          {WEEKS.map((w) => (
            <div key={w.w} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-sage rounded-t-lg relative flex items-end" style={{ height: "100%" }}>
                <div className="w-full bg-pine rounded-t-lg transition-all" style={{ height: `${(w.pain / max) * 100}%` }} />
              </div>
              <div className="text-xs font-mono text-slate">{w.w}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate mt-3">
          <span>Sessions completed: {WEEKS.reduce((s, w) => s + w.sessions, 0)}</span>
          <span>Current pain: 2 / 10</span>
        </div>
      </div>
    </div>
  );
}

function Mile({ text, done }: { text: string; done?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`w-5 h-5 rounded-full grid place-items-center text-xs ${done ? "bg-pine text-white" : "bg-sage text-slate"}`}>{done ? "✓" : "○"}</span>
      <span className={done ? "text-forest" : "text-slate"}>{text}</span>
    </li>
  );
}
