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
import { DatePicker } from "@/components/ui/date-picker";
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
  HeartPulse,
  PhoneCall,
  Bell,
} from "lucide-react";

interface PatientDetailSheetProps {
  patient: AdminPatientData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "view" | "edit";
  onSave?: (data: Partial<AdminPatientData>) => Promise<void>;
}

interface PatientForm {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  history: string;
  dob: string;
  gender: string;
  condition: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  notifEmail: boolean;
  notifSms: boolean;
}

const EMPTY_FORM: PatientForm = {
  name: "",
  email: "",
  phone: "",
  city: "",
  address: "",
  history: "",
  dob: "",
  gender: "Any",
  condition: "",
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
  notifEmail: true,
  notifSms: true,
};

const GENDER_OPTIONS = ["Any", "Male", "Female"] as const;

export function PatientDetailSheet({
  patient,
  open,
  onOpenChange,
  mode = "view",
  onSave,
}: PatientDetailSheetProps) {
  const { t } = useLang();
  const GENDER_LABELS: Record<string, string> = {
    Any: t("patient_dashboard.any" as any) ?? "Any",
    Male: t("patient_dashboard.male" as any) ?? "Male",
    Female: t("patient_dashboard.female" as any) ?? "Female",
  };
  const genderLabel = (g: string | null | undefined) => (g == null ? "—" : (GENDER_LABELS[g] ?? g));
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

  const [form, setForm] = useState<PatientForm>(EMPTY_FORM);

  useEffect(() => {
    if (patient) {
      setAvatarPreview(null);
      setForm({
        name: patient.name ?? "",
        email: patient.email ?? "",
        phone: patient.phone ?? "",
        city: patient.city ?? "",
        address: patient.address ?? "",
        history: patient.history ?? "",
        dob: patient.dob ?? "",
        gender: patient.gender ?? "Any",
        condition: patient.condition ?? "",
        emergencyName: patient.emergencyName ?? "",
        emergencyRelation: patient.emergencyRelation ?? "",
        emergencyPhone: patient.emergencyPhone ?? "",
        notifEmail: patient.notifEmail ?? true,
        notifSms: patient.notifSms ?? true,
      });
    }
  }, [patient]);

  const hasChanges = useMemo(() => {
    if (!patient) return false;
    const p = patient;
    return (
      form.name !== (p.name ?? "") ||
      form.email !== (p.email ?? "") ||
      form.phone !== (p.phone ?? "") ||
      form.city !== (p.city ?? "") ||
      form.address !== (p.address ?? "") ||
      form.history !== (p.history ?? "") ||
      form.dob !== (p.dob ?? "") ||
      form.gender !== (p.gender ?? "Any") ||
      form.condition !== (p.condition ?? "") ||
      form.emergencyName !== (p.emergencyName ?? "") ||
      form.emergencyRelation !== (p.emergencyRelation ?? "") ||
      form.emergencyPhone !== (p.emergencyPhone ?? "") ||
      form.notifEmail !== (p.notifEmail ?? true) ||
      form.notifSms !== (p.notifSms ?? true)
    );
  }, [form, patient]);

  const setField = (key: keyof PatientForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setToggle = (key: "notifEmail" | "notifSms", checked: boolean) =>
    setForm((prev) => ({ ...prev, [key]: checked }));

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
        address: form.address || undefined,
        history: form.history || undefined,
        dob: form.dob || undefined,
        gender: form.gender,
        condition: form.condition || undefined,
        emergencyName: form.emergencyName || undefined,
        emergencyRelation: form.emergencyRelation || undefined,
        emergencyPhone: form.emergencyPhone || undefined,
        notifEmail: form.notifEmail,
        notifSms: form.notifSms,
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
  const dobLine = patient.dob
    ? `${patient.dob}${patient.age != null ? ` · ${t("admin_dashboard.age" as any) ?? "Age"}: ${patient.age}` : ""}`
    : "—";

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
                <EditField
                  label={t("admin_dashboard.name" as any) ?? "Name"}
                  value={form.name}
                  onChange={(v) => setField("name", v)}
                />
                <EditField
                  label={t("admin_dashboard.email" as any) ?? "Email"}
                  value={form.email}
                  onChange={(v) => setField("email", v)}
                  type="email"
                />
                <EditField
                  label={t("admin_dashboard.phone" as any) ?? "Phone"}
                  value={form.phone}
                  onChange={(v) => setField("phone", v)}
                />
                <EditField
                  label={t("admin_dashboard.city" as any) ?? "City"}
                  value={form.city}
                  onChange={(v) => setField("city", v)}
                />
                <div>
                  <label className="text-xs font-mono text-text-light uppercase">
                    {t("admin_dashboard.dob" as any) ?? "Date of birth"}
                  </label>
                  <div className="mt-1">
                    <DatePicker
                      value={form.dob}
                      onChange={(v) => setField("dob", v)}
                      placeholder={t("admin_dashboard.dob" as any) ?? "Date of birth"}
                      dropdowns
                    />
                  </div>
                </div>
                <EditSelect
                  label={t("admin_dashboard.gender" as any) ?? "Gender"}
                  value={form.gender}
                  onChange={(v) => setField("gender", v)}
                  options={GENDER_OPTIONS.map((g) => ({ value: g, label: genderLabel(g) }))}
                />
                <EditField
                  label={t("admin_dashboard.address" as any) ?? "Address"}
                  value={form.address}
                  onChange={(v) => setField("address", v)}
                />
              </>
            ) : (
              <>
                <InfoRow
                  icon={<User size={14} />}
                  label={t("admin_dashboard.name" as any) ?? "Name"}
                  value={patient.name}
                />
                <InfoRow
                  icon={<Mail size={14} />}
                  label={t("admin_dashboard.email" as any) ?? "Email"}
                  value={patient.email ?? "—"}
                />
                <InfoRow
                  icon={<Phone size={14} />}
                  label={t("admin_dashboard.phone" as any) ?? "Phone"}
                  value={patient.phone ?? "—"}
                />
                <InfoRow
                  icon={<MapPin size={14} />}
                  label={t("admin_dashboard.city" as any) ?? "City"}
                  value={patient.city}
                />
                <InfoRow
                  icon={<Calendar size={14} />}
                  label={t("admin_dashboard.dob" as any) ?? "Date of birth"}
                  value={dobLine}
                />
                <InfoRow
                  icon={<User size={14} />}
                  label={t("admin_dashboard.gender" as any) ?? "Gender"}
                  value={genderLabel(patient.gender)}
                />
                <InfoRow
                  icon={<MapPin size={14} />}
                  label={t("admin_dashboard.address" as any) ?? "Address"}
                  value={patient.address ?? "—"}
                />
              </>
            )}
          </Section>

          <Section title={t("admin_dashboard.medicalInfo" as any) ?? "Medical"}>
            {isEdit ? (
              <>
                <EditField
                  label={t("admin_dashboard.condition" as any) ?? "Condition"}
                  value={form.condition}
                  onChange={(v) => setField("condition", v)}
                />
                <EditTextarea
                  label={t("admin_dashboard.history" as any) ?? "Medical history"}
                  value={form.history}
                  onChange={(v) => setField("history", v)}
                />
              </>
            ) : (
              <>
                <InfoRow
                  icon={<HeartPulse size={14} />}
                  label={t("admin_dashboard.condition" as any) ?? "Condition"}
                  value={patient.condition || "—"}
                />
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-text-light mt-0.5">
                    <Activity size={14} />
                  </span>
                  <span className="text-text-light w-24 shrink-0">
                    {t("admin_dashboard.history" as any) ?? "History"}
                  </span>
                  <span className="font-medium whitespace-pre-wrap">{patient.history || "—"}</span>
                </div>
              </>
            )}
          </Section>

          {!isEdit && (
            <Section title={t("admin_dashboard.emergencyContact" as any) ?? "Emergency contact"}>
              <InfoRow
                icon={<PhoneCall size={14} />}
                label={t("admin_dashboard.emergencyName" as any) ?? "Name"}
                value={patient.emergencyName ?? "—"}
              />
              <InfoRow
                icon={<User size={14} />}
                label={t("admin_dashboard.emergencyRelation" as any) ?? "Relation"}
                value={patient.emergencyRelation ?? "—"}
              />
              <InfoRow
                icon={<Phone size={14} />}
                label={t("admin_dashboard.emergencyPhone" as any) ?? "Phone"}
                value={patient.emergencyPhone ?? "—"}
              />
            </Section>
          )}

          {isEdit && (
            <Section title={t("admin_dashboard.emergencyContact" as any) ?? "Emergency contact"}>
              <EditField
                label={t("admin_dashboard.emergencyName" as any) ?? "Name"}
                value={form.emergencyName}
                onChange={(v) => setField("emergencyName", v)}
              />
              <EditField
                label={t("admin_dashboard.emergencyRelation" as any) ?? "Relation"}
                value={form.emergencyRelation}
                onChange={(v) => setField("emergencyRelation", v)}
              />
              <EditField
                label={t("admin_dashboard.emergencyPhone" as any) ?? "Phone"}
                value={form.emergencyPhone}
                onChange={(v) => setField("emergencyPhone", v)}
              />
            </Section>
          )}

          {isEdit && (
            <Section title={t("admin_dashboard.preferences" as any) ?? "Notifications"}>
              <EditToggle
                label={t("admin_dashboard.notifEmail" as any) ?? "Email notifications"}
                checked={form.notifEmail}
                onChange={(c) => setToggle("notifEmail", c)}
              />
              <EditToggle
                label={t("admin_dashboard.notifSms" as any) ?? "SMS notifications"}
                checked={form.notifSms}
                onChange={(c) => setToggle("notifSms", c)}
              />
            </Section>
          )}

          <Section title={t("admin_dashboard.activityInfo" as any) ?? "Activity"}>
            <InfoRow
              icon={<Activity size={14} />}
              label={t("admin_dashboard.sessions" as any) ?? "Sessions"}
              value={`${patient.sessions}`}
            />
            <InfoRow
              icon={<User size={14} />}
              label={t("admin_dashboard.therapist" as any) ?? "Therapist"}
              value={patient.therapist || "—"}
            />
            <InfoRow
              icon={<Calendar size={14} />}
              label={t("admin_dashboard.joined" as any) ?? "Joined"}
              value={patient.joined}
            />
          </Section>

          {!isEdit && (
            <Section title={t("admin_dashboard.status" as any) ?? "Status"}>
              <div className="flex items-center gap-3">
                <Badge variant={patient.isActive ? "default" : "destructive"}>
                  {patient.isActive
                    ? (t("admin_dashboard.active" as any) ?? "Active")
                    : (t("admin_dashboard.inactive" as any) ?? "Inactive")}
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
                {t("admin_dashboard.cancel" as any) ?? "Cancel"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex-1 btn-secondary !py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                {saving
                  ? (t("admin_dashboard.saving" as any) ?? "Saving…")
                  : (t("admin_dashboard.save" as any) ?? "Save")}
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

function EditTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-mono text-text-light uppercase">{label}</label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm resize-y"
      />
    </div>
  );
}

function EditSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-xs font-mono text-text-light uppercase">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function EditToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
      <span className="inline-flex items-center gap-2 text-text-light">
        <Bell size={14} />
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-primary"
      />
    </label>
  );
}
