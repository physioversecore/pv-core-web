"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { npr, formatDate } from "@/utils/format";
import type { Therapist } from "@/types";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";

const TIMES = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

export function BookingModal({ therapist, onClose }: { therapist: Therapist; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [pay, setPay] = useState("esewa");
  const [ref, setRef] = useState<string | null>(null);
  const { t } = useLang();

  const confirm = () => {
    if (!date || !time || !address) return toast.error(t("booking.errorCompleteFields"));
    setRef("BK-" + Math.random().toString(36).slice(2, 8).toUpperCase());
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-text/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background rounded-3xl border border-border shadow-2xl p-7 max-h-[92vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-surface"><X size={18} /></button>

        {step === 3 && ref ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-surface grid place-items-center mx-auto mb-3 text-3xl">✓</div>
            <p className="font-display text-2xl mb-1">{t("booking.bookingConfirmed")}</p>
            <p className="text-text-light text-sm mb-1">{t("booking.reference")}</p>
            <p className="font-mono text-secondary font-semibold mb-4">{ref}</p>
            <div className="text-sm text-text-light mb-5">
              {therapist.name} · {formatDate(date)} at {time}
            </div>
            <button onClick={onClose} className="btn-secondary w-full">{t("common.done")}</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={therapist.name} size={48} />
              <div>
                <div className="font-medium">{therapist.name}</div>
                <div className="text-xs text-text-light">{therapist.specialty} · {npr(therapist.price)}{t("booking.perSession")}</div>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-3">
                <p className="eyebrow">{t("booking.stepPickSlot")}</p>
                <div>
                  <label className="text-xs font-medium text-text-light">{t("booking.date")}</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white" />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-light">{t("booking.timeSlot")}</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {TIMES.map((t) => (
                      <button key={t} onClick={() => setTime(t)} className={`py-2 rounded-xl text-sm border ${time === t ? "border-secondary bg-secondary text-white" : "border-border bg-white text-text hover:border-secondary"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-light">{t("booking.homeAddress")}</label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white" placeholder={t("booking.placeholderAddress")} />
                </div>
                <button onClick={() => date && time && address ? setStep(2) : toast.error(t("booking.errorCompleteFields"))} className="btn-secondary w-full">{t("booking.review")}</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <p className="eyebrow">{t("booking.stepReviewPay")}</p>
                <div className="card-soft p-4 space-y-1 text-sm">
                  <Row label={t("booking.therapist")} value={therapist.name} />
                  <Row label={t("booking.date")} value={formatDate(date)} />
                  <Row label={t("booking.time")} value={time} />
                  <Row label={t("booking.address")} value={address} />
                  <Row label={t("booking.fee")} value={npr(therapist.price)} bold />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-light">{t("booking.payment")}</label>
                  <div className="grid gap-2 mt-1">
                    {[{ id: "esewa", l: t("booking.esewa") }, { id: "khalti", l: t("booking.khalti") }, { id: "cash", l: t("booking.cashOnVisit") }].map((m) => (
                      <label key={m.id} className={`p-2.5 rounded-xl border cursor-pointer text-sm ${pay === m.id ? "border-secondary bg-surface" : "border-border bg-white"}`}>
                        <input type="radio" name="pay" checked={pay === m.id} onChange={() => setPay(m.id)} className="mr-2" />
                        {m.l}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1">{t("common.back")}</button>
                  <button onClick={confirm} className="btn-secondary flex-1">{t("booking.confirmBooking")}</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${bold ? "font-semibold text-text pt-1 border-t border-border" : "text-text-light"}`}>
      <span className="text-xs uppercase tracking-wider">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
