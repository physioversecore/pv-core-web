"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff, Stethoscope, HeartPulse } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";
import { CITIES, SPECIALTIES } from "@/lib/constants";
import { toast } from "sonner";

type Mode = "login" | "signup";
type SignupRole = "patient" | "therapist" | null;

export function AuthModal({
  open,
  mode: initialMode,
  onClose,
}: {
  open: boolean;
  mode: Mode;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loginRole, setLoginRole] = useState<Role>("patient");
  const [signupRole, setSignupRole] = useState<SignupRole>(null);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const { login, signupPatient, signupTherapist } = useAuth();
  const router = useRouter();
  const [submitted, setSubmitted] = useState<null | "patient-ok" | "therapist-ok">(null);

  if (!open) return null;

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Email and password required");
    try {
      const u = await login(form.email, form.password, loginRole);
      toast.success(`Welcome, ${u.name}`);
      onClose();
      router.push(loginRole === "patient" ? "/patient" : loginRole === "therapist" ? "/therapist" : "/admin");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Login failed");
    }
  };

  const handlePatientSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first || !form.email || !form.phone || !form.city || !form.password) return toast.error("Please fill all fields");
    if (form.password !== form.confirm) return toast.error("Passwords don't match");
    if (!form.terms) return toast.error("Please accept terms");
    try {
      await signupPatient({ name: `${form.first} ${form.last ?? ""}`.trim(), email: form.email, password: form.password, phone: form.phone, city: form.city });
      setSubmitted("patient-ok");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Signup failed");
    }
  };

  const handleTherapistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first || !form.email || !form.specialty || !form.license) return toast.error("Please fill required fields");
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
      toast.error(e instanceof Error ? e.message : "Signup failed");
    }
  };

  const onSuccessGo = (role: Role) => {
    onClose();
    router.push(role === "patient" ? "/patient" : "/therapist");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-text/60 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-background rounded-3xl border border-border shadow-2xl p-7 sm:p-9">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-surface" aria-label="Close">
          <X size={18} />
        </button>

        {submitted === "patient-ok" && (
          <SuccessScreen
            title="You're all set"
            sub="Your patient account is ready. Let's find you a therapist."
            cta="Go to dashboard"
            onCta={() => onSuccessGo("patient")}
          />
        )}
        {submitted === "therapist-ok" && (
          <SuccessScreen
            title="Application received"
            sub="Your application is under review. We'll notify you within 24 hours. You can explore your dashboard meanwhile."
            cta="Open dashboard"
            onCta={() => onSuccessGo("therapist")}
          />
        )}

        {!submitted && mode === "login" && (
          <>
            <p className="eyebrow mb-2">Account</p>
            <h2 className="text-3xl font-display mb-1">Welcome back</h2>
            <p className="text-text-light text-sm mb-5">Log in to continue your recovery journey.</p>

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
              <Field label="Email" type="email" value={form.email ?? ""} onChange={(v) => set("email", v)} placeholder="you@example.com" />
              <div>
                <label className="text-xs font-medium text-text-light">Password</label>
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
                  <button type="button" className="text-xs text-secondary hover:underline">Forgot password?</button>
                </div>
              </div>
              <button type="submit" className="btn-pine w-full">Log in</button>
            </form>

            <p className="text-sm text-text-light text-center mt-5">
              Don&apos;t have an account?{" "}
              <button onClick={() => setMode("signup")} className="text-secondary font-semibold hover:underline">Sign up</button>
            </p>
          </>
        )}

        {!submitted && mode === "signup" && !signupRole && (
          <>
            <p className="eyebrow mb-2">Get started</p>
            <h2 className="text-3xl font-display mb-1">Create your account</h2>
            <p className="text-text-light text-sm mb-6">Pick how you&apos;d like to use Sahayatri Physio.</p>

            <div className="grid gap-3">
              <RoleCard
                icon={<HeartPulse className="text-secondary" size={28} />}
                title="I'm a Patient"
                sub="Book physiotherapists for home visits"
                onClick={() => setSignupRole("patient")}
              />
              <RoleCard
                icon={<Stethoscope className="text-secondary" size={28} />}
                title="I'm a Physiotherapist"
                sub="Offer sessions and grow your practice"
                onClick={() => setSignupRole("therapist")}
              />
            </div>

            <p className="text-sm text-text-light text-center mt-6">
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-secondary font-semibold hover:underline">Log in</button>
            </p>
          </>
        )}

        {!submitted && mode === "signup" && signupRole === "patient" && (
          <form onSubmit={handlePatientSignup} className="space-y-3">
            <button type="button" onClick={() => setSignupRole(null)} className="text-xs text-secondary">← Back</button>
            <h2 className="text-2xl font-display">Patient sign up</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" value={form.first ?? ""} onChange={(v) => set("first", v)} />
              <Field label="Last name" value={form.last ?? ""} onChange={(v) => set("last", v)} />
            </div>
            <Field label="Email" type="email" value={form.email ?? ""} onChange={(v) => set("email", v)} />
            <Field label="Phone" value={form.phone ?? ""} onChange={(v) => set("phone", v)} placeholder="98XXXXXXXX" />
            <SelectField label="City" value={form.city ?? ""} onChange={(v) => set("city", v)} options={CITIES as unknown as string[]} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Password" type="password" value={form.password ?? ""} onChange={(v) => set("password", v)} />
              <Field label="Confirm" type="password" value={form.confirm ?? ""} onChange={(v) => set("confirm", v)} />
            </div>
            <label className="flex gap-2 items-start text-xs text-text-light">
              <input type="checkbox" onChange={(e) => set("terms", e.target.checked ? "1" : "")} className="mt-0.5" />
              I agree to the Terms and Privacy Policy.
            </label>
            <button type="submit" className="btn-pine w-full">Create patient account</button>
          </form>
        )}

        {!submitted && mode === "signup" && signupRole === "therapist" && (
          <form onSubmit={handleTherapistSignup} className="space-y-3">
            <button type="button" onClick={() => setSignupRole(null)} className="text-xs text-secondary">← Back</button>
            <h2 className="text-2xl font-display">Therapist application</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" value={form.first ?? ""} onChange={(v) => set("first", v)} />
              <Field label="Last name" value={form.last ?? ""} onChange={(v) => set("last", v)} />
            </div>
            <Field label="Email" type="email" value={form.email ?? ""} onChange={(v) => set("email", v)} />
            <Field label="Phone" value={form.phone ?? ""} onChange={(v) => set("phone", v)} />
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="City" value={form.city ?? ""} onChange={(v) => set("city", v)} options={CITIES as unknown as string[]} />
              <SelectField label="Specialty" value={form.specialty ?? ""} onChange={(v) => set("specialty", v)} options={SPECIALTIES as unknown as string[]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="NMC License #" value={form.license ?? ""} onChange={(v) => set("license", v)} />
              <Field label="Years of experience" type="number" value={form.exp ?? ""} onChange={(v) => set("exp", v)} />
            </div>
            <Field label="Consultation fee (NPR)" type="number" value={form.fee ?? ""} onChange={(v) => set("fee", v)} placeholder="1200" />

            <UploadBox label="Upload NMC license (PDF/JPG)" onFile={() => set("licenseFile", "uploaded")} uploaded={form.licenseFile === "uploaded"} />
            <UploadBox label="Upload certification document" onFile={() => set("certFile", "uploaded")} uploaded={form.certFile === "uploaded"} />

            <label className="flex gap-2 items-start text-xs text-text-light">
              <input type="checkbox" onChange={(e) => set("terms", e.target.checked ? "1" : "")} className="mt-0.5" />
              I confirm my credentials are accurate and accept the Terms.
            </label>
            <button type="submit" className="btn-pine w-full">Submit application</button>
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
  return (
    <div>
      <label className="text-xs font-medium text-text-light">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Select…</option>
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
  return (
    <button type="button" onClick={onFile} className={`w-full p-3 rounded-xl border-2 border-dashed text-sm ${uploaded ? "border-secondary bg-surface text-secondary" : "border-border text-text-light hover:border-secondary"}`}>
      {uploaded ? "✓ Document uploaded" : `📎 ${label}`}
    </button>
  );
}
function SuccessScreen({ title, sub, cta, onCta }: { title: string; sub: string; cta: string; onCta: () => void }) {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 rounded-full bg-surface grid place-items-center mx-auto mb-4 text-3xl">✓</div>
      <h2 className="text-2xl font-display mb-2">{title}</h2>
      <p className="text-text-light text-sm mb-6">{sub}</p>
      <button onClick={onCta} className="btn-pine">{cta}</button>
    </div>
  );
}
