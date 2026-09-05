"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, TriangleAlert } from "lucide-react";
import { useLang } from "@/context/i18n";
import { useAuth } from "@/context/auth";
import { changePassword, deleteAccount } from "@/services/api/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Settings() {
  const { t } = useLang();
  const { logout } = useAuth();
  const router = useRouter();
  const [prefs, setPrefs] = useState({ emailNotif: true, smsNotif: true, marketing: false });

  // Change password state
  const [pass, setPass] = useState({ current: "", next: "", confirm: "" });
  const [changing, setChanging] = useState(false);

  // Delete account state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.next !== pass.confirm) {
      toast.error(t("patient_dashboard.settingsPasswordMismatch"));
      return;
    }
    if (pass.next.length < 8) {
      toast.error(t("auth.passwordRuleLength"));
      return;
    }
    setChanging(true);
    try {
      await changePassword(pass.current, pass.next);
      toast.success(t("patient_dashboard.settingsPasswordUpdated"));
      setPass({ current: "", next: "", confirm: "" });
    } catch {
      toast.error(t("patient_dashboard.settingsPasswordError"));
    } finally {
      setChanging(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm !== t("patient_dashboard.settingsDeleteConfirmText")) return;
    setDeleting(true);
    try {
      await deleteAccount();
      setDeleteOpen(false);
      toast.success(t("patient_dashboard.settingsAccountDeleted"));
      await logout();
      router.push("/access");
    } catch {
      toast.error(t("patient_dashboard.settingsDeleteError"));
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
        <div className="space-y-5">
          <div className="card-soft p-5">
            <p className="eyebrow mb-3">{t("patient_dashboard.settingsNotificationPrefs")}</p>
            <Toggle label={t("patient_dashboard.settingsEmailNotif")} v={prefs.emailNotif} on={(v) => setPrefs({ ...prefs, emailNotif: v })} />
            <Toggle label={t("patient_dashboard.settingsSmsReminders")} v={prefs.smsNotif} on={(v) => setPrefs({ ...prefs, smsNotif: v })} />
            <Toggle label={t("patient_dashboard.settingsMarketing")} v={prefs.marketing} on={(v) => setPrefs({ ...prefs, marketing: v })} />
            <button onClick={() => toast.success(t("common.savePreferences"))} className="btn-outline !py-1.5 !px-4 text-xs mt-2">{t("common.savePreferences")}</button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card-soft p-5">
            <p className="eyebrow mb-3">{t("patient_dashboard.settingsChangePassword")}</p>
            <form onSubmit={submitPassword} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-light">{t("patient_dashboard.settingsCurrentPassword")}</label>
                <input
                  type="password"
                  value={pass.current}
                  onChange={(e) => setPass({ ...pass, current: e.target.value })}
                  placeholder={t("patient_dashboard.settingsCurrentPasswordPlaceholder")}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-light">{t("patient_dashboard.settingsNewPassword")}</label>
                <input
                  type="password"
                  value={pass.next}
                  onChange={(e) => setPass({ ...pass, next: e.target.value })}
                  placeholder={t("patient_dashboard.settingsNewPasswordPlaceholder")}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-light">{t("patient_dashboard.settingsConfirmPassword")}</label>
                <input
                  type="password"
                  value={pass.confirm}
                  onChange={(e) => setPass({ ...pass, confirm: e.target.value })}
                  placeholder={t("patient_dashboard.settingsConfirmPasswordPlaceholder")}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-white text-sm"
                />
              </div>
              <button type="submit" disabled={changing} className="btn-secondary w-full !py-2 text-sm">
                {changing ? <Loader2 className="inline animate-spin mr-1" size={14} /> : null}
                {t("common.save") ?? "Update password"}
              </button>
            </form>
          </div>

          <div className="card-soft p-5 border-red-200">
            <p className="eyebrow mb-2 text-red-600">{t("patient_dashboard.settingsAccount")}</p>
            <p className="text-xs text-text-light mb-3">{t("patient_dashboard.settingsDeleteDesc")}</p>
            <button onClick={() => setDeleteOpen(true)} className="btn-primary w-full !py-2 text-sm bg-red-500 hover:bg-red-600 border-red-500">
              {t("patient_dashboard.settingsDeleteAccount")}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={(o) => { if (!deleting) setDeleteOpen(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <TriangleAlert size={18} />
              {t("patient_dashboard.settingsDeleteTitle")}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {t("patient_dashboard.settingsDeleteDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-red-600 font-medium">{t("patient_dashboard.settingsDeleteWarning")}</p>
            <label className="block text-xs font-medium text-text-light">{t("patient_dashboard.settingsDeletePlaceholder")}</label>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={t("patient_dashboard.settingsDeleteConfirmText")}
              className="w-full px-3 py-2 rounded-xl border border-red-300 bg-white text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { if (!deleting) { setDeleteOpen(false); setDeleteConfirm(""); toast.info(t("patient_dashboard.settingsDeleteCancelled")); } }} className="btn-outline !py-2 !px-4 text-sm">
              {t("common.cancel") ?? "Cancel"}
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting || deleteConfirm !== t("patient_dashboard.settingsDeleteConfirmText")}
              className="btn-primary !py-2 !px-4 text-sm bg-red-500 hover:bg-red-600 border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? <Loader2 className="inline animate-spin mr-1" size={14} /> : null}
              {t("patient_dashboard.settingsDeleteConfirmBtn")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
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
