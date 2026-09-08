"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminPackages } from "@/hooks/useAdminPackages";
import type { Package } from "@/types";
import type { CreatePackagePayload } from "@/services/api/admin";

interface PackageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pkg?: Package | null;
}

interface FormState {
  name: string;
  tag: string;
  price: string;
  cadence: string;
  blurb: string;
  sessionCount: string;
  validityDays: string;
  featured: boolean;
  points: string[];
}

export function PackageFormDialog({ open, onOpenChange, pkg }: PackageFormDialogProps) {
  const isEdit = !!pkg;
  const { createPackage, isCreating, updatePackage, isUpdating } = useAdminPackages();

  const [form, setForm] = useState<FormState>(() =>
    pkg
      ? {
          name: pkg.name,
          tag: pkg.tag,
          price: String(pkg.price),
          cadence: pkg.cadence,
          blurb: pkg.blurb,
          sessionCount: String(pkg.sessionCount),
          validityDays: String(pkg.validityDays),
          featured: pkg.featured,
          points: [...pkg.points],
        }
      : {
          name: "",
          tag: "",
          price: "",
          cadence: "/ package",
          blurb: "",
          sessionCount: "10",
          validityDays: "30",
          featured: false,
          points: [""],
        },
  );

  // Reset form when opening for a different target
  const [lastKey, setLastKey] = useState<string>("__init__");
  const targetKey = pkg?.id ?? "new";
  if (targetKey !== lastKey && open) {
    setLastKey(targetKey);
    setForm(
      pkg
        ? {
            name: pkg.name,
            tag: pkg.tag,
            price: String(pkg.price),
            cadence: pkg.cadence,
            blurb: pkg.blurb,
            sessionCount: String(pkg.sessionCount),
            validityDays: String(pkg.validityDays),
            featured: pkg.featured,
            points: [...pkg.points],
          }
        : {
            name: "",
            tag: "",
            price: "",
            cadence: "/ package",
            blurb: "",
            sessionCount: "10",
            validityDays: "30",
            featured: false,
            points: [""],
          },
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updatePoint = (i: number, value: string) =>
    set(
      "points",
      form.points.map((p, idx) => (idx === i ? value : p)),
    );

  const addPoint = () => set("points", [...form.points, ""]);
  const removePoint = (i: number) =>
    set("points", form.points.length > 1 ? form.points.filter((_, idx) => idx !== i) : [""]);

  const buildPayload = (): CreatePackagePayload => ({
    name: form.name.trim(),
    tag: form.tag.trim(),
    price: Number(form.price) || 0,
    cadence: form.cadence,
    blurb: form.blurb.trim(),
    sessionCount: Number(form.sessionCount) || 10,
    validityDays: Number(form.validityDays) || 30,
    featured: form.featured,
    points: form.points.map((p) => p.trim()).filter(Boolean),
  });

  const isValid =
    form.name.trim() &&
    form.tag.trim() &&
    Number(form.price) > 0 &&
    form.blurb.trim() &&
    form.points.some((p) => p.trim());

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await updatePackage({ id: pkg!.id, data: buildPayload() });
        toast.success("Package updated");
      } else {
        await createPackage(buildPayload());
        toast.success("Package created");
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to save package");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Package" : "Add Package"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this package."
              : "Create a new prepaid session bundle."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Stroke & Neuro Recovery"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tag</Label>
              <Input
                value={form.tag}
                onChange={(e) => set("tag", e.target.value)}
                placeholder="Neuro Recovery"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Price (Rs)</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="24000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cadence</Label>
              <Input
                value={form.cadence}
                onChange={(e) => set("cadence", e.target.value)}
                placeholder="/ package"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Number of Sessions</Label>
              <Input
                type="number"
                value={form.sessionCount}
                onChange={(e) => set("sessionCount", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Validity (Days)</Label>
              <Input
                type="number"
                value={form.validityDays}
                onChange={(e) => set("validityDays", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Blurb</Label>
            <Textarea
              value={form.blurb}
              onChange={(e) => set("blurb", e.target.value)}
              rows={2}
              placeholder="Short description of the package"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Points / What's included</Label>
            {form.points.map((point, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={point}
                  onChange={(e) => updatePoint(i, e.target.value)}
                  placeholder={`Point ${i + 1}`}
                />
                {form.points.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePoint(i)}
                    className="shrink-0 h-9 w-9"
                  >
                    <X size={15} />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addPoint} className="mt-1">
              <Plus size={14} className="mr-1" /> Add point
            </Button>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Featured (Most Popular)
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isCreating || isUpdating}>
            {isCreating || isUpdating ? "Saving..." : isEdit ? "Save Changes" : "Create Package"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
