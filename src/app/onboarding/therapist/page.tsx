"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HeartPulse, Clock, AlertCircle, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";
import {
  getApplicationStatus,
  getApplicationSections,
  updateApplication,
  type ApplicationStatusData,
  type ApplicationSectionsData,
} from "@/services/api/therapists";
import { StepProgress } from "@/components/auth/StepProgress";
import { DocumentUploader, type UploadedDoc } from "@/components/auth/DocumentUploader";
import { CITIES, SPECIALTIES } from "@/constants";

type Step = "personal" | "professional" | "documents" | "review";

const STEPS: { key: Step; label: string }[] = [
  { key: "personal", label: "Personal" },
  { key: "professional", label: "Professional" },
  { key: "documents", label: "Documents" },
  { key: "review", label: "Review" },
];

const inputClass =
  "h-11 w-full rounded-[7px] border border-[#d8dadd] bg-white px-3.5 text-[14px] text-text placeholder:text-[14px] placeholder:text-text-light/60 transition-colors focus:border-voltage-lime focus:outline-none focus:ring-4 focus:ring-voltage-lime/15";

const inputDisabledClass =
  "h-11 w-full rounded-[7px] border border-[#e5e5e5] bg-[#f5f5f5] px-3.5 text-[14px] text-text-light cursor-not-allowed";

const labelClass = "block text-[13px] font-medium text-[#555] mb-2";

const primaryBtnClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[7px] bg-mid-abyss px-7 text-[14px] font-semibold text-white transition-colors hover:bg-[#0a3a3e] active:bg-[#031a1d] disabled:cursor-not-allowed disabled:opacity-50";

const secondaryBtnClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#d8dadd] bg-white px-7 text-[14px] font-semibold text-text transition-colors hover:bg-neutral-50 active:bg-neutral-100";

const requiredMark = <span className="text-red-500 ml-0.5">*</span>;

function toUploadedDocs(backendDocs: ApplicationSectionsData["documents"]): UploadedDoc[] {
  if (!backendDocs || !Array.isArray(backendDocs)) return [];
  return backendDocs.map((d) => ({
    id: d.id || `backend-${d.documentUrl}`,
    documentType: d.documentType || "",
    file: new File([], d.fileName || "document"),
    status: "done" as const,
    progress: 100,
    url: d.documentUrl,
    fileName: d.fileName,
  }));
}

export default function TherapistOnboardingPage() {
  const { t } = useLang();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatusData | null>(null);
  const [loadingState, setLoadingState] = useState(true);
  const [step, setStep] = useState<Step>("personal");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    gender: "",
    specialty: "",
    experience: "",
    fee: "",
    bio: "",
    license: "",
  });

  const [docs, setDocs] = useState<Record<string, UploadedDoc[]>>({
    license: [],
    cert: [],
  });

  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;
    if (!loading && !user) {
      redirected.current = true;
      router.replace("/access");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    setForm((f) => ({ ...f, email: user.email || "" }));

    async function loadStatus() {
      try {
        const [status, sections] = await Promise.all([
          getApplicationStatus(),
          getApplicationSections(),
        ]);

        setApplicationStatus(status);

        if (status.status === "APPROVED") {
          router.replace("/therapist");
          return;
        }

        if (status.status === "REJECTED") {
          setLoadingState(false);
          return;
        }

        if (sections.personal) {
          const nameParts = sections.personal.name?.split(" ") || [];
          setForm((f) => ({
            ...f,
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            phone: sections.personal.phone || "",
            city: sections.personal.city || "",
            gender: sections.personal.gender || "",
            specialty: sections.professional?.specialty || "",
            experience: sections.professional?.experience?.toString() || "",
            fee: sections.professional?.fee?.toString() || "",
            bio: sections.professional?.bio || "",
            license: sections.professional?.license || "",
          }));
        }

        if (sections.documents && sections.documents.length > 0) {
          const backendDocs = toUploadedDocs(sections.documents);
          const licenseDocs = backendDocs.filter(
            (d) => d.documentType === "NMC license" || d.documentType === "license"
          );
          const certDocs = backendDocs.filter(
            (d) => d.documentType === "Certification" || d.documentType === "cert"
          );
          if (licenseDocs.length > 0 || certDocs.length > 0) {
            setDocs((prev) => ({
              license: licenseDocs.length > 0 ? licenseDocs : prev.license,
              cert: certDocs.length > 0 ? certDocs : prev.cert,
            }));
          }
        }
      } catch {
        // Continue with empty form
      } finally {
        setLoadingState(false);
      }
    }

    loadStatus();
  }, [user, router]);

  const currentIdx = STEPS.findIndex((s) => s.key === step);

  const goNext = () => {
    if (currentIdx < STEPS.length - 1) {
      setStep(STEPS[currentIdx + 1].key);
    }
  };

  const goBack = () => {
    if (currentIdx > 0) {
      setStep(STEPS[currentIdx - 1].key);
    }
  };

  const isStepValid = (() => {
    switch (step) {
      case "personal":
        return (
          form.firstName.trim().length > 0 &&
          form.phone.trim().length > 0 &&
          form.city.trim().length > 0 &&
          form.gender.trim().length > 0
        );
      case "professional":
        return (
          form.specialty.trim().length > 0 &&
          form.experience.trim().length > 0 &&
          form.fee.trim().length > 0 &&
          form.license.trim().length > 0
        );
      case "documents":
        return docs.license.length > 0;
      case "review":
        return true;
      default:
        return false;
    }
  })();

  const handleSubmit = async () => {
    setError(null);
    if (
      !form.firstName.trim() ||
      !form.phone.trim() ||
      !form.city.trim() ||
      !form.gender.trim() ||
      !form.specialty.trim() ||
      !form.experience.trim() ||
      !form.fee.trim() ||
      !form.license.trim() ||
      docs.license.length === 0
    ) {
      setError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await updateApplication({
        personal: {
          name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
          phone: form.phone,
          city: form.city,
          gender: form.gender,
        },
        professional: {
          specialty: form.specialty,
          experience: Number(form.experience),
          fee: Number(form.fee),
          license: form.license,
          bio: form.bio || undefined,
        },
      });

      toast.success("Application submitted! We'll review it within 24 hours.");
      setApplicationStatus({ status: "SUBMITTED", feedback: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || loadingState) return null;

  if (applicationStatus?.status === "REJECTED") {
    return (
      <div className="auth-bg flex min-h-[100svh] w-full flex-col items-center px-5">
        <div className="w-full pt-[9vh] max-w-[420px]">
          <Link href="/" aria-label={t("header.brand")} className="block w-fit mx-auto">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-voltage-lime text-carbon-ink transition-transform duration-150 hover:-translate-y-0.5">
              <HeartPulse size={22} strokeWidth={2.25} />
            </span>
          </Link>
          <div className="mt-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-5">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.01em] text-text">
              Application Not Approved
            </h1>
            <p className="mt-3 text-[14px] leading-[1.5] text-text-light max-w-[340px] mx-auto">
              Your application was not approved. Please contact support for more information.
            </p>
            <Link
              href="/access"
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[7px] border border-[#d8dadd] bg-white px-7 text-[14px] font-semibold text-text transition-colors hover:bg-neutral-50"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (applicationStatus?.status === "SUBMITTED") {
    return (
      <div className="auth-bg flex min-h-[100svh] w-full flex-col items-center px-5">
        <div className="w-full pt-[9vh] max-w-[420px]">
          <Link href="/" aria-label={t("header.brand")} className="block w-fit mx-auto">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-voltage-lime text-carbon-ink transition-transform duration-150 hover:-translate-y-0.5">
              <HeartPulse size={22} strokeWidth={2.25} />
            </span>
          </Link>
          <div className="mt-8 text-center">
            <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.01em] text-text inline-flex items-center gap-1">
              <Clock size={28} className="text-amber-500 border-2 border-voltage-line rounded-2xl" />
              Application Under Review
            </h1>
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-[13px] text-amber-800">
               Thank you for applying! Our team is reviewing your application. We&apos;ll notify you via email once it is reviewed. This usually takes 24 hours. You can check back here anytime.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[7px] border border-[#d8dadd] bg-white px-7 text-[14px] font-semibold text-text transition-colors hover:bg-neutral-50"
              >
               Go to Home page
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          Tell us about your professional background.
        </p>

        {applicationStatus?.status === "CHANGES_REQUIRED" && applicationStatus.feedback.length > 0 && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="text-[13px] font-semibold text-red-800 mb-2">Changes Required</h3>
            {applicationStatus.feedback.map((f, i) => (
              <div key={i} className="text-[12px] text-red-700 mb-1">
                <span className="font-medium">{f.section}:</span> {f.message}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <StepProgress steps={STEPS} current={currentIdx} />
        </div>

        <div className="mt-2">
          {step === "personal" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t("auth.labelFirstName")}{requiredMark}</label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} placeholder={t("auth.placeholderFirstName")} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t("auth.labelLastName")}</label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} placeholder={t("auth.placeholderLastName")} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email{requiredMark}</label>
                <input type="email" value={form.email} readOnly className={inputDisabledClass} />
              </div>
              <div>
                <label className={labelClass}>{t("auth.labelPhone")}{requiredMark}</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder={t("auth.placeholderPhone")} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t("auth.labelCity")}{requiredMark}</label>
                  <select value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inputClass}>
                    <option value="">{t("auth.selectOption")}</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t("auth.labelGender")}{requiredMark}</label>
                  <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className={inputClass}>
                    <option value="">{t("auth.selectOption")}</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="button" onClick={goNext} disabled={!isStepValid} className={primaryBtnClass}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === "professional" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t("auth.labelSpecialty")}{requiredMark}</label>
                  <select value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} className={inputClass}>
                    <option value="">{t("auth.selectOption")}</option>
                    {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t("auth.labelExperience")}{requiredMark}</label>
                  <input type="number" value={form.experience} onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))} placeholder={t("auth.placeholderExperience")} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t("auth.labelFee")}{requiredMark}</label>
                <input type="number" value={form.fee} onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))} placeholder={t("auth.placeholderFee")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("auth.labelLicense")}{requiredMark}</label>
                <input type="text" value={form.license} onChange={(e) => setForm((f) => ({ ...f, license: e.target.value }))} placeholder={t("auth.placeholderLicense")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell patients about your approach and experience..."
                  rows={8}
                  className={`${inputClass} h-auto min-h-[160px] py-3 resize-y`}
                />
              </div>
              <div className="flex justify-between pt-2">
                <button type="button" onClick={goBack} className={secondaryBtnClass}>
                  <ArrowLeft size={16} /> {t("auth.backBtn")}
                </button>
                <button type="button" onClick={goNext} disabled={!isStepValid} className={primaryBtnClass}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === "documents" && (
            <div className="space-y-4">
              <h2 className="text-[18px] font-semibold text-text">Upload Documents</h2>
              <p className="text-text-light text-[13px]">Your NMC license is required for verification. Certifications are optional but recommended.</p>
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
                maxFiles={3}
              />
              <div className="flex justify-between pt-2">
                <button type="button" onClick={goBack} className={secondaryBtnClass}>
                  <ArrowLeft size={16} /> {t("auth.backBtn")}
                </button>
                <button type="button" onClick={goNext} disabled={!isStepValid} className={primaryBtnClass}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4">
              <h2 className="text-[18px] font-semibold text-text">Review Application</h2>
              <p className="text-text-light text-[13px]">Please review your details before submitting.</p>

              <div className="rounded-lg border border-[#d8dadd] bg-white p-4 space-y-3">
                <h3 className="text-[13px] font-semibold text-text">Personal Information</h3>
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <div><span className="text-text-light">First Name:</span> {form.firstName || "—"}</div>
                  <div><span className="text-text-light">Last Name:</span> {form.lastName || "—"}</div>
                  <div className="col-span-2"><span className="text-text-light">Email:</span> {form.email || "—"}</div>
                  <div><span className="text-text-light">Phone:</span> {form.phone || "—"}</div>
                  <div><span className="text-text-light">City:</span> {form.city || "—"}</div>
                  <div><span className="text-text-light">Gender:</span> {form.gender || "—"}</div>
                </div>
              </div>

              <div className="rounded-lg border border-[#d8dadd] bg-white p-4 space-y-3">
                <h3 className="text-[13px] font-semibold text-text">Professional Details</h3>
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <div><span className="text-text-light">Specialty:</span> {form.specialty || "—"}</div>
                  <div><span className="text-text-light">Experience:</span> {form.experience ? `${form.experience} years` : "—"}</div>
                  <div><span className="text-text-light">Fee:</span> {form.fee ? `NPR ${form.fee}` : "—"}</div>
                  <div><span className="text-text-light">License No:</span> {form.license || "—"}</div>
                </div>
                {form.bio && <div className="text-[13px]"><span className="text-text-light">Bio:</span> {form.bio}</div>}
              </div>

              <div className="rounded-lg border border-[#d8dadd] bg-white p-4 space-y-3">
                <h3 className="text-[13px] font-semibold text-text">Documents</h3>
                <div className="text-[13px] text-text-light space-y-1">
                  <div>NMC License: {docs.license.length > 0 ? <span className="text-green-600">{docs.license.length} uploaded</span> : <span className="text-red-500">Required</span>}</div>
                  <div>Certification: {docs.cert.length > 0 ? <span className="text-green-600">{docs.cert.length} uploaded</span> : <span className="text-text-light">Optional</span>}</div>
                </div>
              </div>

              <p className="text-[12px] leading-[1.5] text-[#666]">
                By submitting, I confirm my credentials are accurate and agree to the{" "}
                <Link href="/terms" className="underline hover:text-text">Terms of Service</Link>{" "}
                and <Link href="/privacy" className="underline hover:text-text">Privacy Policy</Link>.
              </p>

              {error && <p className="text-[12px] text-red-500">{error}</p>}

              <div className="flex justify-between pt-2">
                <button type="button" onClick={goBack} className={secondaryBtnClass}>
                  <ArrowLeft size={16} /> {t("auth.backBtn")}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={primaryBtnClass}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit application"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
