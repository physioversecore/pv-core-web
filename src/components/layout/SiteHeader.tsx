"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth";
import { useAuthModal } from "@/context/auth-modal";
import { NAV_LINKS } from "@/constants/navigation";
import { LangSwitcher } from "@/components/common/LangSwitcher";
import { useLang } from "@/context/i18n";
import { Menu, X } from "lucide-react";

export function SiteHeader({ variant = "solid" }: { variant?: "hero" | "solid" }) {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(variant === "solid");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { openAuth } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();

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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLabel = (to: string): string => {
    const map: Record<string, string> = {
      "/how-it-works": t("nav.howItWorks"),
      "/services": t("nav.services"),
      "/for-physiotherapists": t("nav.forPhysiotherapists"),
    };
    return map[to] ?? "";
  };

  const goDash = () => {
    if (!user) return router.push("/login");
    router.push(user.role === "patient" ? "/patient" : user.role === "therapist" ? "/therapist" : "/admin");
  };

  const pill = scrolled
    ? "bg-paper-bright/95 border-carbon-soft/20 shadow-[3px_3px_0_var(--color-carbon-soft)]"
    : "bg-paper-bright/85 border-carbon-soft/20";

  return (
    <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${scrolled ? "bg-paper/90 backdrop-blur-md" : "bg-transparent"}`}>
      <nav className={`max-w-7xl mx-auto my-3 px-4 lg:px-6 h-14 flex items-center justify-between rounded-full border-2 border-carbon-soft transition-all duration-300 ${pill}`}>
        <Link href="/" className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-volt border-2 border-carbon-soft inline-block" />
          <span className="font-display font-extrabold text-lg tracking-tighter text-carbon">{t("header.brand")}</span>
        </Link>

        <div className={`hidden md:flex items-center gap-6 ${scrolled ? "text-carbon" : "text-carbon"}`}>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className={`label-ink transition-colors ${pathname === l.to || pathname.startsWith(l.to + "/")
                ? "text-carbon border-b-2 border-volt"
                : "text-text-light hover:text-carbon"}`}
            >
              {navLabel(l.to)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LangSwitcher />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg text-carbon hover:bg-surface transition-colors`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <button onClick={goDash} className="btn-carbon !py-2 !px-4 text-sm">{t("header.openDashboard")}</button>
            ) : (
              <>
                <Link href="/login" className="btn-outline-ink !py-2 !px-4 text-sm">{t("header.logIn")}</Link>
                <button onClick={() => openAuth("signup", "patient")} className="btn-carbon !py-2.5 !px-5 text-sm">{t("header.bookNow")}</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden mx-4 rounded-2xl border-2 border-carbon-soft bg-paper-bright shadow-[3px_3px_0_var(--color-carbon-soft)]">
          <div className="px-5 py-4 space-y-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                href={l.to}
                className={`block py-2 label-ink transition-colors ${pathname === l.to ? "text-carbon border-b-2 border-volt" : "text-text-light"}`}
              >
                {navLabel(l.to)}
              </Link>
            ))}
            <Link
              href="/contact"
              className={`block py-2 label-ink transition-colors ${pathname === "/contact" ? "text-carbon border-b-2 border-volt" : "text-text-light"}`}
            >
              {t("nav.contactUs")}
            </Link>
            <hr className="border-carbon-soft" />
            {user ? (
              <button onClick={goDash} className="w-full btn-carbon !py-2.5 !px-4 text-sm mt-2">{t("header.openDashboard")}</button>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link href="/login" className="w-full text-center btn-outline-ink !py-2.5 !px-4 text-sm">{t("header.logIn")}</Link>
                <button onClick={() => { setMobileOpen(false); openAuth("signup", "patient"); }} className="w-full btn-carbon !py-2.5 !px-4 text-sm">{t("header.bookNow")}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
