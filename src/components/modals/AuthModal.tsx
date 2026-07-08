"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff, Stethoscope, HeartPulse } from "lucide-react";
import { useAuth } from "@/context/auth";
import type { Role, AuthMode } from "@/types";
import { CITIES, SPECIALTIES } from "@/constants";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";

type SignupRole = "patient" | "therapist" | null;

export function AuthModal({
  open,
  mode: initialMode,
  onClose,
}: {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loginRole, setLoginRole] = useState<Role>("patient");
  const [signupRole, setSignupRole] = useState<SignupRole>(null);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const { login, signupPatient, signupTherapist } = useAuth();
  const router = useRouter();
  const [submitted, setSubmitted] = useState<null | "patient-ok" | "therapist-ok">(null);
  const { t } = useLang();

  if (!open) return null;

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error(t("auth.errorEmailPassword"));
    try {
      const u = await login(form.email, form.password, loginRole);
      toast.success(t("auth.successWelcome") + ", " + u.name);
      onClose();
      router.push(loginRole === "patient" ? "/patient" : loginRole === "therapist" ? "/therapist" : "/admin");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("auth.errorLoginFailed"));
    }
  };

  const handlePatientSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first || !form.email || !form.phone || !form.city || !form.password) return toast.error(t("auth.errorFillAll"));
    if (form.password !== form.confirm) return toast.error(t("auth.errorPasswordsDontMatch"));
    if (!form.terms) return toast.error(t("auth.errorAcceptTerms"));
    try {
      await signupPatient({ name: `${form.first} ${form.last ?? ""}`.trim(), email: form.email, password: form.password, phone: form.phone, city: form.city });
      setSubmitted("patient-ok");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("auth.errorSignupFailed"));
    }
  };

  const handleTherapistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first || !form.email || !form.specialty || !form.license) return toast.error(t("auth.errorFillRequired"));
    try {
      await signupTherapist({
        name: `${form.first} ${form.last ?? ""}`.trim(),
        email: form.email,
        password: form.password ?? "password123",
        phone: form.phone,
        city: form.city ?? "Kathmandu",
        specialty: form.specialty,
      });
      setSubmitted("therapist-ok");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("auth.errorSignupFailed"));
    }
  };

  const onSuccessGo = (role: Role) => {
    onClose();
    router.push(role === "patient" ? "/patient" : "/therapist");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-text/60 backdrop-blur-sm" onClick={onClose} aria-label={t("common.close")} />
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-background rounded-3xl border border-border shadow-2xl p-7 sm:p-9">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-surface" aria-label={t("common.close")}>
          <X size={18} />
        </button>

        {submitted === "patient-ok" && (
          <SuccessScreen
            title={t("auth.youAreAllSet")}
            sub={t("auth.patientSuccessSub")}
            cta={t("auth.goToDashboard")}
            onCta={() => onSuccessGo("patient")}
          />
        )}
        {submitted === "therapist-ok" && (
          <SuccessScreen
            title={t("auth.applicationReceived")}
            sub={t("auth.therapistSuccessSub")}
            cta={t("auth.openDashboard")}
            onCta={() => onSuccessGo("therapist")}
          />
        )}

        {!submitted && mode === "login" && (
          <>
            <p className="eyebrow mb-2">{t("auth.account")}</p>
            <h2 className="text-3xl font-display mb-1">{t("auth.welcomeBack")}</h2>
            <p className="text-text-light text-sm mb-5">{t("auth.loginSubtitle")}</p>

            <div className="flex gap-1 p-1 bg-surface rounded-full mb-5">
              {(["patient", "therapist", "admin"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setLoginRole(r)}
                  className={`flex-1 py-2 rounded-full text-sm font-medium capitalize transition ${
                    loginRole === r ? "bg-white text-secondary shadow-sm" : "text-text-light"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <Field label={t("auth.labelEmail")} type="email" value={form.email ?? ""} onChange={(v) => set("email", v)} placeholder={t("auth.placeholderEmail")} />
              <div>
                <label className="text-xs font-medium text-text-light">{t("auth.labelPassword")}</label>
                <div className="relative mt-1">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password ?? ""}
                    onChange={(e) => set("password", e.target.value)}
                    className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <button type="button" className="text-xs text-secondary hover:underline">{t("common.forgotPassword")}</button>
                </div>
              </div>
              <button type="submit" className="btn-secondary w-full">{t("auth.loginBtn")}</button>
            </form>

            <p className="text-sm text-text-light text-center mt-5">
              {t("auth.dontHaveAccount")}{" "}
              <button onClick={() => setMode("signup")} className="text-secondary font-semibold hover:underline">{t("common.signUp")}</button>
            </p>
          </>
        )}

        {!submitted && mode === "signup" && !signupRole && (
          <>
            <p className="eyebrow mb-2">{t("common.getStarted")}</p>
            <h2 className="text-3xl font-display mb-1">{t("auth.createAccount")}</h2>
            <p className="text-text-light text-sm mb-6">{t("auth.signupSubtitle")}</p>

            <div className="grid gap-3">
              <RoleCard
                icon={<HeartPulse className="text-secondary" size={28} />}
                title={t("auth.iAmPatient")}
                sub={t("auth.patientDesc")}
                onClick={() => setSignupRole("patient")}
              />
              <RoleCard
                icon={<Stethoscope className="text-secondary" size={28} />}
                title={t("auth.iAmTherapist")}
                sub={t("auth.therapistDesc")}
                onClick={() => setSignupRole("therapist")}
              />
            </div>

            <p className="text-sm text-text-light text-center mt-6">
              {t("auth.alreadyHaveAccount")}{" "}
              <button onClick={() => setMode("login")} className="text-secondary font-semibold hover:underline">{t("auth.loginBtn")}</button>
            </p>
          </>
        )}

        {!submitted && mode === "signup" && signupRole === "patient" && (
          <form onSubmit={handlePatientSignup} className="space-y-3">
            <button type="button" onClick={() => setSignupRole(null)} className="text-xs text-secondary">{t("auth.backBtn")}</button>
            <h2 className="text-2xl font-display">{t("auth.patientSignup")}</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("auth.labelFirstName")} value={form.first ?? ""} onChange={(v) => set("first", v)} />
              <Field label={t("auth.labelLastName")} value={form.last ?? ""} onChange={(v) => set("last", v)} />
            </div>
            <Field label={t("auth.labelEmail")} type="email" value={form.email ?? ""} onChange={(v) => set("email", v)} />
            <Field label={t("auth.labelPhone")} value={form.phone ?? ""} onChange={(v) => set("phone", v)} placeholder={t("auth.placeholderPhone")} />
            <SelectField label={t("auth.labelCity")} value={form.city ?? ""} onChange={(v) => set("city", v)} options={CITIES as unknown as string[]} />
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("auth.labelPassword")} type="password" value={form.password ?? ""} onChange={(v) => set("password", v)} />
              <Field label={t("auth.labelConfirm")} type="password" value={form.confirm ?? ""} onChange={(v) => set("confirm", v)} />
            </div>
            <label className="flex gap-2 items-start text-xs text-text-light">
              <input type="checkbox" onChange={(e) => set("terms", e.target.checked ? "1" : "")} className="mt-0.5" />
              {t("auth.labelTermsPatient")}
            </label>
            <button type="submit" className="btn-secondary w-full">{t("auth.createPatientAccount")}</button>
          </form>
        )}

        {!submitted && mode === "signup" && signupRole === "therapist" && (
          <form onSubmit={handleTherapistSignup} className="space-y-3">
            <button type="button" onClick={() => setSignupRole(null)} className="text-xs text-secondary">{t("auth.backBtn")}</button>
            <h2 className="text-2xl font-display">{t("auth.therapistApplication")}</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("auth.labelFirstName")} value={form.first ?? ""} onChange={(v) => set("first", v)} />
              <Field label={t("auth.labelLastName")} value={form.last ?? ""} onChange={(v) => set("last", v)} />
            </div>
            <Field label={t("auth.labelEmail")} type="email" value={form.email ?? ""} onChange={(v) => set("email", v)} />
            <Field label={t("auth.labelPhone")} value={form.phone ?? ""} onChange={(v) => set("phone", v)} />
            <div className="grid grid-cols-2 gap-3">
              <SelectField label={t("auth.labelCity")} value={form.city ?? ""} onChange={(v) => set("city", v)} options={CITIES as unknown as string[]} />
              <SelectField label={t("auth.labelSpecialty")} value={form.specialty ?? ""} onChange={(v) => set("specialty", v)} options={SPECIALTIES as unknown as string[]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("auth.labelLicense")} value={form.license ?? ""} onChange={(v) => set("license", v)} />
              <Field label={t("auth.labelExperience")} type="number" value={form.exp ?? ""} onChange={(v) => set("exp", v)} />
            </div>
            <Field label={t("auth.labelFee")} type="number" value={form.fee ?? ""} onChange={(v) => set("fee", v)} placeholder={t("auth.placeholderFee")} />

            <UploadBox label={t("auth.labelUploadLicense")} onFile={() => set("licenseFile", "uploaded")} uploaded={form.licenseFile === "uploaded"} />
            <UploadBox label={t("auth.labelUploadCert")} onFile={() => set("certFile", "uploaded")} uploaded={form.certFile === "uploaded"} />

            <label className="flex gap-2 items-start text-xs text-text-light">
              <input type="checkbox" onChange={(e) => set("terms", e.target.checked ? "1" : "")} className="mt-0.5" />
              {t("auth.labelTermsTherapist")}
            </label>
            <button type="submit" className="btn-secondary w-full">{t("auth.submitApplication")}</button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-text-light">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  const { t } = useLang();
  return (
    <div>
      <label className="text-xs font-medium text-text-light">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">{t("auth.selectOption")}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function RoleCard({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left p-4 rounded-2xl border border-border bg-white hover:border-secondary hover:shadow-md transition flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-surface grid place-items-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="font-semibold text-text">{title}</div>
        <div className="text-sm text-text-light">{sub}</div>
      </div>
    </button>
  );
}
function UploadBox({ label, onFile, uploaded }: { label: string; onFile: () => void; uploaded: boolean }) {
  const { t } = useLang();
  return (
    <button type="button" onClick={onFile} className={`w-full p-3 rounded-xl border-2 border-dashed text-sm ${uploaded ? "border-secondary bg-surface text-secondary" : "border-border text-text-light hover:border-secondary"}`}>
      {uploaded ? t("auth.documentUploaded") : `📎 ${label}`}
    </button>
  );
}
function SuccessScreen({ title, sub, cta, onCta }: { title: string; sub: string; cta: string; onCta: () => void }) {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 rounded-full bg-surface grid place-items-center mx-auto mb-4 text-3xl">✓</div>
      <h2 className="text-2xl font-display mb-2">{title}</h2>
      <p className="text-text-light text-sm mb-6">{sub}</p>
      <button onClick={onCta} className="btn-secondary">{cta}</button>
    </div>
  );
}
