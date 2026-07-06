import Link from "next/link";
import { NAV_LINKS, RESOURCE_LINKS } from "@/lib/nav-data";
import { AppStoreBadge } from "@/components/AppStoreBadge";

export function SiteFooter() {
  return (
    <footer className="py-14 text-background/80 bg-background-dark">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid md:grid-cols-4 gap-10 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-secondary inline-block" />
            <span className="font-display text-lg text-background">Sahayatri Physio</span>
          </div>
          <p className="text-background/60">Recovery, at your doorstep.</p>
          <div className="mt-4 space-y-1 text-background/70">
            <p>care@sahayatriphysio.com</p>
            <p>+977 1 555 0199</p>
          </div>
        </div>

        <div>
          <p className="eyebrow !text-primary mb-3">Explore</p>
          <ul className="space-y-2">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className="hover:text-primary transition">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow !text-primary mb-3">Resources</p>
          <ul className="space-y-2">
            {RESOURCE_LINKS.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className="hover:text-primary transition">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow !text-primary mb-3">Get the app</p>
          <p className="text-background/60 mb-3">Track sessions, chat with your therapist, and get reminders.</p>
          <div className="flex flex-col gap-2">
            <AppStoreBadge platform="google" variant="footer" />
            <AppStoreBadge platform="apple" variant="footer" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-10 pt-6 border-t border-white/10 flex flex-wrap gap-3 justify-between text-xs text-background/50">
        <p>&copy; {new Date().getFullYear()} Sahayatri Physio. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-primary">About</Link>
          <Link href="/contact" className="hover:text-primary">Contact</Link>
          <Link href="/faq" className="hover:text-primary">FAQ</Link>
        </div>
      </div>
    </footer>
  );
}
