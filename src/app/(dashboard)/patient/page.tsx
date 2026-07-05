"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

interface UpRow { id: string; therapist: string; when: string; type: string; status: "Confirmed" | "Pending"; }
const UPCOMING: UpRow[] = [
  { id: "u1", therapist: "Rajesh Shrestha", when: "Today · 4:00 PM", type: "Home visit", status: "Confirmed" },
  { id: "u2", therapist: "Rajesh Shrestha", when: "Fri 27 Jun · 4:00 PM", type: "Home visit", status: "Confirmed" },
  { id: "u3", therapist: "Anita Tamang", when: "Mon 30 Jun · 10:00 AM", type: "Home visit", status: "Pending" },
];

const RATE_LIST = [
  { id: "r1", name: "Rajesh Shrestha", session: "Session on Jun 10" },
  { id: "r2", name: "Anita Tamang", session: "Session on Jun 3" },
];

export default function Overview() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("sahayatri.user");
      if (!raw) router.push("/");
    }
  }, [router]);

  if (!user) return null;

  return (
    <div>
      <p className="eyebrow mb-2">Welcome back</p>
      <h2 className="text-3xl font-display mb-6">Let&apos;s continue your recovery.</h2>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <TopCard label="Total sessions" value="12" sub="5 remaining in current package" />
        <TopCard label="Next session" value="Today, 4:00 PM" sub="Rajesh Shrestha · Home visit" />
        <TopCard label="Recovery progress" value="62%" sub="Knee rehab · 5 of 8 sessions done" />
      </div>

      <div className="card-soft p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg">Upcoming sessions</h3>
          <span className="chip">{UPCOMING.length} booked</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase font-mono text-text-light text-left border-b border-border">
                <th className="py-2 pr-3">Therapist</th>
                <th className="py-2 pr-3">Date & time</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {UPCOMING.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 pr-3 font-medium text-secondary">{u.therapist}</td>
                  <td className="py-3 pr-3 text-text-light">{u.when}</td>
                  <td className="py-3 pr-3 text-text-light">{u.type}</td>
                  <td className="py-3 pr-3">
                    <span className={`chip ${u.status === "Confirmed" ? "!bg-secondary/10 !text-secondary" : "!bg-primary/15 !text-primary"}`}>{u.status}</span>
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => toast(u.status === "Pending" ? "Booking cancelled" : "Reschedule request sent")} className="btn-outline !py-1 !px-3 text-xs">
                      {u.status === "Pending" ? "Cancel" : "Reschedule"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RateTherapist />

      <ReferFriend />

      <p className="text-xs text-text-light mt-4">
        Need to book a new session? <Link href="/patient/sessions" className="text-secondary underline">Go to My Sessions</Link>.
      </p>
    </div>
  );
}

function ReferFriend() {
  const code = "SAHA-PT-2841";
  const link = `https://sahayatri.np/r/${code}`;
  const copy = () => { navigator.clipboard?.writeText(link); toast.success("Referral link copied"); };
  const share = () => {
    const text = `Try Sahayatri Physio — home-visit physiotherapy in Nepal. Use my code ${code} for Rs 200 off your first session: ${link}`;
    if (navigator.share) navigator.share({ title: "Sahayatri Physio", text }).catch(() => {});
    else { navigator.clipboard?.writeText(text); toast.success("Invite copied to clipboard"); }
  };
  return (
    <section className="mt-6 card-soft p-5 bg-surface/40 border-secondary/20">
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-4 items-center">
        <div>
          <p className="eyebrow mb-1">Refer a friend</p>
          <h3 className="font-display text-xl">Give Rs 200, get Rs 200</h3>
          <p className="text-sm text-text-light mt-1">Share your code. When your friend books their first session, you both earn Rs 200 credit.</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-secondary font-medium px-3 py-2 rounded-xl bg-white border border-border flex-1 text-sm truncate">{code}</span>
            <button onClick={copy} className="btn-outline !py-2 !px-3 text-xs">Copy link</button>
          </div>
          <button onClick={share} className="btn-pine w-full !py-2 text-sm">Share invite</button>
        </div>
      </div>
    </section>
  );
}

function TopCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card-soft p-5">
      <div className="eyebrow !text-[0.65rem] mb-2">{label}</div>
      <div className="font-display text-2xl text-text leading-tight">{value}</div>
      <div className="text-xs text-text-light mt-1.5">{sub}</div>
    </div>
  );
}

function RateTherapist() {
  return (
    <div>
      <h3 className="font-display text-xl mb-1">Rate your therapist</h3>
      <p className="text-sm text-text-light mb-4">Your rating appears directly on the therapist&apos;s public profile. Only patients with completed sessions can rate.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {RATE_LIST.map((r) => <RateCard key={r.id} name={r.name} session={r.session} />)}
      </div>
    </div>
  );
}

function RateCard({ name, session }: { name: string; session: string }) {
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!stars) return toast.error("Pick a star rating first");
    setDone(true);
    toast.success(`Thanks for rating ${name}`);
  };

  return (
    <div className="card-soft p-4">
      <div className="flex items-center gap-3 mb-2">
        <Avatar name={name} size={40} />
        <div>
          <div className="font-medium text-sm">{name}</div>
          <div className="text-xs text-text-light">{session}</div>
        </div>
      </div>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => !done && setStars(n)} aria-label={`${n} star`}>
            <Star size={20} className={n <= stars ? "fill-primary text-primary" : "text-border"} />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={done}
        rows={2}
        placeholder="What went well? What could improve?"
        className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm mb-3 disabled:opacity-60"
      />
      <button onClick={submit} disabled={done} className="btn-pine !py-1.5 !px-4 text-xs disabled:opacity-60">
        {done ? "Submitted" : "Submit rating"}
      </button>
    </div>
  );
}
