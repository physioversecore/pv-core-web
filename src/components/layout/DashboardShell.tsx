"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { LogOut, Menu, ShoppingCart, X } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import { Avatar } from "@/components/common/Avatar";
import { CartDrawer } from "@/components/modals/CartDrawer";
import { NotificationBell } from "@/components/common/NotificationBell";
import { LangSwitcher } from "@/components/common/LangSwitcher";
import { useLang } from "@/context/i18n";
import type { NavItem } from "@/types";

export function DashboardShell({
  title,
  nav,
  children,
  showCart = false,
}: {
  title: string;
  nav: NavItem[];
  children: ReactNode;
  showCart?: boolean;
}) {
  const { t } = useLang();
  const { user, logout } = useAuth();
  const { count, setOpen } = useCart();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-secondary text-text-inverse flex flex-col transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${mobileOpen ? "" : "lg:fixed"}`}
      >
        <div className="p-5 flex items-center justify-between border-b border-text-inverse/10 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-primary" />
            <span className="font-display text-lg">{t("header.brand")}</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1"><X size={18} /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((n, i) => {
            const active = pathname === n.to || (n.to !== nav[0].to && pathname.startsWith(n.to));
            const prevGroup = i > 0 ? nav[i - 1].group : undefined;
            const showGroupLabel = n.group && n.group !== prevGroup;
            return (
              <div key={n.to}>
                {showGroupLabel && (
                  <div className="eyebrow mt-4 mb-1 px-3 text-text-inverse/50">{n.group}</div>
                )}
                <Link
                  href={n.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    active ? "bg-text-inverse/15 text-text-inverse" : "text-text-inverse/70 hover:bg-text-inverse/10 hover:text-text-inverse"
                  }`}
                >
                  <span className="w-5 grid place-items-center">{n.icon}</span>
                  {n.label}
                  {n.badge != null && (
                    <span className="ml-auto bg-primary/20 text-primary text-[10px] font-bold min-w-[18px] h-[18px] rounded-full grid place-items-center font-mono">
                      {n.badge}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t border-text-inverse/10 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={user?.name ?? "User"} size={36} />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.name ?? "Guest"}</div>
              <div className="text-xs text-text-inverse/60 capitalize">{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-inverse/80 hover:bg-text-inverse/10">
            <LogOut size={15} /> {t("common.logOut")}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col lg:ml-64">
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 backdrop-blur shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-surface"><Menu size={18} /></button>
            <h1 className="font-display text-xl truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            {user && <NotificationBell role={user.role} />}
            {showCart && (
              <button onClick={() => setOpen(true)} className="relative p-2.5 rounded-full hover:bg-surface" aria-label={t("cart.title")}>
                <ShoppingCart size={18} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-text-inverse text-[10px] font-bold w-5 h-5 rounded-full grid place-items-center">{count}</span>
                )}
              </button>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
      </div>

      {showCart && <CartDrawer />}
    </div>
  );
}
