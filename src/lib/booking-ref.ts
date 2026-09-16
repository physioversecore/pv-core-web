export function bookingRef(id?: string | null): string {
  if (!id) return "bk-—";
  const suffix = id.slice(-8).toUpperCase();
  return `bk-${suffix}`;
}
