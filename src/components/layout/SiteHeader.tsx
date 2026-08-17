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

  useEffect(() => {
    if (!mobileOpen) return;

    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    (body.style as any).webkitOverflowScrolling = "none";

    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.touchAction = "";
      (body.style as any).webkitOverflowScrolling = "";
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  const navLabel = (to: string): string => {
    const map: Record<string, string> = {
      "/how-it-works": t("nav.howItWorks"),
      "/services": t("nav.services"),
      "/find-a-therapist": t("nav.findTherapist"),
      "/packages": t("nav.packages"),
      "/clinics": t("nav.clinics"),
    };
    return map[to] ?? "";
  };

  const goDash = () => {
    if (!user) return router.push("/login");
    router.push(user.role === "patient" ? "/patient" : user.role === "therapist" ? "/therapist" : "/admin");
  };

  const darkText = !scrolled && variant === "hero-light";
  const linkCls = `text-[14px] font-sans font-medium whitespace-nowrap transition-colors ${
    darkText ? "text-text hover:text-primary" : "text-white hover:text-voltage-lime"
  }`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ease-in-out will-change-[padding] ${
        scrolled ? "pt-3 px-3 sm:px-[calc((100%-1000px)/2)]" : "pt-0 px-0"
      }`}
    >
      <div
        className={`relative z-30 w-full flex items-center justify-between transition-all duration-300 ease-in-out ${
          scrolled
            ? "h-14 rounded-2xl bg-mid-abyss/80 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)] px-4 sm:px-6"
            : "h-16 rounded-2xl bg-transparent border border-transparent px-5 lg:px-8"
        }`}
      >
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={t("header.brand")}>
          <span className="w-6 h-6 rounded-full bg-voltage-lime inline-block" />
          <span className="font-display text-lg font-semibold text-voltage-lime whitespace-nowrap">
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
              darkText ? "text-text hover:text-primary" : "text-white hover:text-voltage-lime"
            }`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <button
                onClick={goDash}
                className="h-9 inline-flex items-center px-4 rounded-lg bg-voltage-lime text-carbon-ink text-sm font-semibold transition hover:opacity-90"
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
                  className="h-9 inline-flex items-center px-4 rounded-lg bg-voltage-lime text-carbon-ink text-sm font-semibold transition hover:opacity-90"
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
          className="md:hidden fixed inset-0 z-20 bg-abyss-deep/90"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {mobileOpen && (
        <div
          className="md:hidden mx-3 mt-2 max-h-[calc(100dvh-80px)] overflow-y-auto overscroll-contain rounded-2xl bg-mid-abyss/92 border border-white/10 p-4 space-y-3 relative z-40"
          onClick={() => setMobileOpen(false)}
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className="block py-2 text-sm font-medium text-white transition-colors hover:text-voltage-lime"
            >
              {navLabel(l.to)}
            </Link>
          ))}
          <hr className="border-white/10" />
          {user ? (
            <button
              onClick={goDash}
              className="w-full h-10 rounded-lg bg-voltage-lime text-carbon-ink text-sm font-semibold transition hover:opacity-90"
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
                className="w-full text-center h-10 rounded-lg bg-voltage-lime text-carbon-ink text-sm font-semibold transition hover:opacity-90 inline-flex items-center justify-center"
              >
                {t("header.signUp")}
              </Link>
              <button
                onClick={() => {
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
