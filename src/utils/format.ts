export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const npr = (n: number) => `Rs ${n.toLocaleString("en-IN")}`;

export function mapSessionStatus(status: string): string {
  switch (status) {
    case "SCHEDULED": return "Confirmed";
    case "COMPLETED": return "Completed";
    case "CANCELLED": return "Cancelled";
    default: return status;
  }
}
