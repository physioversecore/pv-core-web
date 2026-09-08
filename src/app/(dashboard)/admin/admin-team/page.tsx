"use client";

import { useState, useMemo, useCallback } from "react";
import { UserPlus, ShieldCheck, Edit2, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useLang, type TKey } from "@/context/i18n";
import { useAdminTeam } from "@/hooks/useAdminTeam";
import { StatusChip } from "@/components/tables";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { Avatar } from "@/components/Avatar";
import type { AdminUserData, AdminRoleName } from "@/services/api/admin";

const ROLE_ORDER: AdminRoleName[] = ["Super Admin", "Support Admin", "Finance Admin"];

function getPermissionMatrix(t: (k: TKey) => string) {
  return [
    { permission: t("adminTeam.permissionViewPatientsTherapists"), roles: ["Super Admin", "Support Admin"] as AdminRoleName[] },
    { permission: t("adminTeam.permissionManageComplaints"), roles: ["Super Admin", "Support Admin"] as AdminRoleName[] },
    { permission: t("adminTeam.permissionManagePaymentsPayouts"), roles: ["Super Admin", "Finance Admin"] as AdminRoleName[] },
    { permission: t("adminTeam.permissionManageAdmins"), roles: ["Super Admin"] as AdminRoleName[] },
  ];
}

function roleName(t: (k: TKey) => string, role: AdminRoleName): string {
  const map: Record<AdminRoleName, string> = {
    "Super Admin": t("adminTeam.superAdmin"),
    "Support Admin": t("adminTeam.supportAdmin"),
    "Finance Admin": t("adminTeam.financeAdmin"),
  };
  return map[role];
}

function roleSummary(t: (k: TKey) => string, role: AdminRoleName): string {
  const map: Record<AdminRoleName, string> = {
    "Super Admin": t("adminTeam.superAdminSummary"),
    "Support Admin": t("adminTeam.supportAdminSummary"),
    "Finance Admin": t("adminTeam.financeAdminSummary"),
  };
  return map[role];
}

export default function AdminTeamPage() {
  const { t } = useLang();
  const { items, isLoading, isRefetching, refetch, inviteAdmin, updateRole, deactivate, reactivate } = useAdminTeam();

  const [showInvite, setShowInvite] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUserData | null>(null);

  const currentAdminId = "adm-001";

  const permissionMatrix = useMemo(() => getPermissionMatrix(t), [t]);

  const handleDeactivate = useCallback(
    async (admin: AdminUserData) => {
      if (admin.id === currentAdminId) return;
      try {
        await deactivate(admin.id);
        toast.success(`${admin.name} ${t("adminTeam.deactivatedSuccess")}`);
      } catch {
        toast.error(t("adminTeam.invitationFailed"));
      }
    },
    [deactivate, currentAdminId, t],
  );

  const handleReactivate = useCallback(
    async (admin: AdminUserData) => {
      try {
        await reactivate(admin.id);
        toast.success(`${admin.name} ${t("adminTeam.reactivatedSuccess")}`);
      } catch {
        toast.error(t("adminTeam.invitationFailed"));
      }
    },
    [reactivate, t],
  );

  return (
    <div className="space-y-6">
      <div className="card-soft p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-display text-xl">{t("adminTeam.title")}</h3>
            <p className="text-sm text-text-light mt-1">
              {t("adminTeam.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
            <button
              onClick={() => setShowInvite(true)}
              className="btn-primary !py-2 !px-3 text-xs cursor-pointer"
            >
              <UserPlus size={14} className="inline mr-1" /> {t("adminTeam.inviteAdmin")}
            </button>
          </div>
        </div>
      </div>

      <div className="card-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={18} className="text-secondary" />
          <h4 className="font-display text-lg">{t("adminTeam.adminUsers")}</h4>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-surface" />
                <div className="h-4 w-32 bg-surface rounded" />
                <div className="h-4 w-48 bg-surface rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center gap-4 py-4 flex-wrap"
              >
                <Avatar name={admin.name} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{admin.name}</span>
                    <StatusChip status={admin.role} />
                    {!admin.isActive && (
                      <span className="text-[0.65rem] uppercase font-mono text-destructive">{t("adminTeam.deactivated")}</span>
                    )}
                  </div>
                  <div className="text-xs text-text-light mt-0.5">{admin.email}</div>
                  <div className="text-xs text-text-muted mt-0.5">{admin.permissionSummary}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingAdmin(admin)}
                    disabled={admin.id === currentAdminId}
                    className="chip !bg-surface hover:bg-border transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title={admin.id === currentAdminId ? t("adminTeam.cannotEditOwnRole") : t("adminTeam.editRole")}
                  >
                    <Edit2 size={12} className="inline mr-1" /> {t("adminTeam.editRole")}
                  </button>
                  {admin.isActive ? (
                    <button
                      onClick={() => handleDeactivate(admin)}
                      disabled={admin.id === currentAdminId}
                      className="chip !bg-destructive/10 !text-destructive hover:bg-destructive/20 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title={admin.id === currentAdminId ? t("adminTeam.cannotDeactivateSelf") : t("adminTeam.deactivate")}
                    >
                      <Ban size={12} className="inline mr-1" /> {t("adminTeam.deactivate")}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(admin)}
                      className="chip !bg-secondary/10 !text-secondary hover:bg-secondary/20 transition cursor-pointer"
                    >
                      <CheckCircle size={12} className="inline mr-1" /> {t("adminTeam.reactivate")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-soft p-5">
        <h4 className="font-display text-lg mb-4">{t("adminTeam.rolePermissions")}</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[0.65rem] uppercase font-mono text-text-light text-left border-b border-border">
                <th className="py-2 pr-4">{t("adminTeam.permission")}</th>
                {ROLE_ORDER.map((role) => (
                  <th key={role} className="py-2 px-4 text-center">{roleName(t, role)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {permissionMatrix.map((row) => (
                <tr key={row.permission}>
                  <td className="py-3 pr-4 font-medium">{row.permission}</td>
                  {ROLE_ORDER.map((role) => (
                    <td key={role} className="py-3 px-4 text-center">
                      {row.roles.includes(role) ? (
                        <span className="text-secondary font-bold">✓</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showInvite && (
        <InviteAdminModal onClose={() => setShowInvite(false)} onInvite={inviteAdmin} />
      )}

      {editingAdmin && (
        <EditRoleModal
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onSave={updateRole}
        />
      )}
    </div>
  );
}

function InviteAdminModal({
  onClose,
  onInvite,
}: {
  onClose: () => void;
  onInvite: (data: { email: string; name: string; role: AdminRoleName }) => Promise<unknown>;
}) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AdminRoleName>("Support Admin");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      toast.error(t("adminTeam.emailAndNameRequired"));
      return;
    }
    setSaving(true);
    try {
      await onInvite({ email, name, role });
      toast.success(`${t("adminTeam.invitationSent")} ${email}`);
      onClose();
    } catch {
      toast.error(t("adminTeam.invitationFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg mb-4">{t("adminTeam.inviteModalTitle")}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("adminTeam.name")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
              placeholder={t("adminTeam.namePlaceholder")}
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("adminTeam.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
              placeholder={t("adminTeam.emailPlaceholder")}
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("adminTeam.role")}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRoleName)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            >
              {ROLE_ORDER.map((r) => (
                <option key={r} value={r}>{roleName(t, r)}</option>
              ))}
            </select>
          </div>
          <div className="bg-surface rounded-xl p-3 text-xs text-text-light">
            <div className="font-mono uppercase mb-1">{t("adminTeam.permissionSummary")}</div>
            {roleSummary(t, role)}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer">
              {t("adminTeam.cancel")}
            </button>
            <button type="submit" disabled={saving} className="chip !bg-secondary !text-white cursor-pointer disabled:opacity-50">
              {saving ? t("adminTeam.sending") : t("adminTeam.sendInvitation")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditRoleModal({
  admin,
  onClose,
  onSave,
}: {
  admin: AdminUserData;
  onClose: () => void;
  onSave: (id: string, role: AdminRoleName) => Promise<unknown>;
}) {
  const { t } = useLang();
  const [role, setRole] = useState<AdminRoleName>(admin.role);
  const [saving, setSaving] = useState(false);

  const permissionMatrix = useMemo(() => getPermissionMatrix(t), [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(admin.id, role);
      toast.success(`${admin.name}'s ${t("adminTeam.roleUpdated")} ${roleName(t, role)}.`);
      onClose();
    } catch {
      toast.error(t("adminTeam.updateRoleFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg mb-1">{t("adminTeam.editRoleTitle")}</h3>
        <p className="text-sm text-text-light mb-4">{admin.name} — {admin.email}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("adminTeam.role")}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRoleName)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            >
              {ROLE_ORDER.map((r) => (
                <option key={r} value={r}>{roleName(t, r)}</option>
              ))}
            </select>
          </div>
          <div className="bg-surface rounded-xl p-3 text-xs text-text-light">
            <div className="font-mono uppercase mb-1">{t("adminTeam.permissionsFor")} {roleName(t, role)}</div>
            {permissionMatrix.map((row) => (
              <div key={row.permission} className="flex items-center gap-2 py-0.5">
                <span className={row.roles.includes(role) ? "text-secondary" : "text-text-muted"}>
                  {row.roles.includes(role) ? "✓" : "—"}
                </span>
                <span>{row.permission}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer">
              {t("adminTeam.cancel")}
            </button>
            <button type="submit" disabled={saving || role === admin.role} className="chip !bg-secondary !text-white cursor-pointer disabled:opacity-50">
              {saving ? t("adminTeam.saving") : t("adminTeam.saveRole")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}