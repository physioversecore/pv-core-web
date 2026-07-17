"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AffectedPatient {
  name: string;
  date: string;
  time: string;
}

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmVariant?: "default" | "destructive";
  onConfirm?: () => void;
  isPending?: boolean;
  readOnly?: boolean;
  affectedPatients?: AffectedPatient[];
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "destructive",
  onConfirm,
  isPending,
  readOnly,
  affectedPatients,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {affectedPatients && affectedPatients.length > 0 && (
          <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-3 py-2 text-left font-medium text-text-light">
                    Patient
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-text-light">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-text-light">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {affectedPatients.map((p, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-text">{p.name}</td>
                    <td className="px-3 py-2 text-text-light">{p.date}</td>
                    <td className="px-3 py-2 text-text-light">{p.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DialogFooter>
          {readOnly ? (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant={confirmVariant}
                onClick={onConfirm}
                disabled={isPending}
              >
                {isPending ? "Working..." : confirmLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
