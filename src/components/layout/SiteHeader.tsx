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
      "/find-a-therapist": t("nav.findTherapist"),
      "/app": t("nav.app"),
    };
    return map[to] ?? "";
  };

  const goDash = () => {
    if (!user) return router.push("/login");
    router.push(user.role === "patient" ? "/patient" : user.role === "therapist" ? "/therapist" : "/admin");
  };

  const textCls = scrolled ? "text-text-light" : "text-white/80";
  const borderCls = scrolled ? "border-border" : "border-white/20";
  const panelBg = scrolled ? "bg-background/98" : "bg-background-dark/98";

  return (
    <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${scrolled ? "bg-background/92 backdrop-blur-md border-b border-border" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-secondary inline-block" />
          <span className={`font-display text-lg transition-colors ${scrolled ? "text-text" : "text-white"}`}>{t("header.brand")}</span>
        </Link>

        <nav className={`hidden md:flex items-center gap-6 text-sm transition-colors ${textCls}`}>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className="hover:text-primary transition-colors"
            >
              {navLabel(l.to)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LangSwitcher />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${textCls} hover:text-primary`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <button onClick={goDash} className="btn-secondary !py-2 !px-4 text-sm">{t("header.openDashboard")}</button>
            ) : (
              <>
                <Link
                  href="/signup"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition ${scrolled ? "border-secondary text-secondary hover:bg-secondary hover:text-white" : "border-white/60 text-white hover:bg-white/10"}`}
                >
                  {t("header.signUp")}
                </Link>
                <Link
                  href="/login"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition ${scrolled ? "border-secondary text-secondary hover:bg-secondary hover:text-white" : "border-white/60 text-white hover:bg-white/10"}`}
                >
                  {t("header.logIn")}
                </Link>
                <button onClick={() => openAuth("signup", "patient")} className="btn-primary !py-2 !px-4 text-sm">{t("header.bookNow")}</button>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className={`md:hidden border-t ${borderCls} ${panelBg} backdrop-blur-md`}>
          <div className="max-w-7xl mx-auto px-5 py-4 space-y-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                href={l.to}
                className={`block py-2 text-sm font-medium transition-colors ${textCls} hover:text-primary`}
              >
                {navLabel(l.to)}
              </Link>
            ))}
            <hr className={borderCls} />
            {user ? (
              <button onClick={goDash} className="w-full btn-secondary !py-2.5 !px-4 text-sm mt-2">{t("header.openDashboard")}</button>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link href="/signup" className={`w-full text-center px-4 py-2.5 rounded-full text-sm font-semibold border transition ${scrolled ? "border-secondary text-secondary" : "border-white/60 text-white"}`}>{t("header.signUp")}</Link>
                <Link href="/login" className={`w-full text-center px-4 py-2.5 rounded-full text-sm font-semibold border transition ${scrolled ? "border-secondary text-secondary" : "border-white/60 text-white"}`}>{t("header.logIn")}</Link>
                <button onClick={() => { setMobileOpen(false); openAuth("signup", "patient"); }} className="w-full btn-primary !py-2.5 !px-4 text-sm">{t("header.bookNow")}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
