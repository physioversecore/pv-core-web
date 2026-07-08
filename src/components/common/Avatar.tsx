export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .replace(/Dr\.?\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  const hue = Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % 360;
  return (
    <div
      className="rounded-full grid place-items-center font-semibold text-white shrink-0"
      style={{ width: size, height: size, background: `hsl(${hue} 35% 40%)`, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}
