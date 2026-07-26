"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAdminRefunds, useCreateManualCase } from "@/hooks/useAdminRefunds";
import type { RefundReason, ManualCasePayload } from "@/services/api/admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LogManualCaseModalProps {
  open: boolean;
  onClose: () => void;
}

const REFUND_REASONS: { value: RefundReason; label: string }[] = [
  { value: "No-show", label: "No-show" },
  { value: "Double charge", label: "Double charge" },
  { value: "Service quality", label: "Service quality" },
  { value: "Cancellation", label: "Cancellation" },
];

const COMPLAINT_CATEGORIES = [
  "Billing dispute",
  "Late arrival",
  "Unprofessional conduct",
  "Repeated no-shows",
  "Safety concern at home",
  "Service quality",
];

const ADMIN_STAFF = [
  { value: "admin-1", label: "Admin User" },
];

export function LogManualCaseModal({ open, onClose }: LogManualCaseModalProps) {
  const { mutate, isPending } = useCreateManualCase();

  const [patientId, setPatientId] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState<RefundReason | "">("");
  const [assigneeId, setAssigneeId] = useState("");
  const [notes, setNotes] = useState("");
  const [alsoCreateDispute, setAlsoCreateDispute] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState("");
  const [disputePriority, setDisputePriority] = useState("Normal");
  const [disputeDescription, setDisputeDescription] = useState("");

  const reset = () => {
    setPatientId("");
    setBookingId("");
    setAmount("");
    setReason("");
    setAssigneeId("");
    setNotes("");
    setAlsoCreateDispute(false);
    setDisputeCategory("");
    setDisputePriority("Normal");
    setDisputeDescription("");
  };

  const handleSubmit = () => {
    if (!patientId.trim() || !bookingId.trim() || !amount || !reason) return;
    if (alsoCreateDispute) {
      if (!disputeCategory) {
        toast.error("Please select a dispute category");
        return;
      }
      if (!disputeDescription || disputeDescription.length < 20) {
        toast.error("Dispute description must be at least 20 characters");
        return;
      }
    }

    const payload: ManualCasePayload = {
      patientId: patientId.trim(),
      bookingId: bookingId.trim(),
      amount: Number(amount),
      reason,
      assigneeId: assigneeId || undefined,
      notes: notes || undefined,
      alsoCreateDispute,
      disputeCategory: alsoCreateDispute ? disputeCategory : undefined,
      disputePriority: alsoCreateDispute ? disputePriority : undefined,
      disputeDescription: alsoCreateDispute ? disputeDescription : undefined,
    };

    mutate(payload, {
      onSuccess: () => {
        toast.success("Case logged successfully");
        reset();
        onClose();
      },
      onError: () => {
        toast.error("Failed to log case");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Log Manual Case</DialogTitle>
          <DialogDescription>
            Record a phone-call or walk-in case. Creates a refund record, optionally linked to a dispute.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">Patient ID</label>
            <Input
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter patient ID"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">Booking ID</label>
            <Input
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter booking ID"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">Refund Amount (NPR)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">Reason</label>
            <Select value={reason} onValueChange={(v) => setReason(v as RefundReason)}>
              <SelectTrigger className="h-9 rounded-full border-border text-sm">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {REFUND_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">Assign To</label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className="h-9 rounded-full border-border text-sm">
                <SelectValue placeholder="Select admin (optional)" />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_STAFF.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">Call Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Patient called about a no-show, requested refund"
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm min-h-[80px] resize-y"
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="alsoDispute"
              checked={alsoCreateDispute}
              onChange={(e) => setAlsoCreateDispute(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="alsoDispute" className="text-sm cursor-pointer">
              Also open a dispute record for this
            </label>
          </div>

          {alsoCreateDispute && (
            <>
              <div>
                <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">Dispute Category</label>
                <Select value={disputeCategory} onValueChange={setDisputeCategory}>
                  <SelectTrigger className="h-9 rounded-full border-border text-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">Dispute Priority</label>
                <Select value={disputePriority} onValueChange={setDisputePriority}>
                  <SelectTrigger className="h-9 rounded-full border-border text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">Dispute Description (min 20 chars)</label>
                <textarea
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Describe the dispute in detail..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm min-h-[80px] resize-y"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-2">
          <button
            onClick={() => { reset(); onClose(); }}
            className="px-4 py-2 rounded-xl text-sm text-text-light hover:bg-muted transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !patientId.trim() || !bookingId.trim() || !amount || !reason}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-secondary text-white hover:opacity-90 transition cursor-pointer disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Log Case"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
