"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/AuthModal";
import { LangSwitcher } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

const NAV_LINKS = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/services", label: "Services" },
  { to: "/therapists", label: "Therapists" },
  { to: "/find", label: "Find a Therapist" },
  { to: "/app", label: "App" },
] as const;

export function SiteHeader({ variant = "solid" }: { variant?: "hero" | "solid" }) {
  const [scrolled, setScrolled] = useState(variant === "solid");
  const [auth, setAuth] = useState<null | "login" | "signup">(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (variant === "solid") {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const goDash = () => {
    if (!user) return setAuth("login");
    router.push(user.role === "patient" ? "/patient" : user.role === "therapist" ? "/therapist" : "/admin");
  };

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${scrolled ? "bg-cream/92 backdrop-blur-md border-b border-border" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pine inline-block" />
            <span className={`font-display text-lg transition-colors ${scrolled ? "text-forest" : "text-white"}`}>Sahayatri Physio</span>
          </Link>
          <nav className={`hidden md:flex items-center gap-6 text-sm transition-colors ${scrolled ? "text-slate" : "text-white/80"}`}>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                href={l.to}
                className="hover:text-amber transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            {user ? (
              <button onClick={goDash} className="btn-pine !py-2 !px-4 text-sm">Open dashboard</button>
            ) : (
              <>
                <button
                  onClick={() => setAuth("login")}
                  className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition ${scrolled ? "border-pine text-pine hover:bg-pine hover:text-white" : "border-white/60 text-white hover:bg-white/10"}`}
                >
                  Log in
                </button>
                <button onClick={() => setAuth("signup")} className="btn-primary !py-2 !px-4 text-sm">Book now</button>
              </>
            )}
          </div>
        </div>
      </header>
      <AuthModal open={auth !== null} mode={auth ?? "login"} onClose={() => setAuth(null)} />
    </>
  );
}
