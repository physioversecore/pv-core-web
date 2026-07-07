interface StatusBadgeProps {
  status: "Confirmed" | "Pending" | "completed" | "cancelled";
  labels?: { confirmed?: string; pending?: string };
}

const defaultLabels = { confirmed: "Confirmed", pending: "Pending" };

export function StatusBadge({ status, labels }: StatusBadgeProps) {
  const t = { ...defaultLabels, ...labels };
  const isConfirmed = status === "Confirmed" || status === "completed";
  return (
    <span
      className={`chip ${
        isConfirmed ? "!bg-secondary/10 !text-secondary" : "!bg-primary/15 !text-primary"
      }`}
    >
      {isConfirmed ? t.confirmed : t.pending}
    </span>
  );
}
