"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useAdminPatients } from "@/hooks/useAdminPatients";
import type { AdminPatientData } from "@/services/api/admin";
import {
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  Activity,
  ShieldCheck,
  ShieldOff,
  Camera,
  Save,
  X,
  Loader2,
} from "lucide-react";

interface PatientDetailSheetProps {
  patient: AdminPatientData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "view" | "edit";
  onSave?: (data: Partial<AdminPatientData>) => Promise<void>;
}

export function PatientDetailSheet({
  patient,
  open,
  onOpenChange,
  mode = "view",
  onSave,
}: PatientDetailSheetProps) {
  const { t } = useLang();
  const { togglePatientStatus } = useAdminPatients({
    search: "",
    dateFrom: "",
    dateTo: "",
    status: "",
    city: "",
    sortBy: "name",
    sortOrder: "asc",
    page: 1,
    pageSize: 10,
  });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: patient?.name ?? "",
    email: patient?.email ?? "",
    phone: patient?.phone ?? "",
    city: patient?.city ?? "",
  });

  useEffect(() => {
    if (patient) {
      setAvatarPreview(null);
      setForm({
        name: patient.name ?? "",
        email: patient.email ?? "",
        phone: patient.phone ?? "",
        city: patient.city ?? "",
      });
    }
  }, [patient]);

  const hasChanges = useMemo(() => {
    if (!patient) return false;
    return (
      form.name !== (patient.name ?? "") ||
      form.email !== (patient.email ?? "") ||
      form.phone !== (patient.phone ?? "") ||
      form.city !== (patient.city ?? "")
    );
  }, [form, patient]);

  const setField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleToggleStatus = useCallback(async () => {
    if (!patient) return;
    setToggling(true);
    try {
      const nextActive = !patient.isActive;
      await togglePatientStatus(patient.id, nextActive);
      toast.success(
        nextActive
          ? (t("admin_dashboard.patientActivated" as any) ?? "Patient activated")
          : (t("admin_dashboard.patientDeactivated" as any) ?? "Patient deactivated"),
      );
      onOpenChange(false);
    } catch {
      toast.error(t("common.tryAgain" as any) ?? "Something went wrong");
    } finally {
      setToggling(false);
    }
  }, [patient, togglePatientStatus, t, onOpenChange]);

  const handleSave = useCallback(async () => {
    if (!patient || !onSave) return;
    setSaving(true);
    try {
      await onSave({
        name: form.name,
        email: form.email,
        phone: form.phone,
        city: form.city,
      });
      toast.success(t("common.saved" as any) ?? "Saved");
      onOpenChange(false);
    } catch {
      toast.error(t("common.tryAgain" as any) ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  }, [patient, onSave, form, t, onOpenChange]);

  if (!patient) return null;

  const isEdit = mode === "edit";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Avatar name={patient.name} size={56} src={avatarPreview ?? undefined} />
              {isEdit && (
                <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera size={16} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setAvatarPreview(url);
                      }
                    }}
                  />
                </label>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg">{patient.name}</SheetTitle>
              <SheetDescription className="text-xs">
                {patient.city} &middot; {patient.therapist}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          <Section title={t("admin_dashboard.personalInfo" as any) ?? "Personal Information"}>
            {isEdit ? (
              <>
                <EditField label={t("admin_dashboard.name" as any) ?? "Name"} value={form.name} onChange={(v) => setField("name", v)} />
                <EditField label={t("admin_dashboard.email" as any) ?? "Email"} value={form.email} onChange={(v) => setField("email", v)} type="email" />
                <EditField label={t("admin_dashboard.phone" as any) ?? "Phone"} value={form.phone} onChange={(v) => setField("phone", v)} />
                <EditField label={t("admin_dashboard.city" as any) ?? "City"} value={form.city} onChange={(v) => setField("city", v)} />
              </>
            ) : (
              <>
                <InfoRow icon={<User size={14} />} label={t("admin_dashboard.name" as any) ?? "Name"} value={patient.name} />
                <InfoRow icon={<Mail size={14} />} label={t("admin_dashboard.email" as any) ?? "Email"} value={patient.email ?? "—"} />
                <InfoRow icon={<Phone size={14} />} label={t("admin_dashboard.phone" as any) ?? "Phone"} value={patient.phone ?? "—"} />
                <InfoRow icon={<MapPin size={14} />} label={t("admin_dashboard.city" as any) ?? "City"} value={patient.city} />
              </>
            )}
          </Section>

          <Section title={t("admin_dashboard.activityInfo" as any) ?? "Activity"}>
            <InfoRow icon={<Activity size={14} />} label={t("admin_dashboard.sessions" as any) ?? "Sessions"} value={`${patient.sessions}`} />
            <InfoRow icon={<User size={14} />} label={t("admin_dashboard.therapist" as any) ?? "Therapist"} value={patient.therapist || "—"} />
            <InfoRow icon={<Calendar size={14} />} label={t("admin_dashboard.joined" as any) ?? "Joined"} value={patient.joined} />
          </Section>

          {!isEdit && (
            <Section title={t("admin_dashboard.status" as any) ?? "Status"}>
              <div className="flex items-center gap-3">
                <Badge variant={patient.isActive ? "default" : "destructive"}>
                  {patient.isActive ? "Active" : "Inactive"}
                </Badge>
                <span className="text-xs text-text-light">
                  {t("admin_dashboard.joined" as any) ?? "Joined"}: {patient.joined}
                </span>
              </div>
            </Section>
          )}

          {isEdit ? (
            <div className="flex gap-2 pt-2 pb-4">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 btn-outline !py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X size={14} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex-1 btn-secondary !py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2 pb-4">
              <button
                onClick={handleToggleStatus}
                disabled={toggling}
                className={`flex-1 !py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  patient.isActive
                    ? "btn-outline !text-red-500 !border-red-500 hover:!bg-red-500 hover:!text-white"
                    : "btn-secondary"
                }`}
              >
                {toggling ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : patient.isActive ? (
                  <ShieldOff size={14} />
                ) : (
                  <ShieldCheck size={14} />
                )}
                {toggling
                  ? (t("admin_dashboard.updating" as any) ?? "Updating…")
                  : patient.isActive
                    ? (t("admin_dashboard.deactivate" as any) ?? "Deactivate")
                    : (t("admin_dashboard.activate" as any) ?? "Activate")}
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-mono uppercase text-text-light mb-2">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-text-light">{icon}</span>
      <span className="text-text-light w-24 shrink-0">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email" | "number";
}) {
  return (
    <div>
      <label className="text-xs font-mono text-text-light uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
      />
    </div>
  );
}
