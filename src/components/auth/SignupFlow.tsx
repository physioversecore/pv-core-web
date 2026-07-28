"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, HeartPulse, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth";
import type { Role } from "@/types";
import { CITIES, SPECIALTIES } from "@/constants";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";
import { sendOtp, verifyOtp } from "@/services/api/auth";

type SignupRole = "patient" | "therapist" | null;

export function SignupFlow({
  defaultSignupRole,
  onSuccess,
}: {
  defaultSignupRole?: SignupRole;
  onSuccess: (role: Role) => void;
}) {
  const [signupRole, setSignupRole] = useState<SignupRole>(defaultSignupRole ?? null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [otpStep, setOtpStep] = useState<null | "input" | "verifying">(null);
  const [otpCode, setOtpCode] = useState("");
  const [sending, setSending] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [submitted, setSubmitted] = useState<null | "patient-ok" | "therapist-ok">(null);
  const [resendAfter, setResendAfter] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { signupPatient, signupTherapist } = useAuth();
  const router = useRouter();
  const { t } = useLang();

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (otpStep === "input" && resendAfter > 0) {
      timerRef.current = setInterval(() => {
        setResendAfter((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [otpStep, resendAfter > 0]);

  const passwordValid = (pw: string) =>
    pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);

  const patientReady =
    !!form.first && !!form.email && !!form.phone && !!form.city &&
    !!form.password && !!form.confirm && form.password === form.confirm &&
    passwordValid(form.password) && !!form.terms;

  const therapistReady =
    !!form.first && !!form.email && !!form.specialty && !!form.license &&
    !!form.password && !!form.confirm && form.password === form.confirm &&
    passwordValid(form.password) && !!form.terms;

  const handlePatientSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first || !form.email || !form.phone || !form.city || !form.password) return toast.error(t("auth.errorFillAll"));
    if (form.password !== form.confirm) return toast.error(t("auth.errorPasswordsDontMatch"));
    if (!form.terms) return toast.error(t("auth.errorAcceptTerms"));
    const name = [form.first, form.middle, form.last].filter(Boolean).join(" ");
    setSending(true);
    try {
      const res = await sendOtp(form.email, name);
      setResendAfter(res.resend_after);
      setOtpStep("input");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("auth.errorSendOtpFailed"));
    } finally {
      setSending(false);
    }
  };

  const handleTherapistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first || !form.email || !form.specialty || !form.license || !form.password) return toast.error(t("auth.errorFillRequired"));
    if (form.password !== form.confirm) return toast.error(t("auth.errorPasswordsDontMatch"));
    if (!form.terms) return toast.error(t("auth.errorAcceptTerms"));
    const name = [form.first, form.middle, form.last].filter(Boolean).join(" ");
    setSending(true);
    try {
      const res = await sendOtp(form.email, name);
      setResendAfter(res.resend_after);
      setOtpStep("input");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("auth.errorSendOtpFailed"));
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtpAndSignup = async () => {
    if (!otpCode || otpCode.length !== 6) return toast.error(t("auth.errorInvalidOtp"));
    setOtpStep("verifying");
    const name = [form.first, form.middle, form.last].filter(Boolean).join(" ");
    try {
      await verifyOtp(form.email, otpCode);
      if (signupRole === "patient") {
        await signupPatient({ name, email: form.email, password: form.password, phone: form.phone, city: form.city });
        setSubmitted("patient-ok");
      } else {
        await signupTherapist({ name, email: form.email, password: form.password, phone: form.phone, city: form.city, specialty: form.specialty });
        setSubmitted("therapist-ok");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("auth.errorOtpFailed"));
      setOtpStep("input");
    }
  };

  const handleSuccessCta = (role: Role) => {
    onSuccess(role);
  };

  const handleResendOtp = useCallback(async () => {
    if (resendAfter > 0) return;
    const name = [form.first, form.middle, form.last].filter(Boolean).join(" ");
    try {
      const res = await sendOtp(form.email, name);
      setResendAfter(res.resend_after);
      setOtpCode("");
      toast.success(t("auth.otpSentTo"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("auth.errorSendOtpFailed"));
    }
  }, [resendAfter, form.email, form.first, form.middle, form.last, t]);

  if (submitted === "patient-ok") {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-surface grid place-items-center mx-auto mb-4 text-3xl">✓</div>
        <h2 className="text-2xl font-display mb-2">{t("auth.youAreAllSet")}</h2>
        <p className="text-text-light text-sm mb-6">{t("auth.patientSuccessSub")}</p>
        <button onClick={() => handleSuccessCta("patient")} className="btn-secondary">{t("auth.goToDashboard")}</button>
      </div>
    );
  }

  if (submitted === "therapist-ok") {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-surface grid place-items-center mx-auto mb-4 text-3xl">✓</div>
        <h2 className="text-2xl font-display mb-2">{t("auth.applicationReceived")}</h2>
        <p className="text-text-light text-sm mb-6">{t("auth.therapistSuccessSub")}</p>
        <button onClick={() => handleSuccessCta("therapist")} className="btn-secondary">{t("auth.openDashboard")}</button>
      </div>
    );
  }

  if (otpStep) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => { setOtpStep(null); setOtpCode(""); setResendAfter(0); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }} className="text-xs text-secondary flex items-center gap-1 cursor-pointer">
          <ArrowLeft size={12} /> {t("auth.backBtn")}
        </button>
        <h2 className="text-2xl font-display">{t("auth.verifyYourEmail")}</h2>
        <p className="text-text-light text-sm">
          {otpStep === "input" && <>{t("auth.otpSentTo")} <span className="font-medium text-text">{form.email}</span></>}
          {otpStep === "verifying" && t("auth.verifyingCode")}
        </p>
        {otpStep === "input" && (
          <div className="space-y-4">
            <input
              autoFocus
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleVerifyOtpAndSignup}
              disabled={otpCode.length !== 6}
              className="btn-secondary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("auth.verifyAndContinue")}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendAfter > 0 || sending}
              className="w-full text-center text-sm text-secondary hover:underline disabled:text-text-light disabled:no-underline disabled:cursor-not-allowed"
            >
              {resendAfter > 0
                ? t("auth.resendOtpIn").replace("{seconds}", String(resendAfter))
                : t("auth.resendOtp")}
            </button>
          </div>
        )}
        {otpStep === "verifying" && (
          <div className="py-8 flex justify-center">
            <Loader2 className="animate-spin text-secondary" size={32} />
          </div>
        )}
      </div>
    );
  }

  if (!signupRole) {
    return (
      <>
        <p className="eyebrow mb-2">{t("common.getStarted")}</p>
        <h2 className="text-3xl font-display mb-1">{t("auth.createAccount")}</h2>
        <p className="text-text-light text-sm mb-6">{t("auth.signupSubtitle")}</p>

        <div className="grid gap-3">
          <button onClick={() => setSignupRole("patient")} className="w-full text-left p-4 rounded-2xl border border-border bg-white hover:border-secondary hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface grid place-items-center shrink-0"><HeartPulse className="text-secondary" size={28} /></div>
            <div className="min-w-0">
              <div className="font-semibold text-text">{t("auth.iAmPatient")}</div>
              <div className="text-sm text-text-light">{t("auth.patientDesc")}</div>
            </div>
          </button>
          <button onClick={() => setSignupRole("therapist")} className="w-full text-left p-4 rounded-2xl border border-border bg-white hover:border-secondary hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface grid place-items-center shrink-0"><Stethoscope className="text-secondary" size={28} /></div>
            <div className="min-w-0">
              <div className="font-semibold text-text">{t("auth.iAmTherapist")}</div>
              <div className="text-sm text-text-light">{t("auth.therapistDesc")}</div>
            </div>
          </button>
        </div>

        <p className="text-sm text-text-light text-center mt-6">
          {t("auth.alreadyHaveAccount")}{" "}
          <a href="/login" className="text-secondary font-semibold hover:underline">{t("auth.loginBtn")}</a>
        </p>
      </>
    );
  }

  if (signupRole === "patient") {
    return (
      <form onSubmit={handlePatientSignup} className="space-y-3">
        <button type="button" onClick={() => setSignupRole(null)} className="text-xs text-secondary flex items-center gap-1 cursor-pointer">
          <ArrowLeft size={12} /> {t("auth.backBtn")}
        </button>
        <h2 className="text-2xl font-display">{t("auth.patientSignup")}</h2>
        <Field label={t("auth.labelFirstName")} value={form.first ?? ""} onChange={(v) => set("first", v)} placeholder={t("auth.placeholderFirstName")} />
        <div className="grid grid-cols-2 gap-3">
          <Field label={<>{t("auth.labelMiddleName")} <span className="text-text-light/60">{t("auth.optionalField")}</span></>} value={form.middle ?? ""} onChange={(v) => set("middle", v)} placeholder={t("auth.placeholderMiddleName")} />
          <Field label={t("auth.labelLastName")} value={form.last ?? ""} onChange={(v) => set("last", v)} placeholder={t("auth.placeholderLastName")} />
        </div>
        <Field label={t("auth.labelEmail")} type="email" value={form.email ?? ""} onChange={(v) => set("email", v)} placeholder={t("auth.placeholderEmail")} />
        <Field label={t("auth.labelPhone")} value={form.phone ?? ""} onChange={(v) => set("phone", v)} placeholder={t("auth.placeholderPhone")} />
        <SelectField label={t("auth.labelCity")} value={form.city ?? ""} onChange={(v) => set("city", v)} options={CITIES as unknown as string[]} />
        <div>
          <label className="text-xs font-medium text-text-light">{t("auth.labelPassword")}</label>
          <div className="relative mt-1">
            <input
              type={showPw ? "text" : "password"}
              value={form.password ?? ""}
              onChange={(e) => set("password", e.target.value)}
              placeholder={t("auth.placeholderPassword")}
              className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-white text-sm placeholder:text-[13px] placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-text-light">{t("auth.labelConfirmPassword")}</label>
          <div className="relative mt-1">
            <input
              type={showConfirmPw ? "text" : "password"}
              value={form.confirm ?? ""}
              onChange={(e) => set("confirm", e.target.value)}
              placeholder={t("auth.placeholderConfirm")}
              className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-white text-sm placeholder:text-[13px] placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="button" onClick={() => setShowConfirmPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
              {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.confirm && form.password !== form.confirm && (
            <p className="text-xs text-red-500 mt-1">{t("auth.passwordRuleNoMatch")}</p>
          )}
        </div>
        <PasswordRules password={form.password ?? ""} />
        <label className="flex gap-2 items-start text-xs text-text-light">
          <input type="checkbox" checked={form.terms === "1"} onChange={(e) => set("terms", e.target.checked ? "1" : "")} className="mt-0.5" />
          {t("auth.labelTermsPatient")}
        </label>
        <button type="submit" disabled={!patientReady || sending} className="btn-secondary w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {sending && <Loader2 className="animate-spin" size={16} />}
          {sending ? t("auth.sendingCode") : t("auth.createPatientAccount")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleTherapistSignup} className="space-y-3">
      <button type="button" onClick={() => setSignupRole(null)} className="text-xs text-secondary flex items-center gap-1 cursor-pointer">
        <ArrowLeft size={12} /> {t("auth.backBtn")}
      </button>
      <h2 className="text-2xl font-display">{t("auth.therapistApplication")}</h2>
      <Field label={t("auth.labelFirstName")} value={form.first ?? ""} onChange={(v) => set("first", v)} placeholder={t("auth.placeholderFirstName")} />
      <div className="grid grid-cols-2 gap-3">
        <Field label={<>{t("auth.labelMiddleName")} <span className="text-text-light/60">{t("auth.optionalField")}</span></>} value={form.middle ?? ""} onChange={(v) => set("middle", v)} placeholder={t("auth.placeholderMiddleName")} />
        <Field label={t("auth.labelLastName")} value={form.last ?? ""} onChange={(v) => set("last", v)} placeholder={t("auth.placeholderLastName")} />
      </div>
      <Field label={t("auth.labelEmail")} type="email" value={form.email ?? ""} onChange={(v) => set("email", v)} placeholder={t("auth.placeholderEmail")} />
      <Field label={t("auth.labelPhone")} value={form.phone ?? ""} onChange={(v) => set("phone", v)} placeholder={t("auth.placeholderPhone")} />
      <div className="grid grid-cols-2 gap-3">
        <SelectField label={t("auth.labelCity")} value={form.city ?? ""} onChange={(v) => set("city", v)} options={CITIES as unknown as string[]} />
        <SelectField label={t("auth.labelSpecialty")} value={form.specialty ?? ""} onChange={(v) => set("specialty", v)} options={SPECIALTIES as unknown as string[]} />
      </div>
      <div>
        <label className="text-xs font-medium text-text-light">{t("auth.labelPassword")}</label>
        <div className="relative mt-1">
          <input
            type={showPw ? "text" : "password"}
            value={form.password ?? ""}
            onChange={(e) => set("password", e.target.value)}
            placeholder={t("auth.placeholderPassword")}
            className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-white text-sm placeholder:text-[13px] placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-text-light">{t("auth.labelConfirmPassword")}</label>
        <div className="relative mt-1">
          <input
            type={showConfirmPw ? "text" : "password"}
            value={form.confirm ?? ""}
            onChange={(e) => set("confirm", e.target.value)}
            placeholder={t("auth.placeholderConfirm")}
            className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-white text-sm placeholder:text-[13px] placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="button" onClick={() => setShowConfirmPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
            {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {form.confirm && form.password !== form.confirm && (
          <p className="text-xs text-red-500 mt-1">{t("auth.passwordRuleNoMatch")}</p>
        )}
      </div>
      <PasswordRules password={form.password ?? ""} />
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("auth.labelLicense")} value={form.license ?? ""} onChange={(v) => set("license", v)} placeholder={t("auth.placeholderLicense")} />
        <Field label={t("auth.labelExperience")} type="number" value={form.exp ?? ""} onChange={(v) => set("exp", v)} placeholder={t("auth.placeholderExperience")} />
      </div>
      <Field label={t("auth.labelFee")} type="number" value={form.fee ?? ""} onChange={(v) => set("fee", v)} placeholder={t("auth.placeholderFee")} />

      <UploadBox label={t("auth.labelUploadLicense")} onFile={() => set("licenseFile", "uploaded")} uploaded={form.licenseFile === "uploaded"} />
      <UploadBox label={t("auth.labelUploadCert")} onFile={() => set("certFile", "uploaded")} uploaded={form.certFile === "uploaded"} />

      <label className="flex gap-2 items-start text-xs text-text-light">
        <input type="checkbox" checked={form.terms === "1"} onChange={(e) => set("terms", e.target.checked ? "1" : "")} className="mt-0.5" />
        {t("auth.labelTermsTherapist")}
      </label>
      <button type="submit" disabled={!therapistReady || sending} className="btn-secondary w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {sending && <Loader2 className="animate-spin" size={16} />}
        {sending ? t("auth.sendingCode") : t("auth.submitApplication")}
      </button>
    </form>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }: { label: React.ReactNode; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-text-light">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm placeholder:text-[13px] placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary"
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
        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm placeholder:text-[13px] placeholder:text-text-light/60 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">{t("auth.selectOption")}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
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

function PasswordRules({ password }: { password: string }) {
  const { t } = useLang();
  const rules = [
    { label: t("auth.passwordRuleLength"), met: password.length >= 8 },
    { label: t("auth.passwordRuleUpper"), met: /[A-Z]/.test(password) },
    { label: t("auth.passwordRuleLower"), met: /[a-z]/.test(password) },
    { label: t("auth.passwordRuleNumber"), met: /[0-9]/.test(password) },
    { label: t("auth.passwordRuleSymbol"), met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="rounded-xl border border-border bg-white p-3 space-y-1.5">
      <p className="text-[11px] font-medium text-text-light mb-1">Password rules:</p>
      {rules.map((r) => (
        <div key={r.label} className="flex items-center gap-2 text-xs">
          <span className={`w-4 h-4 rounded-full grid place-items-center shrink-0 text-[10px] ${r.met ? "bg-secondary text-white" : "bg-surface text-text-light"}`}>
            {r.met ? "✓" : ""}
          </span>
          <span className={r.met ? "text-secondary" : "text-text-light"}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}
