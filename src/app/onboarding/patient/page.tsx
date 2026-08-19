"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HeartPulse, Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";
import { completeOnboarding, saveOnboardingProgress, getOnboardingStatus } from "@/services/api/patients";
import { StepProgress } from "@/components/auth/StepProgress";
import { CITIES } from "@/constants";

type Step = "personal" | "contact" | "health" | "emergency" | "family" | "review";

const STEPS: { key: Step; label: string }[] = [
  { key: "personal", label: "Personal" },
  { key: "contact", label: "Contact" },
  { key: "health", label: "Health" },
  { key: "emergency", label: "Emergency" },
  { key: "family", label: "Family" },
  { key: "review", label: "Review" },
];

const inputClass =
  "h-11 w-full rounded-[7px] border border-[#d8dadd] px-3.5 text-[14px] text-text placeholder:text-[14px] placeholder:text-text-light/60 transition-colors focus:border-voltage-lime focus:outline-none focus:ring-4 focus:ring-voltage-lime/15";

const labelClass = "block text-[13px] font-medium text-[#555] mb-2";

export default function PatientOnboardingPage() {
  const { t } = useLang();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("personal");
  const [submitting, setSubmitting] = useState(false);
  const [loadingState, setLoadingState] = useState(true);

  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    city: user?.city ?? "",
    address: "",
    dob: "",
    gender: "",
    condition: "",
    medicalHistory: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
  });

  const [familyMembers, setFamilyMembers] = useState<Array<{
    name: string;
    relationship: string;
    dob: string;
    phone: string;
    condition: string;
  }>>([]);

  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;
    if (!loading && !user) {
      redirected.current = true;
      router.replace("/access");
    }
  }, [loading, user, router]);

  // Load onboarding status and resume from saved step
  useEffect(() => {
    if (!user) return;

    async function loadStatus() {
      try {
        const status = await getOnboardingStatus();
        if (status.completed) {
          router.replace("/patient");
          return;
        }
        if (status.step) {
          const stepIdx = STEPS.findIndex((s) => s.key === status.step);
          if (stepIdx >= 0) {
            setStep(status.step as Step);
          }
        }
      } catch {
        // Continue with default step
      } finally {
        setLoadingState(false);
      }
    }

    loadStatus();
  }, [user, router]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const currentIdx = STEPS.findIndex((s) => s.key === step);

  const goNext = async () => {
    // Save progress before moving to next step
    try {
      await saveOnboardingProgress(step, form);
    } catch {
      // Silent fail - progress will be lost on refresh but we continue
    }

    if (currentIdx < STEPS.length - 1) {
      setStep(STEPS[currentIdx + 1].key);
    }
  };

  const goBack = () => {
    if (currentIdx > 0) {
      setStep(STEPS[currentIdx - 1].key);
    }
  };

  const handleSkip = async () => {
    // Skip optional steps (health, emergency, family)
    if (currentIdx < STEPS.length - 1) {
      try {
        await saveOnboardingProgress(step, form);
      } catch {
        // Silent fail
      }
      setStep(STEPS[currentIdx + 1].key);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await completeOnboarding(form);
      toast.success("Profile completed!");
      router.replace("/patient");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || loadingState) return null;

  return (
    <div className="auth-bg flex min-h-[100svh] w-full flex-col items-center px-5">
      <div className="w-full pt-[9vh] max-w-[480px]">
        <Link href="/" aria-label={t("header.brand")} className="block w-fit mx-auto">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-voltage-lime text-carbon-ink transition-transform duration-150 hover:-translate-y-0.5">
            <HeartPulse size={22} strokeWidth={2.25} />
          </span>
        </Link>

        <h1 className="mt-7 text-[24px] font-semibold leading-tight tracking-[-0.01em] text-text text-center">
          Complete your profile
        </h1>
        <p className="mt-2 text-[14px] leading-[1.5] text-text-light text-center">
          Help us personalize your recovery experience.
        </p>

        <div className="mt-6">
          <StepProgress steps={STEPS} current={currentIdx} />
        </div>

        <div className="mt-2">
          {step === "personal" && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                  className={`${inputClass} bg-ash/70 text-text-light cursor-not-allowed `}
                />
              </div>
              <div>
                <label className={labelClass}>Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Date of birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => set("dob", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === "contact" && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Phone number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="98XXXXXXXX"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <select
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="House number, street, area"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {step === "health" && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Current condition or concern</label>
                <input
                  type="text"
                  value={form.condition}
                  onChange={(e) => set("condition", e.target.value)}
                  placeholder="e.g. Knee pain, post-surgery recovery"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Medical history</label>
                <textarea
                  value={form.medicalHistory}
                  onChange={(e) => set("medicalHistory", e.target.value)}
                  placeholder="Surgeries, chronic conditions, allergies, medications..."
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          )}

          {step === "emergency" && (
            <div className="space-y-4">
              <p className="text-[13px] text-text-light">
                Emergency contact details for your safety.
              </p>
              <div>
                <label className={labelClass}>Contact name</label>
                <input
                  type="text"
                  value={form.emergencyName}
                  onChange={(e) => set("emergencyName", e.target.value)}
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Relationship</label>
                  <select
                    value={form.emergencyRelation}
                    onChange={(e) => set("emergencyRelation", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="tel"
                    value={form.emergencyPhone}
                    onChange={(e) => set("emergencyPhone", e.target.value)}
                    placeholder="98XXXXXXXX"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {step === "family" && (
            <div className="space-y-4">
              <p className="text-[13px] text-text-light">
                Add family members who also need physiotherapy. You can skip this and add them later.
              </p>
              {familyMembers.map((fm, i) => (
                <div key={i} className="rounded-lg border border-[#d8dadd] bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-text">Family member {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => setFamilyMembers((prev) => prev.filter((_, j) => j !== i))}
                      className="text-[12px] text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Name</label>
                      <input
                        type="text"
                        value={fm.name}
                        onChange={(e) => {
                          const next = [...familyMembers];
                          next[i] = { ...next[i], name: e.target.value };
                          setFamilyMembers(next);
                        }}
                        placeholder="Name"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Relationship</label>
                      <select
                        value={fm.relationship}
                        onChange={(e) => {
                          const next = [...familyMembers];
                          next[i] = { ...next[i], relationship: e.target.value };
                          setFamilyMembers(next);
                        }}
                        className={inputClass}
                      >
                        <option value="">Select</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Child">Child</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Condition (optional)</label>
                    <input
                      type="text"
                      value={fm.condition}
                      onChange={(e) => {
                        const next = [...familyMembers];
                        next[i] = { ...next[i], condition: e.target.value };
                        setFamilyMembers(next);
                      }}
                      placeholder="What they need help with"
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFamilyMembers((prev) => [...prev, { name: "", relationship: "", dob: "", phone: "", condition: "" }])}
                className="w-full h-11 rounded-[7px] border-2 border-dashed border-[#d8dadd] text-[13px] font-medium text-text-light hover:border-voltage-lime hover:text-text transition-colors"
              >
                + Add family member
              </button>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#d8dadd] bg-white p-4 space-y-3">
                <h3 className="text-[13px] font-semibold text-text">Personal Information</h3>
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <div><span className="text-text-light">Name:</span> {form.name || "—"}</div>
                  <div><span className="text-text-light">DOB:</span> {form.dob || "—"}</div>
                  <div><span className="text-text-light">Gender:</span> {form.gender || "—"}</div>
                  <div><span className="text-text-light">Phone:</span> {form.phone || "—"}</div>
                </div>
              </div>
              <div className="rounded-lg border border-[#d8dadd] bg-white p-4 space-y-3">
                <h3 className="text-[13px] font-semibold text-text">Contact & Address</h3>
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <div><span className="text-text-light">City:</span> {form.city || "—"}</div>
                  <div><span className="text-text-light">Address:</span> {form.address || "—"}</div>
                </div>
              </div>
              <div className="rounded-lg border border-[#d8dadd] bg-white p-4 space-y-3">
                <h3 className="text-[13px] font-semibold text-text">Health</h3>
                <div className="text-[13px]">
                  <div><span className="text-text-light">Condition:</span> {form.condition || "—"}</div>
                  <div className="mt-1"><span className="text-text-light">History:</span> {form.medicalHistory || "—"}</div>
                </div>
              </div>
              {(form.emergencyName || form.emergencyPhone) && (
                <div className="rounded-lg border border-[#d8dadd] bg-white p-4 space-y-3">
                  <h3 className="text-[13px] font-semibold text-text">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-2 text-[13px]">
                    <div><span className="text-text-light">Name:</span> {form.emergencyName || "—"}</div>
                    <div><span className="text-text-light">Relation:</span> {form.emergencyRelation || "—"}</div>
                    <div><span className="text-text-light">Phone:</span> {form.emergencyPhone || "—"}</div>
                  </div>
                </div>
              )}
              {familyMembers.length > 0 && (
                <div className="rounded-lg border border-[#d8dadd] bg-white p-4 space-y-3">
                  <h3 className="text-[13px] font-semibold text-text">Family Members ({familyMembers.length})</h3>
                  {familyMembers.map((fm, i) => (
                    <div key={i} className="text-[13px]">
                      <span className="font-medium">{fm.name || `Member ${i + 1}`}</span>
                      {fm.relationship && <span className="text-text-light"> — {fm.relationship}</span>}
                      {fm.condition && <div className="text-text-light text-[12px]">{fm.condition}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          {currentIdx > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="h-11 px-5 rounded-[7px] border border-[#d8dadd] bg-white text-[14px] font-medium text-text hover:bg-neutral-50 transition-colors"
            >
              <ArrowLeft size={16} className="inline mr-1" />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={step === "review" ? handleSubmit : goNext}
            disabled={submitting}
            className="flex-1 h-11 rounded-[7px] bg-mid-abyss px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#0a3a3e] active:bg-[#031a1d] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : step === "review" ? (
              <>
                <Check size={16} />
                Complete setup
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Skip button for optional steps */}
        {(step === "health" || step === "emergency" || step === "family") && (
          <button
            type="button"
            onClick={handleSkip}
            className="mt-4 w-full text-center text-[13px] text-text-light hover:text-text transition-colors"
          >
            Skip for now
          </button>
        )}

        <p className="mt-4 text-center text-[12px] text-text-light/60">
          You can skip this and complete your profile later from Settings.
        </p>
      </div>
    </div>
  );
}
