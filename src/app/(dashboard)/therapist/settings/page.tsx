"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLang } from "@/context/i18n";
import { useAuth } from "@/context/auth";
import { DatePicker } from "@/components/ui/date-picker";
import {
  createBlockRequest,
  getBlockRequests,
  type BlockRequest,
} from "@/services/api/availability";
import {
  createRateChange,
  getRateChanges,
  type RateChangeRequest,
} from "@/services/api/availability";
import {
  changePassword,
  deleteAccount as apiDeleteAccount,
  logoutAllDevices,
} from "@/services/api/auth";
import { getTherapistProfile } from "@/services/api/profile";

const REASONS = ["Sickness", "Family emergency", "Personal", "Travel", "Other"];

export default function TSettings() {
  const { t } = useLang();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [off, setOff] = useState({ from: "", to: "", reason: REASONS[0], note: "" });
  const [offSubmitting, setOffSubmitting] = useState(false);

  const [currentRate, setCurrentRate] = useState(0);
  const [rate, setRate] = useState({ requested: "", reason: "" });
  const [rateSubmitting, setRateSubmitting] = useState(false);

  const [prefs, setPrefs] = useState({ smsAlerts: true, newBookings: true, marketing: false });

  const [dayOffRequests, setDayOffRequests] = useState<BlockRequest[]>([]);
  const [rateRequests, setRateRequests] = useState<RateChangeRequest[]>([]);

  // Account
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwVisible, setPwVisible] = useState({ current: false, next: false, confirm: false });
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [logoutSubmitting, setLogoutSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePw, setDeletePw] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    getTherapistProfile()
      .then((p) => setCurrentRate(p.price ?? 0))
      .catch(() => {});
    getBlockRequests().then(setDayOffRequests).catch(() => {});
    getRateChanges()
      .then((r) => setRateRequests(r.items))
      .catch(() => {});
  }, []);

  const submitOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!off.from || !off.to) return toast.error(t("therapist_dashboard.errorPickFromTo"));
    setOffSubmitting(true);
    try {
      await createBlockRequest({
        dateFrom: off.from,
        dateTo: off.to,
        daysOfWeek: [],
        partsOfDay: [],
        reason: off.reason,
        notify: true,
      });
      toast.success(t("therapist_dashboard.dayOffSubmitted"));
      setOff({ from: "", to: "", reason: REASONS[0], note: "" });
      const updated = await getBlockRequests();
      setDayOffRequests(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setOffSubmitting(false);
    }
  };

  const submitRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const requested = Number(rate.requested);
    if (!requested || requested <= currentRate)
      return toast.error(t("therapist_dashboard.errorRateHigher"));
    if (rate.reason.trim().length < 10)
      return toast.error(t("therapist_dashboard.errorJustification"));
    setRateSubmitting(true);
    try {
      await createRateChange({ rate_to: requested, reason: rate.reason.trim() });
      toast.success(t("therapist_dashboard.rateChangeSent"));
      setRate({ requested: "", reason: "" });
      const updated = await getRateChanges();
      setRateRequests(updated.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRateSubmitting(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw.current) return toast.error(t("therapist_dashboard.errorEnterCurrentPassword"));
    if (pw.next !== pw.confirm)
      return toast.error(t("therapist_dashboard.errorPasswordsMismatch"));
    setPwSubmitting(true);
    try {
      await changePassword(pw.current, pw.next);
      toast.success(t("therapist_dashboard.passwordChanged"));
      setPw({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPwSubmitting(false);
    }
  };

  const submitLogoutAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(logoutAllOtherDevicesMsg(
      t("therapist_dashboard.logOutAllDevices"),
      t("therapist_dashboard.logoutAllConfirm"),
    ))) return;
    setLogoutSubmitting(true);
    try {
      await logoutAllDevices();
      await logout();
      router.replace("/access");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLogoutSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletePw) return toast.error(t("therapist_dashboard.errorEnterCurrentPassword"));
    setDeleteSubmitting(true);
    try {
      await apiDeleteAccount(deletePw);
      setDeleteOpen(false);
      toast.success(t("therapist_dashboard.accountDeleted"));
      await logout();
      router.replace("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setDeleteSubmitting(false);
    }
  };

  const statusLabel = useCallback(
    (status: string) => {
      if (status === "APPROVED" || status === "Approved") return t("therapist_dashboard.statusApproved");
      if (status === "REJECTED" || status === "Rejected" || status === "Declined")
        return t("therapist_dashboard.statusRejected");
      return t("therapist_dashboard.statusPending");
    },
    [t],
  );

  const statusClass = useCallback((status: string) => {
    if (status === "APPROVED" || status === "Approved")
      return "!bg-secondary/10 !text-secondary";
    if (status === "REJECTED" || status === "Rejected" || status === "Declined")
      return "!bg-danger-bg !text-danger-ink";
    return "!bg-warn-bg !text-warn-ink";
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Emergency day off */}
        <form onSubmit={submitOff} className="card-soft p-5">
          <p className="eyebrow mb-1">{t("therapist_dashboard.emergencyDayOff")}</p>
          <h3 className="font-display text-lg mb-3">{t("therapist_dashboard.applyTimeOff")}</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.from")}</label>
              <DatePicker value={off.from} onChange={(v) => setOff({ ...off, from: v })} min={today} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.to")}</label>
              <DatePicker value={off.to} onChange={(v) => setOff({ ...off, to: v })} min={today} className="mt-1" />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.reason")}</label>
            <select value={off.reason} onChange={(e) => setOff({ ...off, reason: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-white text-sm">
              {REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.noteForAdmin")}</label>
          <textarea value={off.note} onChange={(e) => setOff({ ...off, note: e.target.value })} rows={3} className="w-full mt-1 mb-3 px-3 py-2 rounded-xl border border-border bg-white text-sm" />
          <button type="submit" disabled={offSubmitting} className="btn-secondary w-full cursor-pointer disabled:opacity-50">{offSubmitting ? t("common.submitting") : t("common.submit")}</button>
          <p className="text-xs text-text-light mt-2">{t("therapist_dashboard.affectedBookingsNote")}</p>
        </form>

        {/* Session rate change */}
        <form onSubmit={submitRate} className="card-soft p-5">
          <p className="eyebrow mb-1">{t("therapist_dashboard.sessionRateChange")}</p>
          <h3 className="font-display text-lg mb-3">{t("therapist_dashboard.requestNewRate")}</h3>
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.currentRate")}</label>
              <input type="number" value={currentRate || ""} disabled className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-surface/40 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.requestedRate")}</label>
              <input type="number" value={rate.requested} onChange={(e) => setRate({ ...rate, requested: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-white text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.increase")}</label>
              <div className="mt-1 px-3 py-2 rounded-xl border border-border bg-white text-sm font-medium text-secondary">
                {currentRate > 0 && rate.requested
                  ? `+Rs ${Math.max(0, Number(rate.requested) - currentRate)} (${Math.round(((Number(rate.requested) - currentRate) / currentRate) * 100)}%)`
                  : "—"}
              </div>
            </div>
          </div>
          <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.justification")}</label>
          <textarea value={rate.reason} onChange={(e) => setRate({ ...rate, reason: e.target.value })} rows={3} placeholder={t("therapist_dashboard.justificationPlaceholder")} className="w-full mt-1 mb-3 px-3 py-2 rounded-xl border border-border bg-white text-sm" />
          <button type="submit" disabled={rateSubmitting} className="btn-secondary px-6! cursor-pointer disabled:opacity-50">{rateSubmitting ? t("common.submitting") : t("therapist_dashboard.submitRateChange")}</button>
          <p className="text-xs text-text-light mt-2">{t("therapist_dashboard.rateChangeNote")}</p>
        </form>

        <div className="card-soft p-5">
          <p className="eyebrow mb-3">{t("therapist_dashboard.notificationPreferences")}</p>
          <Toggle label={t("therapist_dashboard.smsAlerts")} v={prefs.smsAlerts} on={(v) => setPrefs({ ...prefs, smsAlerts: v })} />
          <Toggle label={t("therapist_dashboard.dailyScheduleDigest")} v={prefs.newBookings} on={(v) => setPrefs({ ...prefs, newBookings: v })} />
          <Toggle label={t("therapist_dashboard.platformAnnouncements")} v={prefs.marketing} on={(v) => setPrefs({ ...prefs, marketing: v })} />
          <div className="flex justify-end mt-4">
             <button
               onClick={() => toast.success(t("common.savePreferences"))}
               className="btn-secondary py-1.5! px-4! text-xs cursor-pointer"
             >
               {t("common.savePreferences")}
             </button>
           </div>
        </div>

        {/* Change Password */}
        <form onSubmit={submitPassword} className="card-soft p-5">
          <p className="eyebrow mb-3">{t("therapist_dashboard.changePassword")}</p>

          <div className="grid lg:grid-cols-3 gap-3 mb-4">
            {(["current", "next", "confirm"] as const).map((field) => (
              <div key={field}>
                <label className="text-xs font-medium text-text-light">
                  {field === "current"
                    ? t("therapist_dashboard.currentPassword")
                    : field === "next"
                      ? t("therapist_dashboard.newPassword")
                      : t("therapist_dashboard.confirmPassword")}
                </label>
                <div className="relative mt-1">
                  <input
                    type={pwVisible[field] ? "text" : "password"}
                    value={pw[field]}
                    onChange={(e) => setPw({ ...pw, [field]: e.target.value })}
                    className="w-full px-3 py-2 pr-9 rounded-xl border border-border bg-white text-sm"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setPwVisible({ ...pwVisible, [field]: !pwVisible[field] })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-light hover:text-foreground transition-colors cursor-pointer"
                  >
                    {pwVisible[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="submit" disabled={pwSubmitting} className="btn-secondary cursor-pointer disabled:opacity-50">
            {pwSubmitting ? t("common.submitting") : t("common.saveChanges")}
          </button>
        </form>

        {/* Account */}
        <div className="card-soft p-5">
          <p className="eyebrow mb-3">{t("therapist_dashboard.account")}</p>

          <button
            type="button"
            onClick={submitLogoutAll}
            disabled={logoutSubmitting}
            className="btn-outline w-full !py-2 text-sm mb-2 cursor-pointer disabled:opacity-50"
          >
            {logoutSubmitting ? t("common.submitting") : t("therapist_dashboard.logOutAllDevices")}
          </button>

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="btn-outline w-full !py-2 text-sm !border-red-300 !text-danger-ink hover:!bg-danger-bg cursor-pointer"
          >
            {t("common.deleteAccount")}
          </button>
        </div>
      </div>

      {/* Request history */}
      <div className="grid lg:grid-cols-2 gap-5">
        <section className="card-soft p-5">
          <p className="eyebrow mb-2">{t("therapist_dashboard.requestHistory")} · {t("therapist_dashboard.emergencyDayOff")}</p>
          {dayOffRequests.length === 0 ? (
            <p className="text-sm text-text-light py-4">{t("therapist_dashboard.noDayOffRequests")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {dayOffRequests.map((r) => (
                <li key={r.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">{r.reason}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-text-light mt-0.5">
                      {r.dateFrom}
                      {r.dateTo && r.dateTo !== r.dateFrom ? ` – ${r.dateTo}` : ""}
                    </p>
                  </div>
                  <span className={`chip shrink-0 ${statusClass(r.status)}`}>{statusLabel(r.status)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card-soft p-5">
          <p className="eyebrow mb-2">{t("therapist_dashboard.requestHistory")} · {t("therapist_dashboard.sessionRateChange")}</p>
          {rateRequests.length === 0 ? (
            <p className="text-sm text-text-light py-4">{t("therapist_dashboard.noRateChangeRequests")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {rateRequests.map((r) => (
                <li key={r.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-text truncate">
                      Rs {r.rateFrom.toLocaleString()} → Rs {r.rateTo.toLocaleString()}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-text-light mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`chip shrink-0 ${statusClass(r.status)}`}>{statusLabel(r.status)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Dialog open={deleteOpen} onOpenChange={(open) => !open && setDeleteOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{t("therapist_dashboard.deleteAccountTitle")}</DialogTitle>
            <DialogDescription>{t("therapist_dashboard.deleteAccountDescription")}</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-danger-ink mb-2">{t("therapist_dashboard.deleteAccountCta")}</p>
            <input
              type="password"
              value={deletePw}
              onChange={(e) => setDeletePw(e.target.value)}
              placeholder={t("therapist_dashboard.currentPassword")}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm"
            />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setDeleteOpen(false)}
              className="btn-outline !py-2 !px-4 text-sm cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteSubmitting}
              className="px-4 py-2 rounded-full bg-danger text-white text-sm font-medium hover:brightness-95 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleteSubmitting ? t("common.submitting") : t("common.deleteAccount")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function logoutAllOtherDevicesMsg(title: string, body: string): string {
  return `${title}\n\n${body}`;
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <span className="text-sm">{label}</span>
      <button type="button" onClick={() => on(!v)} className={`w-10 h-6 rounded-full transition relative ${v ? "bg-secondary" : "bg-border"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${v ? "translate-x-4" : ""}`} />
      </button>
    </label>
  );
}