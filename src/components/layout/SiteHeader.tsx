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

const VOLT = "#d3fb52";
const GLASS_DEEP = "rgba(5,35,38,0.92)";

export function SiteHeader({
  variant = "solid",
}: {
  variant?: "hero" | "hero-light" | "solid";
}) {
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
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
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
    };
    return map[to] ?? "";
  };

  const goDash = () => {
    if (!user) return router.push("/login");
    router.push(user.role === "patient" ? "/patient" : user.role === "therapist" ? "/therapist" : "/admin");
  };

  const darkText = !scrolled && variant === "hero-light";
  const linkCls = `text-[14px] font-sans font-medium whitespace-nowrap transition-colors ${
    darkText ? "text-text hover:text-primary" : "text-white hover:text-[#d3fb52]"
  }`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ease-in-out will-change-[padding] ${
        scrolled ? "pt-3 px-3 sm:px-[calc((100%-1000px)/2)]" : "pt-0 px-0"
      }`}
    >
      <div
        className={`w-full flex items-center justify-between transition-all duration-300 ease-in-out ${
          scrolled
            ? "h-14 rounded-2xl bg-[rgba(5,35,38,0.8)] backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)] px-4 sm:px-6"
            : "h-16 rounded-2xl bg-transparent border border-transparent px-5 lg:px-8"
        }`}
      >
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={t("header.brand")}>
          <span className="w-6 h-6 rounded-full inline-block" style={{ background: VOLT }} />
          <span className="font-display text-lg font-semibold whitespace-nowrap" style={{ color: VOLT }}>
            {t("header.brand")}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} href={l.to} className={linkCls}>
              {navLabel(l.to)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <LangSwitcher dark />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              darkText ? "text-text hover:text-primary" : "text-white hover:text-[#d3fb52]"
            }`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <button
                onClick={goDash}
                className="h-9 inline-flex items-center px-4 rounded-lg text-sm font-semibold transition hover:opacity-90"
                style={{ background: VOLT, color: "#000" }}
              >
                {t("header.openDashboard")}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`h-9 inline-flex items-center px-4 rounded-lg text-sm font-medium transition-colors ${
                    darkText
                      ? "text-text border border-border hover:bg-surface"
                      : "text-white border border-white/70 hover:bg-white/10"
                  }`}
                >
                  {t("header.logIn")}
                </Link>
                <Link
                  href="/signup"
                  className="h-9 inline-flex items-center px-4 rounded-lg text-sm font-semibold transition hover:opacity-90"
                  style={{ background: VOLT, color: "#000" }}
                >
                  {t("header.signUp")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden mx-3 mt-2 rounded-2xl border border-white/10 p-4 space-y-3"
          style={{ background: GLASS_DEEP }}
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className="block py-2 text-sm font-medium text-white transition-colors hover:text-[#d3fb52]"
            >
              {navLabel(l.to)}
            </Link>
          ))}
          <hr className="border-white/10" />
          {user ? (
            <button
              onClick={goDash}
              className="w-full h-10 rounded-lg text-sm font-semibold transition hover:opacity-90"
              style={{ background: VOLT, color: "#000" }}
            >
              {t("header.openDashboard")}
            </button>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/login"
                className="w-full text-center h-10 rounded-lg text-sm font-medium text-white border border-white/70 transition-colors hover:bg-white/10 inline-flex items-center justify-center"
              >
                {t("header.logIn")}
              </Link>
              <Link
                href="/signup"
                className="w-full text-center h-10 rounded-lg text-sm font-semibold transition hover:opacity-90 inline-flex items-center justify-center"
                style={{ background: VOLT, color: "#000" }}
              >
                {t("header.signUp")}
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openAuth("signup", "patient");
                }}
                className="w-full text-center h-10 rounded-lg text-sm font-semibold text-white border border-white/20 transition-colors hover:bg-white/10"
              >
                {t("header.bookNow")}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
