export function to12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function formatWhen(date: string, time: string): string {
  const d = new Date(date);
  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const dateStr = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
  return isToday ? `Today · ${to12h(time)}` : `${dateStr} · ${to12h(time)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatType(type: string): string {
  return type
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function mapSessionStatus(status: string): string {
  switch (status) {
    case "SCHEDULED": return "Confirmed";
    case "COMPLETED": return "Completed";
    case "CANCELLED": return "Cancelled";
    default: return status;
  }
}

export function npr(n: number): string {
  return `Rs ${n.toLocaleString("en-IN")}`;
}

export function isToday(date: string): boolean {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function isTomorrow(date: string): boolean {
  const d = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate()
  );
}

export function isPast(date: string, time: string): boolean {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d < new Date();
}

export function hoursUntil(date: string, time: string): number {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return (d.getTime() - Date.now()) / 3600000;
}
