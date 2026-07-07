"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/context/i18n";

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
  const { t } = useLang();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div>
      <p className="eyebrow mb-2">{t("patient_dashboard.welcomeBack")}</p>
      <h2 className="text-3xl font-display mb-6">{t("patient_dashboard.continueRecovery")}</h2>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <TopCard label={t("patient_dashboard.totalSessions")} value="12" sub={t("patient_dashboard.remainingPackage")} />
        <TopCard label={t("patient_dashboard.nextSession")} value="Today, 4:00 PM" sub="Rajesh Shrestha · Home visit" />
        <TopCard label={t("patient_dashboard.recoveryProgress")} value="62%" sub={`Knee rehab · 5 of 8 ${t("patient_dashboard.sessionsDone")}`} />
      </div>

      <div className="card-soft p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg">{t("patient_dashboard.upcomingSessions")}</h3>
          <span className="chip">{UPCOMING.length} {t("patient_dashboard.booked")}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase font-mono text-text-light text-left border-b border-border">
                <th className="py-2 pr-3">{t("patient_dashboard.therapist")}</th>
                <th className="py-2 pr-3">{t("patient_dashboard.dateTime")}</th>
                <th className="py-2 pr-3">{t("patient_dashboard.type")}</th>
                <th className="py-2 pr-3">{t("patient_dashboard.status")}</th>
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
                    <span className={`chip ${u.status === "Confirmed" ? "!bg-secondary/10 !text-secondary" : "!bg-primary/15 !text-primary"}`}>{u.status === "Confirmed" ? t("patient_dashboard.confirmed") : t("patient_dashboard.pending")}</span>
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => toast(u.status === "Pending" ? t("patient_dashboard.cancel") : t("patient_dashboard.rescheduleSent"))} className="btn-outline !py-1 !px-3 text-xs">
                      {u.status === "Pending" ? t("patient_dashboard.cancel") : t("patient_dashboard.reschedule")}
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
        {t("patient_dashboard.needBookSession")} <Link href="/patient/sessions" className="text-secondary underline">{t("patient_dashboard.goToMySessions")}</Link>.
      </p>
    </div>
  );
}

function ReferFriend() {
  const { t } = useLang();
  const code = "SAHA-PT-2841";
  const link = `https://sahayatri.np/r/${code}`;
  const copy = () => { navigator.clipboard?.writeText(link); toast.success(t("patient_dashboard.referralCopied")); };
  const share = () => {
    const text = `Try Sahayatri Physio — home-visit physiotherapy in Nepal. Use my code ${code} for Rs 200 off your first session: ${link}`;
    if (navigator.share) navigator.share({ title: "Sahayatri Physio", text }).catch(() => {});
    else { navigator.clipboard?.writeText(text); toast.success(t("patient_dashboard.referralCopied")); }
  };
  return (
    <section className="mt-6 card-soft p-5 bg-surface/40 border-secondary/20">
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-4 items-center">
        <div>
          <p className="eyebrow mb-1">{t("patient_dashboard.referFriend")}</p>
          <h3 className="font-display text-xl">{t("patient_dashboard.referTitle")}</h3>
          <p className="text-sm text-text-light mt-1">{t("patient_dashboard.referDesc")}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-secondary font-medium px-3 py-2 rounded-xl bg-white border border-border flex-1 text-sm truncate">{code}</span>
            <button onClick={copy} className="btn-outline !py-2 !px-3 text-xs">{t("common.copyLink")}</button>
          </div>
          <button onClick={share} className="btn-pine w-full !py-2 text-sm">{t("common.shareInvite")}</button>
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
  const { t } = useLang();
  return (
    <div>
      <h3 className="font-display text-xl mb-1">{t("patient_dashboard.rateYourTherapist")}</h3>
      <p className="text-sm text-text-light mb-4">{t("patient_dashboard.rateDesc")}</p>
      <div className="grid md:grid-cols-2 gap-4">
        {RATE_LIST.map((r) => <RateCard key={r.id} name={r.name} session={r.session} />)}
      </div>
    </div>
  );
}

function RateCard({ name, session }: { name: string; session: string }) {
  const { t } = useLang();
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!stars) return toast.error(t("patient_dashboard.pickStarRating"));
    setDone(true);
    toast.success(`${t("patient_dashboard.thanksForRating")} ${name}`);
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
        placeholder={t("patient_dashboard.whatWentWell")}
        className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm mb-3 disabled:opacity-60"
      />
      <button onClick={submit} disabled={done} className="btn-pine !py-1.5 !px-4 text-xs disabled:opacity-60">
        {done ? t("common.submitted") : t("common.submitRating")}
      </button>
    </div>
  );
}
