"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, HeartPulse, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth";
import type { Role } from "@/types";
import { CITIES, SPECIALTIES } from "@/constants";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";
import { sendOtp, verifyOtp } from "@/services/auth-flow";
import { DocumentUploader, type UploadedDoc } from "@/components/auth/DocumentUploader";
import { PasswordRules } from "@/components/auth/PasswordRules";
import { InlineError } from "@/components/common/InlineError";

type SignupRole = "patient" | "therapist" | null;

export function SignupFlow({
  defaultSignupRole,
  onSuccess,
  isSignUpPage = true
}: {
  defaultSignupRole?: SignupRole;
  onSuccess: (role: Role) => void;
  isSignUpPage?:boolean
}) {
  const [signupRole, setSignupRole] = useState<SignupRole>(defaultSignupRole ?? null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [docs, setDocs] = useState<Record<string, UploadedDoc[]>>({
    license: [],
    cert: [],
  });
  const [otpStep, setOtpStep] = useState<null | "input" | "verifying">(null);
  const [otpCode, setOtpCode] = useState("");
  const [sending, setSending] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [submitted, setSubmitted] = useState<null | "patient-ok" | "therapist-ok">(null);
  const [resendAfter, setResendAfter] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { signupPatient, signupTherapist } = useAuth();
  const router = useRouter();
  const { t } = useLang();

  const set = (k: string, v: string) => { setForm((f) => ({ ...f, [k]: v })); setError(null); };

  const docsReady = (list: UploadedDoc[]) =>
    list.length > 0 && list.every((d) => d.status === "done");

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
    !!form.name && !!form.email && !!form.phone && !!form.city &&
    !!form.password && !!form.confirm && form.password === form.confirm &&
    passwordValid(form.password) && !!form.terms;

  const therapistReady =
    !!form.name && !!form.email && !!form.specialty && !!form.license &&
    !!form.password && !!form.confirm && form.password === form.confirm &&
    passwordValid(form.password) && !!form.terms &&
    docsReady(docs.license) && docsReady(docs.cert);

  const handlePatientSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email || !form.phone || !form.city || !form.password) return setError(t("auth.errorFillAll"));
    if (form.password !== form.confirm) return setError(t("auth.errorPasswordsDontMatch"));
    if (!form.terms) return setError(t("auth.errorAcceptTerms"));
    const name = form.name.trim();
    setSending(true);
    try {
      const res = await sendOtp(form.email, name);
      setResendAfter(res.resend_after);
      setOtpStep("input");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("auth.errorSendOtpFailed"));
    } finally {
      setSending(false);
    }
  };

  const handleTherapistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email || !form.specialty || !form.license || !form.password) return setError(t("auth.errorFillRequired"));
    if (form.password !== form.confirm) return setError(t("auth.errorPasswordsDontMatch"));
    if (!form.terms) return setError(t("auth.errorAcceptTerms"));
    if (!docsReady(docs.license) || !docsReady(docs.cert)) return setError(t("auth.errorDocumentsRequired"));
    const name = form.name.trim();
    setSending(true);
    try {
      const res = await sendOtp(form.email, name);
      setResendAfter(res.resend_after);
      setOtpStep("input");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("auth.errorSendOtpFailed"));
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtpAndSignup = async () => {
    if (otpStep === "verifying") return;
    setError(null);
    if (!otpCode || otpCode.length !== 6) return setError(t("auth.errorInvalidOtp"));
    setOtpStep("verifying");
    const name = form.name.trim();
    try {
      const verified = await verifyOtp(form.email, otpCode);
      if (!verified.verified) {
        setError(t("auth.errorOtpFailed"));
        setOtpStep("input");
        return;
      }
      if (signupRole === "patient") {
        await signupPatient({ name, email: form.email, password: form.password, phone: form.phone, city: form.city });
        setSubmitted("patient-ok");
      } else {
        const documents = ["license", "cert"].flatMap((key) =>
          (docs[key] ?? [])
            .filter((d) => d.status === "done" && d.url)
            .map((d) => ({
              documentType: key === "license" ? "NMC license" : "Certification",
              url: d.url as string,
              fileName: d.fileName ?? d.file.name,
              fileSize: d.fileSize ?? d.file.size,
            })),
        );
        await signupTherapist({
          name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          city: form.city,
          specialty: form.specialty,
          gender: form.gender,
          license: form.license,
          experience: form.exp ? Number(form.exp) : undefined,
          fee: form.fee ? Number(form.fee) : undefined,
          documents,
        });
        setSubmitted("therapist-ok");
      }
    } catch (e) {
      const status = (e as { status?: number } | null)?.status;
      setError(
        status === 409
          ? t("auth.errorAlreadyRegistered")
          : e instanceof Error
            ? e.message
            : t("auth.errorOtpFailed"),
      );
      setOtpStep("input");
    }
  };

  const handleSuccessCta = (role: Role) => {
    onSuccess(role);
  };

  const handleResendOtp = useCallback(async () => {
    if (resendAfter > 0) return;
    setError(null);
    const name = form.name.trim();
    try {
      const res = await sendOtp(form.email, name);
      setResendAfter(res.resend_after);
      setOtpCode("");
      toast.success(t("auth.otpSentTo"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("auth.errorSendOtpFailed"));
    }
  }, [resendAfter, form.email, form.name, t]);

  if (submitted === "patient-ok") {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-mint border-2 border-carbon-soft grid place-items-center mx-auto mb-4 text-3xl text-carbon">✓</div>
        <h2 className="text-2xl font-display font-extrabold mb-2">{t("auth.youAreAllSet")}</h2>
        <p className="text-text-light text-sm mb-6">{t("auth.patientSuccessSub")}</p>
        <button onClick={() => handleSuccessCta("patient")} className="btn-volt">{t("auth.goToDashboard")}</button>
      </div>
    );
  }

  if (submitted === "therapist-ok") {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-volt border-2 border-carbon-soft grid place-items-center mx-auto mb-4 text-3xl text-carbon">✓</div>
        <h2 className="text-2xl font-display font-extrabold mb-2">{t("auth.applicationReceived")}</h2>
        <p className="text-text-light text-sm mb-6">{t("auth.therapistSuccessSub")}</p>
        <button onClick={() => handleSuccessCta("therapist")} className="btn-volt">{t("auth.goToLogin")}</button>
      </div>
    );
  }

  if (otpStep) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => { setOtpStep(null); setOtpCode(""); setResendAfter(0); setError(null); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }} className="text-xs text-secondary flex items-center gap-1 cursor-pointer">
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
              onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "")); setError(null); }}
              placeholder="000000"
              className="input-neo !py-3 text-center text-2xl tracking-[0.5em] !font-mono"
            />
            <InlineError message={error} />
            <button
              onClick={handleVerifyOtpAndSignup}
              disabled={otpCode.length !== 6}
              className="btn-volt w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("auth.verifyAndContinue")}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendAfter > 0 || sending}
              className="w-full text-center text-sm text-moss font-semibold hover:underline disabled:text-text-light disabled:no-underline disabled:cursor-not-allowed"
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
        <p className="label-ink mb-2">{t("common.getStarted")}</p>
        <h2 className="text-3xl font-display font-extrabold uppercase tracking-tighter mb-1">{t("auth.createAccount")}</h2>
        <p className="text-text-light text-sm mb-6">{t("auth.signupSubtitle")}</p>

        <div className="grid gap-4">
          <button onClick={() => setSignupRole("patient")} className="w-full text-left p-5 rounded-xl border-2 border-carbon-soft bg-paper-bright shadow-[1px_1px_0_var(--color-carbon-soft)] hover:shadow-[1px_1px_0_var(--color-carbon-soft)] hover:-translate-y-px transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-volt border-2 border-carbon-soft grid place-items-center shrink-0"><HeartPulse className="text-carbon" size={28} /></div>
            <div className="min-w-0">
              <div className="font-bold text-text">{t("auth.iAmPatient")}</div>
              <div className="text-sm text-text-light">{t("auth.patientDesc")}</div>
            </div>
          </button>
          <button onClick={() => setSignupRole("therapist")} className="w-full text-left p-5 rounded-xl border-2 border-carbon-soft bg-paper-bright shadow-[1px_1px_0_var(--color-carbon-soft)] hover:shadow-[1px_1px_0_var(--color-carbon-soft)] hover:-translate-y-px transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-mint border-2 border-carbon-soft grid place-items-center shrink-0"><Stethoscope className="text-carbon" size={28} /></div>
            <div className="min-w-0">
              <div className="font-bold text-text">{t("auth.iAmTherapist")}</div>
              <div className="text-sm text-text-light">{t("auth.therapistDesc")}</div>
            </div>
          </button>
        </div>

        <p className="text-sm text-text-light text-center mt-6">
          {t("auth.alreadyHaveAccount")}{" "}
          <a href="/login" className="text-moss font-bold underline underline-offset-2 decoration-2 hover:bg-volt transition-colors">{t("auth.loginBtn")}</a>
        </p>
      </>
    );
  }

  if (signupRole === "patient") {
    return (
      <form onSubmit={handlePatientSignup} className="space-y-3">
        <button type="button" onClick={() => { setSignupRole(null); setError(null); }} className="text-xs text-secondary flex items-center gap-1 cursor-pointer">
          <ArrowLeft size={12} /> {t("auth.backBtn")}
        </button>
        <h2 className="text-2xl font-display">{t("auth.patientSignup")}</h2>
        <Field label={t("auth.labelFullName")} value={form.name ?? ""} onChange={(v) => set("name", v)} placeholder={t("auth.placeholderFullName")} />
        <Field label={t("auth.labelEmail")} type="email" value={form.email ?? ""} onChange={(v) => set("email", v)} placeholder={t("auth.placeholderEmail")} />
        <Field label={t("auth.labelPhone")} value={form.phone ?? ""} onChange={(v) => set("phone", v)} placeholder={t("auth.placeholderPhone")} />
        <SelectField label={t("auth.labelCity")} value={form.city ?? ""} onChange={(v) => set("city", v)} options={CITIES as unknown as string[]} />
        <div>
          <label className="label-ink mb-1.5 block">{t("auth.labelPassword")}</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={form.password ?? ""}
              onChange={(e) => set("password", e.target.value)}
              placeholder={t("auth.placeholderPassword")}
              className="input-neo !py-2.5 pr-11"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="label-ink mb-1.5 block">{t("auth.labelConfirmPassword")}</label>
          <div className="relative">
            <input
              type={showConfirmPw ? "text" : "password"}
              value={form.confirm ?? ""}
              onChange={(e) => set("confirm", e.target.value)}
              placeholder={t("auth.placeholderConfirm")}
              className="input-neo !py-2.5 pr-11"
            />
            <button type="button" onClick={() => setShowConfirmPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
              {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.confirm && form.password !== form.confirm && (
            <p className="text-xs text-danger mt-1">{t("auth.passwordRuleNoMatch")}</p>
          )}
        </div>
        <PasswordRules password={form.password ?? ""} />
        <label className="flex gap-2 items-start text-xs text-text-light">
          <input type="checkbox" checked={form.terms === "1"} onChange={(e) => set("terms", e.target.checked ? "1" : "")} className="mt-0.5" />
          {t("auth.labelTermsPatient")}
        </label>
        <InlineError message={error} />
        <button type="submit" disabled={!patientReady || sending} className="btn-volt w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {sending && <Loader2 className="animate-spin" size={16} />}
          {sending ? t("auth.sendingCode") : t("auth.createPatientAccount")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleTherapistSignup} className="space-y-3">
      {isSignUpPage && <>
        <button type="button" onClick={() => { setSignupRole(null); setError(null); }} className="text-xs text-secondary flex items-center gap-1 cursor-pointer">
        <ArrowLeft size={12} /> {t("auth.backBtn")}
      </button>
        <h2 className="text-2xl font-display">{t("auth.therapistApplication")}</h2>
      </>}
      <Field label={t("auth.labelFullName")} value={form.name ?? ""} onChange={(v) => set("name", v)} placeholder={t("auth.placeholderFullName")} />
      <Field label={t("auth.labelEmail")} type="email" value={form.email ?? ""} onChange={(v) => set("email", v)} placeholder={t("auth.placeholderEmail")} />
      <Field label={t("auth.labelPhone")} value={form.phone ?? ""} onChange={(v) => set("phone", v)} placeholder={t("auth.placeholderPhone")} />
      <SelectField label={t("auth.labelSpecialty")} value={form.specialty ?? ""} onChange={(v) => set("specialty", v)} options={SPECIALTIES as unknown as string[]} />
      <Field label={t("auth.labelFee")} type="number" value={form.fee ?? ""} onChange={(v) => set("fee", v)} placeholder={t("auth.placeholderFee")} />
      <div className="grid md:grid-cols-2 gap-3">
        <Field label={t("auth.labelLicense")} value={form.license ?? ""} onChange={(v) => set("license", v)} placeholder={t("auth.placeholderLicense")} />
        <Field label={t("auth.labelExperience")} type="number" value={form.exp ?? ""} onChange={(v) => set("exp", v)} placeholder={t("auth.placeholderExperience")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SelectField label={t("auth.labelCity")} value={form.city ?? ""} onChange={(v) => set("city", v)} options={CITIES as unknown as string[]} />
        <SelectField label={t("auth.labelGender")} value={form.gender ?? ""} onChange={(v) => set("gender", v)} options={["Male", "Female", "Other"]} />
      </div>
      {/*Password grids*/}
      <div>
        <label className="label-ink mb-1.5 block">{t("auth.labelPassword")}</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={form.password ?? ""}
            onChange={(e) => set("password", e.target.value)}
            placeholder={t("auth.placeholderPassword")}
            className="input-neo !py-2.5 pr-11"
          />
          <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div>
        <label className="label-ink mb-1.5 block">{t("auth.labelConfirmPassword")}</label>
        <div className="relative">
          <input
            type={showConfirmPw ? "text" : "password"}
            value={form.confirm ?? ""}
            onChange={(e) => set("confirm", e.target.value)}
            placeholder={t("auth.placeholderConfirm")}
            className="input-neo !py-2.5 pr-11"
          />
          <button type="button" onClick={() => setShowConfirmPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-light">
            {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {form.confirm && form.password !== form.confirm && (
          <p className="text-xs text-danger mt-1">{t("auth.passwordRuleNoMatch")}</p>
        )}
      </div>
      <PasswordRules password={form.password ?? ""} />
      {/*Password grids*/}
      <DocumentUploader
        label={t("auth.labelUploadLicense")}
        documentType="NMC license"
        docs={docs.license}
        onChange={(updater) => setDocs((prev) => ({ ...prev, license: typeof updater === "function" ? updater(prev.license) : updater }))}
        required
        maxFiles={3}
      />
      <DocumentUploader
        label={t("auth.labelUploadCert")}
        documentType="Certification"
        docs={docs.cert}
        onChange={(updater) => setDocs((prev) => ({ ...prev, cert: typeof updater === "function" ? updater(prev.cert) : updater }))}
        required
        maxFiles={3}
      />

      <label className="flex gap-2 items-start text-xs text-text-light">
        <input type="checkbox" checked={form.terms === "1"} onChange={(e) => set("terms", e.target.checked ? "1" : "")} className="mt-0.5" />
        {t("auth.labelTermsTherapist")}
      </label>
      <InlineError message={error} />
      <button type="submit" disabled={!therapistReady || sending} className="btn-volt w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {sending && <Loader2 className="animate-spin" size={16} />}
        {sending ? t("auth.sendingCode") : t("auth.submitApplication")}
      </button>
    </form>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }: { label: React.ReactNode; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="label-ink mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="input-neo !py-2.5"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  const { t } = useLang();
  return (
    <div>
      <label className="label-ink mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-neo !py-2.5"
      >
        <option value="">{t("auth.selectOption")}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
