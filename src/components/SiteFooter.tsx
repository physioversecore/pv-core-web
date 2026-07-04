import Link from "next/link";

const QUICK = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/services", label: "Services" },
  { to: "/therapists", label: "Therapists" },
  { to: "/find", label: "Find a Therapist" },
  { to: "/app", label: "App" },
] as const;

const RESOURCES = [
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQ" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/about", label: "About us" },
  { to: "/contact", label: "Contact us" },
] as const;

export function SiteFooter() {
  return (
    <footer className="py-14 text-cream/80" style={{ background: "#0D1A15" }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid md:grid-cols-4 gap-10 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-pine inline-block" />
            <span className="font-display text-lg text-cream">Sahayatri Physio</span>
          </div>
          <p className="text-cream/60">Recovery, at your doorstep.</p>
          <div className="mt-4 space-y-1 text-cream/70">
            <p>care@sahayatriphysio.com</p>
            <p>+977 1 555 0199</p>
          </div>
        </div>

        <div>
          <p className="eyebrow !text-amber mb-3">Explore</p>
          <ul className="space-y-2">
            {QUICK.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className="hover:text-amber transition">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow !text-amber mb-3">Resources</p>
          <ul className="space-y-2">
            {RESOURCES.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className="hover:text-amber transition">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow !text-amber mb-3">Get the app</p>
          <p className="text-cream/60 mb-3">Track sessions, chat with your therapist, and get reminders.</p>
          <div className="flex flex-col gap-2">
            <a href="#" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-xs">
              <span className="opacity-70">GET IT ON</span> <span className="font-semibold">Google Play</span>
            </a>
            <a href="#" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-xs">
              <span className="opacity-70">Download on the</span> <span className="font-semibold">App Store</span>
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-10 pt-6 border-t border-white/10 flex flex-wrap gap-3 justify-between text-xs text-cream/50">
        <p>&copy; {new Date().getFullYear()} Sahayatri Physio. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-amber">About</Link>
          <Link href="/contact" className="hover:text-amber">Contact</Link>
          <Link href="/faq" className="hover:text-amber">FAQ</Link>
        </div>
      </div>
    </footer>
  );
}
